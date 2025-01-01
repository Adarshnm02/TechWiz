const bcrypt = require('bcrypt')
require('dotenv').config();
const nodeMailer = require('nodemailer');
const userOTPVerification = require('../models/userOtpModel')


function generateOTP() { 
    let otp = Math.floor(100000 + Math.random() * 900000).toString(); // Generate a 6-digit OTP
    return otp
}


const sendToMail = async (req, res, userId, email) => {
    console.log(`mailoption ${process.env.USERN} , ${process.env.PASS}`);
    console.log(email, userId, "form sendMail");
    try {

        const transporter = nodeMailer.createTransport({
            service: 'Gmail',
            auth: {
                user: process.env.USERN,
                pass: process.env.PASS
            }
        });

        const OTP = generateOTP();
        console.log(OTP, "otp");
        const salt = await bcrypt.genSalt(10);
        const hashedOTP = await bcrypt.hash(OTP, salt);

        const mailOptions = {
            from: {
                name: "TechWiz.com",
                address: process.env.USERN,
            },
            to: email || req.body.email,
            subject: 'OTP Verification',
            html: `<p> Your otp for verification is ${OTP} </p>`,
        };

        const expirationTime = Date.now() + 5 * 60 * 1000;
        const newUserOPTVerification = new userOTPVerification({
            userId,
            otp: hashedOTP,
            expiresAt: new Date(expirationTime),  
            createdAt: Date.now(),
        }); 

        await transporter.sendMail(mailOptions)
        await newUserOPTVerification.save();
        console.log('Email sent successfully.');
        return { success: true, message: 'OTP sent successfully' };

    } catch (error) {
        console.error(`Error sending email: ${error.message}`);
        throw new Error(`Failed to send verification email: ${error.message}`);
    }
}

module.exports = sendToMail;
