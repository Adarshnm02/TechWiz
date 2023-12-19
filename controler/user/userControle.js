const express = require('express')
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

    logout (req, res) {
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
            const page = parseInt(req.query.page) || 1; // Extract the page number from the query string
            const limit = 12; // Set the number of products per page
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

            const latestPrd = await Product
                .find({is_delete : false})
                .limit(limit)
                .sort({_id: 1})
    
            // Count total products for pagination calculation
            const totalCount = await Product.countDocuments({ is_delete: false });
    
            // Calculate total pages
            const totalPages = Math.ceil(totalCount / limit);
    
            res.render('user/index', { products, session, currentPage: page, totalPages, totalCount, latestPrd  });
    
        } catch (err) {
            console.log("Error From loadHome",err);
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
                    res.render('user/userSignup', { message: "User already exist" });
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
                        sendMail(req, res, savedUser._id, false)

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

            // if(OTP === )

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
            console.log("11  "+OTP+"   helo   "+otp);

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

                        const url=req.session?.url?req.session.url:"/index"
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

    loadProfile (req,res){
        try{
            session = req.session.user
            console.log("from profile", session)
            res.render('user/user_profile', {session})
            
        }catch(err){
            console.log("Profile loading error ", err);
            res.render("user/500")
        }
    }


    



}
// module.exports = {loadHome, login, loadBlog, insertUser, loadSignup, load_otp, userLogin, otpVerification ,logout, load_cart












////////////////////////////////////////////////////////////////////////////////////////////