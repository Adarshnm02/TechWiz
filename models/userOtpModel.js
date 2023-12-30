const mongoose = require('mongoose')
const Schema = mongoose.Schema

const userOTPVerificationSchema = new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    Email:{
        type:String,
        require:true,
    },
    otp:String,
    // createAt:Date,
    // expireAt:Date
    expiresAt: {type: Date, default: Date.now, expires: 500 }

})

const userOTPVerification = mongoose.model('userOTPVerification',userOTPVerificationSchema)

module.exports = userOTPVerification;
