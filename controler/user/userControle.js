const express = require('express')
const UserOTPVerification = require("../../models/userOTPVerification")
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');





const loadHome = (req,res)=>{
  
        res.render('user/index')
        
}
const login = (req,res)=>{
        res.render('user/user_login')
}

const loadShop = (req,res)=>{
        res.render('user/shop-grid')
}
const loadBlog = (req,res)=>{
        res.render('user/blog')
}

const loadSignup = (req,res)=>{
    res.render('user/userSignup')
}

const sendOTPVerificationEmail = async ({ _id, email }, res) => {
        try {
            const otp = `${Math.floor(1000 + Math.random() * 9000)}`;
            // Mail options
            const mailOption = {
                from: process.env.AUTH_EMAIL, // Use the correct environment variable
                to: email,
                subject: "Verify Your Email",
                html: `<p>Enter <b>${otp}</b> in the app to verify your email address and complete the verification</p>
                       <p>This code <b>expires in 1 minute</b>.</p>`
            };
            // Hash the OTP
            const saltRounds = 10;
            const hashedOTP = await bcrypt.hash(otp, saltRounds);
            const newOTPVerification = new UserOTPVerification({
                userId: _id,
                otp: hashedOTP,
                createdAt: Date.now(),
                expireAt: Date.now() + 60000,
            });
    
            // Save OTP record
            await UserOTPVerification.deleteMany({ userId: _id })
            await newOTPVerification.save();
            // Send email
            await transporter.sendMail(mailOption);
            // Send a single response at the end of the try block
        } catch (error) {
            // Handle errors and send an error response
            // res.render("User/404", { message: "An error occurred. Please try again later." });
            console.log(error);
        }
    };//RENDER THE OTP PAGE
    const loadOTPpage = async (req, res) => {
        try {
            const userId = req.query.userId;
            console.log(userId); // Log the userId for debugging
            res.render('user/otpVerification', {
                message: '', id: userId, user: "", success: req.flash("success"),
                error: req.flash("error"),
            });
        } catch (error) {
            // res.render("User/404", { message: "An error occurred. Please try again later." });
            console.log(error);
        }
    }//CHECK THE OTP IS VALID
    const checkOTPValid = async (req, res) => {
        try {
            const { OTP, ID } = req.body;
            if (OTP === '') {
                return res.render("user/otpVerification", { message: "Empty data is not allowed", id: ID, user: "" });
            }
            const OTPRecord = await UserOTPVerification.findOne({ userId: ID });
            if (!OTPRecord) {
                return res.render("user/otpVerification", { message: "Enter a valid OTP", id: ID, user: "" });
            }
            const { expireAt, userId, otp } = OTPRecord;
            if (expireAt < Date.now()) {
                await UserOTPVerification.deleteOne({ userId });
                return res.render("user/otpVerification", { message: "The code has expired, please try again", id: ID, user: "" });
            }
            const isValid =  bcrypt.compare(OTP, otp);
            if (!isValid) {
                return res.render("user/otpVerification", { message: "The entered OTP is invalid", id: ID, user: "" });
            }
            await Customer.updateOne({ _id: ID }, { $set: { is_varified: true } });
            await UserOTPVerification.deleteOne({ userId });
            return res.redirect('/user/user_Login');
         } catch (error) {
                console.log(error);
        //     res.render("User/404", { message: "Internal Server Error" });
        }
    };
    //RESEND OTP
    const resedOtp = async (req, res) => {
        try {
            const { userId } = req.body
            const userDate = await Customer.findById(userId)
            await sendOTPVerificationEmail(userDate)
            if (userDate) {
                return res.redirect(`/user/otpVerification?userId=${userId}`)
            }
        } catch (error) {
                console.log(error);
        //    res.render("User/404", { message: "An error occurred. Please try again later." });
        }
}







module.exports = {loadHome,login,loadShop,loadBlog,resedOtp,checkOTPValid,loadOTPpage,sendOTPVerificationEmail,loadSignup };
