const express = require('express')
const { mongoose, Types } = require('mongoose')
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
// const sendToMail = require('../../util/sendToMail')
const User = require('../../models/userModel')
const userOTP = require('../../models/userOtpModel')
const Product = require('../../models/productModel')
const Category = require('../../models/categoryModel')
const sendToMail = require('../../util/sendToMail')
const userOTPVerification = require('../../models/userOtpModel')



let salt;

async function generateSalt() {
    salt = await bcrypt.genSalt(10)
}

generateSalt()

function generateOTP() {
    let otp = Math.floor(100000 + Math.random() * 900000).toString(); // Generate a 6-digit OTP
    return otp
}


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

            let isRefered = false
            if (referal != undefined && referal) {
                const referalFrom = await User.findOne({ referal: referal })
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
                    console.log("User already exists")
                    res.render('user/userSignup', { message: "User is already exist" });
                } else {

                    const referralCode = generateReferralCode(15);


                    if (password === confirmPassword) {
                        const hashPassword = await bcrypt.hash(password, salt)
                        const newUser = new User({
                            userName: username,
                            email: email,
                            password: hashPassword,
                            is_verified: false,
                            referal: referralCode
                        });

                        if (isRefered) {
                            newUser.wallet = { balance: 500, transactions: [] };
                            newUser.wallet.transactions.push({
                                amount: 500,
                                description: "Bonus for referral use.",
                                type: "Credit",
                            });
                        }

                        await newUser.save();

                        const savedUser = await User.findOne({ email: email })

                        try {
                            sendToMail(req, res, savedUser._id, email);
                            return res.render('user/otpVerification', {message: '', id: savedUser._id });
                        } catch (mailError) {
                            console.error(mailError.message);
                            return res.render('user/userSignup', { message: "Failed to send OTP." });
                        }


                    } else {
                        // Passwords don't match
                        console.log("Confirm Password is not a match");
                        res.render('user/userSignup', { message: "Confirm Password is not a match" });
                    }
                }
            } else {
                console.log("All fields are required");
                res.render('user/userSignup', { message: "All fields are required" });
            }
        } catch (error) {

            console.log(error);
            return res.render('user/500')
        }
    },


    async otpVerification(req, res) {
        try {
            const { OTP, ID } = req.body;

            if (!OTP) {
                return res.render('user/otpVerification', { message: "Cannot send empty message", id: ID })
            }
            const OTPrecord = await userOTP.findOne({ userId: ID })

            if (!OTPrecord) {
                return res.render('user/otpVerification', { message: "Enter valied OTP", id: ID })
            }

            // Check if OTP has expired
            const currentTime = Date.now();

            if (currentTime > new Date(OTPrecord.expiresAt).getTime()) {
                return res.render('user/otpVerification', { message: "OTP has expired", id: ID })
            }
            const isValid = await bcrypt.compare(OTP, OTPrecord.otp);
            if (!isValid) {
                return res.render('user/otpVerification', { message: "Invalid OTP.", id: ID });
            }

            await User.updateOne({ _id: ID }, { $set: { is_varified: true } })
            await userOTP.deleteOne({ userId: ID })
            req.session.user = ID
            return res.redirect('/')
        } catch (error) {
            console.log(error.message);
            return res.render('user/500')
        }

    },

    async resendOtp(req, res) {
        const userId = req.body.userId;
        try {
            const user = await User.findById(userId);

            if (!user) {
                return res.status(404).json({ success: false, message: "User not found." });
            }

            const OTP = generateOTP()
            const salt = await bcrypt.genSalt(10);
            const hashedOTP = await bcrypt.hash(OTP, salt);

            const expirationTime = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

            await userOTPVerification.updateOne(
                {userId},
                {otp: hashedOTP, expiresAt: expirationTime, createdAt: new Date()},
                {upsert: true}
            )

            await sendToMail(req, res, userId, user.email);
            res.status(200).json({ success: true, message: "OTP resent successfully." });
        } catch (err) {
            console.error('Error in resendOtp:', err.message);
            res.status(500).json({ success: false, message: "An unexpected error occurred. Please try again later." });
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
            if (!email) {
                res.render("user/forgotPassword", { message: "enter email id" })
            } else {
                const findUser = await User.findOne({ email });
                if (!findUser) {
                    res.render("user/forgotPassword", { message: "User not found" })
                }

                sendToMail(req, res, findUser._id, email)

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

            if (!otp || !userId) {
                res.render('user/forgetPassOTP', { message: "Empty details are not allowed", userId })
            } else {
                const UserOTPVerificationRecords = await userOTP.findOne({ userId: userId });

                if (!UserOTPVerificationRecords) {
                    res.render("user/forgetPassOTP", { message: "Account does not exist", userId })

                } else {
                    //user otp records exists
                    const { expireAt } = UserOTPVerificationRecords
                    const hashedOTP = UserOTPVerificationRecords.otp

                    if (expireAt < Date.now()) {
                        await userOTP.deleteMany({ userId })
                        res.render("user/forgotPassword", { message: "Code has expires. Please request again.", userId })

                    } else {
                        const validOTP = await bcrypt.compare(otp, hashedOTP)

                        if (!validOTP) {
                            res.render("user/forgetPassOTP", { message: "Invalid OTP. Check your Email.", userId })

                        } else {
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

                if (UserOTPVerificationRecords.length <= 0) {
                    //no record found
                    res.render("user/changePassword", { message: `Account record doesn't exist . Please sign up`, userId })
                } else {
                    const spassword = await securePassword(password)
                    await User.updateOne({ _id: userId }, { $set: { password: spassword } })
                    await userOTP.deleteMany({ userId })
                    res.render("user/user_login", { message: "password changed" })
                }
            }
        } catch (error) {
            console.log(error.message);
        }
    },

    async loadnewPassword(req, res) {
        try {
            const userId = req.session.user; 
            res.render('user/newPassword', { userId: userId }); 
        } catch (err) {
            console.log(err);
        }
    },
    //ave edited password
    async saveChangePassword(req, res) {
        const { Oldpassword, password, confirmPassword, userId } = req.body
        console.log(req.body);

        try {

            const user = await User.findOne({ _id: userId });
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

