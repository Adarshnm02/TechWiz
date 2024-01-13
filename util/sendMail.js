const bcrypt = require('bcrypt')
const nodeMailer = require('nodemailer');
const userOTPVerification = require('../models/userOtpModel')




let salt;

async function generateSalt() {
    salt = await bcrypt.genSalt(10);
}

generateSalt();


const sendToMail = (req, res, userId, email) => {
    console.log("mailoption");
    console.log(email, "form sendMail");
    console.log(userId, "userId");
    const transporter = nodeMailer.createTransport({
        service: 'Gmail',
        auth: {
            user: "techwiz.official02@gmail.com",
            pass: "xfkl nkqv jlhx jmbp"
        }
    })


    function generateOTP(length) {
        const charset = '0123456789';
        let otp = "";

        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * charset.length)
            otp += charset[randomIndex]
        }
        return otp
    }

    let OTP = generateOTP(4);

    const mailOptions = {
        from: {
            name: "TechWiz.com",
            address: process.env.USER,
        },
        to: req.body.email || email,
        subject: 'OTP Verification',
        html: `<p> Your otp for varification is ${OTP} </p>`,
    }

    console.log(OTP, "otp");
    const sendMail = async (transporter, options) => {
        try {
            const hashedOTP = await bcrypt.hash(OTP, salt)
            const newUserOPTVerification = new userOTPVerification({
                userId: userId,
                otp: hashedOTP,
                createAt: Date.now(),
                expireAt: Date.now() + 5000,  // Adding 3000 milliseconds (3 seconds) to the current timestamp

                // expireAt:Date.now()+ 60000*60
            })
            await newUserOPTVerification.save()
            await transporter.sendMail(options)
            res.render('user/otpVerification', {
                userId,
                email: req.body.mail,
                error: '',
                id: userId
            })
            console.log(email, "email");
        } catch (error) {
            res.status(500).json({
                status: "FAILED",
                message: 'error sending verification email:' + error.message,
            })
        }
    }
    sendMail(transporter, mailOptions)
}

module.exports = sendToMail;