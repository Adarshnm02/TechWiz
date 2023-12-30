const express = require('express')
const { mongoose, Types } = require('mongoose')
// const UserOTPVerification = require("../../models/userOTPVerification")
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const sendMail = require('../../util/sendMail')
const User = require('../../models/userModel')
const userOTP = require('../../models/userOtpModel')
const Product = require('../../models/productModel')




let salt;

async function generateSalt() {
    salt = await bcrypt.genSalt(10)
}

generateSalt()

// const securePassword = async (password) => {
//     try{
//         const passwordHash = await bcrypt.hash(password,10)
//         return passwordHash
//     }catch(err){
//         console.log(err);
//         // res.render('/user/interItnalError', {err})
//     }
// }



const securePassword = async (password) => {

    try {

        const passwordHash = await bcrypt.hash(password, 10)
        return passwordHash;

    } catch (error) {
        res.render("error/internalError", { error })
    }

}




module.exports = {


    // loadHome(req, res) {
    //     console.log(req.session.user);

    //     try{
    //         res.render('user/index', { session: req.session.user})

    //     } catch{
    //         res.render('user/500')
    //     }

    // },
    login(req, res) {
        res.render('user/user_login', { session: req.session.user })
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


    load_otp(req, res) {
        // res.render('user/forDelete')
        const id = '123';
        res.render('user/otpVerification', { id })
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

    // async loadHome(req, res) {
    //     try {
    //         const session = req.session.user;


    //         const page = parseInt(req.query.page) || 1; // Extract the page number from the query string
    //         const limit = 12; // Set the number of products per page
    //         const skip = (page - 1) * limit;

    //         let products;
    //         if (req.query.query) {
    //             products = await Product.find({
    //                 product_name: { $regex: ".*" + req.query.query + ".*", $options: "i" },
    //                 is_delete: false
    //             }).skip(skip).limit(pageSize);

    //         } else {

    //             products = await Product
    //             .find({ is_delete: false })
    //             .populate({
    //                 path: 'category',
    //                 match: { is_disable: false }
    //             })
    //             .skip(skip)
    //             .limit(limit)
    //             .sort({ _id: -1 });

    //         const latestPrd = await Product
    //             .find({ is_delete: false })
    //             .limit(limit)
    //             .sort({ _id: 1 })
    //         }

    //         // Count total products for pagination calculation
    //         const totalCount = await Product.countDocuments({ is_delete: false });

    //         // Calculate total pages
    //         const totalPages = Math.ceil(totalCount / limit);

    //         res.render('user/index', { products, session, currentPage: page, totalPages, totalCount, latestPrd });

    //     } catch (err) {
    //         console.log("Error From loadHome", err);
    //         res.render("user/500");
    //     }
    // },



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
                products = await Product
                    .find({ is_delete: false })
                    .populate({
                        path: 'category',
                        match: { is_disable: false }
                    })
                    .skip(skip)
                    .limit(limit)
                    .sort({ _id: -1 });

                latestPrd = await Product
                    .find({ is_delete: false })
                    .limit(limit)
                    .sort({ _id: 1 })
            }

            console.log(latestPrd,"fsdgsdgsdfgsdfg",products);

            // Count total products for pagination calculation
            const totalCount = await Product.countDocuments({ is_delete: false });
            const totalPages = Math.ceil(totalCount / limit);

            // res.render('user/index', { products, session, currentPage: page, totalPages, totalCount, latestPrd });
            res.render('user/index', { products, session, currentPage: page, totalPages, totalCount, latestPrd });


        } catch (err) {
            console.log("Error From loadHome", err);
            res.render("user/500");
        }
    },

    async insertUser(req, res) {
        try {
            console.log("Form req.body Body", req.body);
            const { email, username, password, confirmPassword } = req.body;

            if (email && username && password && confirmPassword) {
                const foundUser = await User.findOne({ email: email });

                if (foundUser) {
                    // User already exists
                    res.render('user/userSignup');
                } else {
                    if (password === confirmPassword) {
                        const hashPassword = await bcrypt.hash(password, salt)
                        const newUser = new User({
                            userName: username,
                            email: email,
                            password: hashPassword,
                            is_verified: false
                        });

                        await newUser.save();
                        console.log("Showing newUser ", newUser);
                        console.log("User saved successfully");

                        const savedUser = await User.findOne({ userName: username })
                        sendMail(req, res, savedUser._id, email)

                    } else {
                        // Passwords don't match
                        res.render('user/userSignup', { message: "Confirm Password is not a match" });
                        console.log("Confirm Password is not a match");
                    }
                }
            } else {
                // All fields are required
                res.render('user/userSignup', { message: "All fields are required" });
                console.log("All fields are required");
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
            // if (expireAt < Date.now()) {
            //     await userOTP.deleteOne({ userId })
            //     return res.render('user/otpVerification', { message: 'OTP has been expired,Please try again', id: ID })
            // }
            console.log("11" + OTP, otp);
            const isvalid = await bcrypt.compare(OTP, otp);

            console.log(isvalid);
            console.log("11  " + OTP + "   helo   " + otp);

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
                    console.log("error from userLogin else");
                    return res.render('user/user_login', { message: "Not a Verified User " })
                }
            }
        } catch (error) {
            console.log(error);
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
                // newUserOPTVerification

                // const userOTPE = await newUserOPTVeri.save()
                // await transporter.sendMail(mailOptions)
                // sendMail(req, res, savedUser._id, false)


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

                if (!UserOTPVerificationRecords ) {
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
                // const UserOTPVerificationRecords = await userOTP.find( {userId: new Types.ObjectId(userId)} )

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

    








}
// module.exports = {loadHome, login, loadBlog, insertUser, loadSignup, load_otp, userLogin, otpVerification ,logout, load_cart












////////////////////////////////////////////////////////////////////////////////////////////