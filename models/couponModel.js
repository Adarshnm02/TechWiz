const mongoose = require('mongoose')

const couponSchema= new mongoose.Schema({
    code:{
        type:String,
        require:true,
        unique:true
    },
    description:{
        type:String,
        minLength:4,
        maxLength: 100,
    },
    discountType: {
        type:String,
        enum: ['percentage','fixedAmount'],
        require:true,
    },
    discountAmount:{
        type:Number,
        require:true,
        min:0,
    },
    minimumPurchaseAmount:{
        type:Number,
        require:true,
        min:0,      
    },
    expiryDate:{
        type:Date,
    },
    usageLimit:{
        type:Number,
        require:true,
        min:0
    },
    usedCount:{
        type:Number,
        default:0
    },
    isActive:{
        type:Boolean,
        default:true
    }
})


const coupon  = mongoose.model('coupon', couponSchema);

module.exports = coupon;