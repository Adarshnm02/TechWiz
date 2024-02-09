const express = require('express')
const { mongoose, Types } = require('mongoose')
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const sendMail = require('../../util/sendMail')
const User = require('../../models/userModel')
const userOTP = require('../../models/userOtpModel')
const Product = require('../../models/productModel')
const Category = require('../../models/categoryModel')




let salt;

async function generateSalt() {
    salt = await bcrypt.genSalt(10)
}

generateSalt()



function generateReferralCode(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let referralCode = '';

    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        referralCode += characters.charAt(randomIndex);
    }

    return referralCode;
}

const securePassword = async (password) => {

    try {

        const passwordHash = await bcrypt.hash(password, 10)
        return passwordHash;

    } catch (error) {
        res.render("error/internalError", { error })
    }

}
function isValidPassword(password) {
    const passwordRegex = /^(?=.*[!@#$%^&*(),.?":{}|<>])(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
    return passwordRegex.test(password);
}




module.exports = {

    login(req, res) {
        if (!req.session.user) {
            res.render('user/user_login')
        }
    },


    loadSignup(req, res) {
        try {
            res.render('user/userSignup')
        } catch (error) {
            console.log(error.message);
        }
    },

    loadBlog(req, res) {
        res.render('user/blog')
    },


    logout(req, res) {
        try {
            req.session.destroy();
            res.redirect('/')

        } catch (err) {
            console.log(err);
            res.render('user/500')
        }
    },


    async loadHome(req, res) {
        try {
            const session = req.session.user;
            const page = parseInt(req.query.page) || 1;
            const limit = 12;
            const skip = (page - 1) * limit;

            let products;
            let latestPrd = [];

            if (req.query.query) {
                products = await Product.find({
                    product_name: { $regex: ".*" + req.query.query + ".*", $options: "i" },
                    is_delete: false
                }).skip(skip).limit(limit).sort({ _id: -1 });
            } else {
                products = await Product.aggregate([
                    {
                        $match: { is_delete: false }
                    },
                    {
                        $lookup: {
                            from: 'productcategories',
                            localField: 'category',
                            foreignField: '_id',
                            as: 'category'
                        }
                    },
                    {
                        $unwind: '$category'
                    },
                    {
                        $match: { 'category.is_disable': false }
                    },
                    {
                        $sort: { _id: -1 }
                    },
                    {
                        $skip: skip
                    },
                    {
                        $limit: limit
                    }
                ]);

                latestPrd = await Product
                    .find({ is_delete: false })
                    .limit(limit)
                    .sort({ _id: 1 })
            }

            const categorys = await Category.find({});
            const user = await User.findById(session);
            const cartLen = user && user.cart ? user.cart.length : 0;

            // Count total products for pagination calculation
            const totalCount = await Product.countDocuments({ is_delete: false });
            const totalPages = Math.ceil(totalCount / limit);

            res.render('user/index', { products, session, currentPage: page, totalPages, totalCount, latestPrd, cartLen, categorys });


        } catch (err) {
            console.log("Error From loadHome", err);
            res.render("user/500");
        }
    },

    async loadShop(req, res) {
        try {
            const session = req.session.user;
            const page = parseInt(req.query.page) || 1;
            const limit = 12;
            const skip = (page - 1) * limit;

            const products = await Product
                .find({ is_delete: false })
                .populate({
                    path: 'category',
                    match: { is_disable: false }
                })
                .skip(skip)
                .limit(limit)
                .sort({ _id: -1 });

            const categorys = await Category.find({});

            const totalCount = await Product.countDocuments({ is_delete: false });

            const totalPages = Math.ceil(totalCount / limit);

            const user = await User.findById(session);
            const cartLen = user && user.cart ? user.cart.length : 0;

            res.render('user/shop-grid', { products, session, currentPage: page, totalPages, totalCount, cartLen, categorys });

        } catch (err) {
            console.log(err);
            res.render("/500");
        }
    },

    async insertUser(req, res) {
        try {
            const { email, username, referal, password, confirmPassword } = req.body;

            let referalFrom
            let isRefered = false
            if (referal != undefined && referal) {
                referalFrom = await User.findOne({ referal: referal })
                const userId = referalFrom._id
                const referedUser = await User.findById(userId)

                referedUser.wallet.balance += 500;

                const transactionData = {
                    amount: 500,
                    description: "Users sign up using your referral link.",
                    type: "Credit",
                };
                referedUser.wallet.transactions.push(transactionData);
                await referedUser.save();
                isRefered = true
            }


            if (email && username && password && confirmPassword) {
                const foundUser = await User.findOne({ email: email });

                if (foundUser) {
                    console.log("user is exist")
                    res.render('user/userSignup', { message: "User is already exist" });
                } else {

                    const referralCode = generateReferralCode(15);
                    console.log("New referal code ", referralCode);


                    if (password === confirmPassword) {
                        const hashPassword = await bcrypt.hash(password, salt)
                        const newUser = new User({
                            userName: username,
                            email: email,
                            password: hashPassword,
                            is_verified: false,
                            referal: referralCode
                        });

                        await newUser.save();
            
                        const savedUser = await User.findOne({ userName: username })
                        console.log('ttt', savedUser._id);
                        sendMail(req, res, savedUser._id, email)

                        if (isRefered) {
                            const NewUser = await User.findOne({ email: email });
                            NewUser.wallet.balance += 500
                            const transactionData2 = {
                                amount: 500,
                                description: "After using referral link.",
                                type: "Credit",
                            };
                            NewUser.wallet.transactions.push(transactionData2);
                            await NewUser.save()
                        }

                        res.render('user/otpVerification', { id: savedUser._id })


                    } else {
                        // Passwords don't match
                        console.log("Confirm Password is not a match");
                        res.render('user/userSignup', { message: "Confirm Password is not a match" });
                    }
                }
            } else {
                // All fields are required
                console.log("All fields are required");
                res.render('user/userSignup', { message: "All fields are required" });
            }
        } catch (error) {

            console.log(error);
            res.render('user/500')
        }
    },


    async otpVerification(req, res) {
        try {
            const { OTP, ID } = req.body;
            console.log(OTP);
            if (!OTP) {
                return res.render('user/otpVerification', { message: "Cannot send empty message", id: ID })
            }
            const OTPrecord = await userOTP.findOne({ userId: ID })

            if (!OTPrecord) {
                return res.render('user/otpVerification', { message: "Enter valied OTP", id: ID })
            }
            const { userId, otp } = OTPrecord;
            const isvalid = await bcrypt.compare(OTP, otp);
            console.log("otp is ", isvalid);


            if (!isvalid) {
                return res.render('user/otpVerification', { message: 'The entered OTP is invalid', id: ID })
            }

            await User.updateOne({ _id: ID }, { $set: { is_varified: true } })
            await userOTP.deleteOne({ userId })
            req.session.user = userId._id
            return res.redirect('/')
        } catch (error) {
            console.log(error.message);
            res.render('user/500')
        }

    },

    async resendOtp(req, res) {
        try {
            console.log("from resernd");
            const userId = req.query.userId;  // Corrected access
            console.log("UserId from resend", userId);
            const user = await User.findById(userId);
            console.log(user.email, "dfsdfsd");
            sendMail(req, res, userId, user.email);
            res.status(200)
        } catch (err) {
            console.log(err);
            res.redirect("/signup");
        }
    },


    async userLogin(req, res) {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                return res.render('user/user_login', { message: "Empty field are not allowed" })
            } else {
                const verifiedUser = await User.findOne({ email });

                if (!verifiedUser) {
                    return res.render('user/user_login', { message: "User not found" })
                } else if (verifiedUser.is_blocked === true) {
                    return res.render('user/user_login', { message: "Your Blocked By Admin" })
                } else if (verifiedUser.is_varified === true) {
                    const hashPassword = verifiedUser.password;
                    const match = await bcrypt.compare(password, hashPassword)


                    if (!match) {
                        return res.render('user/user_login', { message: "Invalid Password" })
                    } else {
                        req.session.user = verifiedUser._id
                        console.log("Login Successful");

                        const url = req.session?.url ? req.session.url : "/index"
                        return res.redirect(url)

                    }
                } else {
                    console.log("user is not Verified");
                    return res.render('user/user_login', { message: "Not a Verified User " })
                }
            }
        } catch (error) {
            console.log("Error from userLogin", error);
            res.render('user/500')
        }
    },




    //forget password

    loadForgetPass(req, res) {
        try {
            res.render('user/forgotPassword')
        } catch (error) {
            console.log(error.message);
        }
    },


    async forgetPassword(req, res) {
        try {
            const { email } = req.body;
            // const userId = req.session.user
            if (!email) {
                res.render("user/forgotPassword", { message: "enter email id" })
            } else {
                const findUser = await User.findOne({ email });
                console.log("sdafsdagsdg", findUser._id);
                if (!findUser) {
                    res.render("user/forgotPassword", { message: "User not found" })
                }

                sendMail(req, res, findUser._id, email)

                res.redirect(`/verifyOTPForgetPass?userId=${findUser._id}`)



            }

        } catch (error) {
            console.log(error.message);
        }
    },


    async loadOTPForgetPassPage(req, res) {

        try {

            res.render("user/forgetPassOTP", { userId: req.query.userId })

        } catch (error) {
            console.log(error.message);
        }

    },

    async verifyOTPForgetPassPage(req, res) {
        try {
            let { otp, userId } = req.body;
            console.log("OTP and userId :-", otp, userId);

            if (!otp || !userId) {
                console.log(userId);
                console.log(otp);
                res.render('user/forgetPassOTP', { message: "Empty details are not allowed", userId })
            } else {
                const UserOTPVerificationRecords = await userOTP.findOne({ userId: userId });

                console.log("OTP verific Record:- ", UserOTPVerificationRecords, " ")

                if (!UserOTPVerificationRecords) {
                    //no record found
                    res.render("user/forgetPassOTP", { message: "Account does not exist", userId })

                } else {
                    //user otp records exists
                    const { expireAt } = UserOTPVerificationRecords
                    const hashedOTP = UserOTPVerificationRecords.otp

                    if (expireAt < Date.now()) {
                        //user otp records has expires
                        await userOTP.deleteMany({ userId })
                        res.render("user/forgotPassword", { message: "Code has expires. Please request again.", userId })

                    } else {
                        console.log("hereeee");
                        console.log(hashedOTP);
                        console.log(otp);
                        const validOTP = await bcrypt.compare(otp, hashedOTP)


                        console.log("otp comparing:- ", validOTP);
                        if (!validOTP) {
                            //supplied otp is wrong
                            res.render("user/forgetPassOTP", { message: "Invalid OTP. Check your Email.", userId })

                        } else {
                            //success
                            console.log("rendering to changePassword");
                            await userOTP.deleteMany({ userId })
                            res.render("user/changePassword", { userId })
                        }
                    }
                }
            }
        } catch (error) {
            console.log(error.message);
        }
    },

    async changepass(req, res) {
        try {
            let { userId, password } = req.body
            if (!userId || !password) {
                res.render('user/changePassword', { message: `Empty password is not allowed`, userId })
            } else {
                const UserOTPVerificationRecords = await User.findById(userId)

                console.log("OTP verific from changepass:- ", UserOTPVerificationRecords, " ", UserOTPVerificationRecords.length);

                if (UserOTPVerificationRecords.length <= 0) {
                    //no record found
                    res.render("user/changePassword", { message: `Account record doesn't exist . Please sign up`, userId })
                } else {
                    //success
                    const spassword = await securePassword(password)
                    await User.updateOne({ _id: userId }, { $set: { password: spassword } })
                    await userOTP.deleteMany({ userId })

                    console.log("success");
                    res.render("user/user_login", { message: "password changed" })
                }
            }
        } catch (error) {
            console.log(error.message);
        }
    },

    async loadnewPassword(req, res) {
        try {
            const userId = req.session.user; // Assuming userId is the user ID you want to pass to the view
            res.render('user/newPassword', { userId: userId }); // Passing userId as an object
        } catch (err) {
            console.log(err);
            // Handle error here if needed
        }
    },
    //ave edited password
    async saveChangePassword(req, res) {
        const { Oldpassword, password, confirmPassword, userId } = req.body
        console.log(req.body);

        try {

            const user = await User.findOne({ _id: userId });
            console.log("fsdaf", user)
            if (await bcrypt.compare(Oldpassword, user.password)) {
                if (password === confirmPassword) {

                    user.password = await bcrypt.hash(password, 10)
                    await user.save()
                    res.redirect('/')
                } else {
                    res.render('user/newPassword', { userId })
                }
            } else {
                res.render('user/newPassword', { userId })
            }
        } catch (err) {
            console.log(err)
        }
    },

    async loadContact(req, res) {
        try {
            const session = req.session.user
            const user = await User.findById(session);
            const cartLen = user && user.cart ? user.cart.length : 0;
            res.render('user/contact', { cartLen, session })

        } catch (err) {
            console.log(err);
        }
    }
}

