const mongoose = require('mongoose')
const Schema = mongoose.Schema

const userOtpVerificationSchema = new Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Customer'
    },
    Email:{
        type:String,
        require:true,
    },
    otp:String,
    createdAt:Date,
    expireAt:Date,

})

// const UserOTPVerification = mongoose.model(
//     "userOTPVerification",
//     userOtpVerificationSchema

// )

module.exports = mongoose.model(
    "userOTPVerification",
    userOtpVerificationSchema

)