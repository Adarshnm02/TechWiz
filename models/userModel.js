const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    userName:{
        type: String,
        require:true
    },
    email:{
        type:String,
        require:true,
        lowercase:true,
        unique: true
    },
    mobile:{
        type:String,
    },
    password:{
        type:String,
        require:true,
        // minLength: 4
    },
    is_varified:{
        type:Boolean,
        default:false
    },
    is_blocked:{
        type:Boolean,
        default:false
    },
    is_Admin:{
        type:Boolean,
        default:false
    },
    referal: {
        type: String,
    },
    cart:[{
        product:{
            type: mongoose.Schema.Types.ObjectId,
            ref:"Product"
        },
        quantity: {
            type: Number,
            default: 1
        },
        totalAmount:{
            type:Number
        }

    }],
    grandTotal:{
        type: Number,
        default: 0
    },
    wallet: {
        balance: {
            type: Number,
            default: 0,
        },
        transactions: [{
            amount: {
                type: Number,
                required: true,
            },
            description: {
                type: String,
                required: true,
            },
            type: {
                type: String,
                enum: ['Credit', 'Debit'],
                required: true,
            },
            timestamp: {
                type: Date,
                default: Date.now,
            }
        }],
    },
})

const User = mongoose.model('User',userSchema)
module.exports = User;