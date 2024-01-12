const mongoose = require('mongoose')


const orderSchema = new mongoose.Schema({
    orderId: {
        type: String,
        unique: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    products: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            reqiured: true
        },
        quantity: {
            type: Number,
            required: true
        },
        itemCancelled:{
            type : Boolean,
            default  : false
        },
        totalAmount: Number
    }],
    status: {
        type: String,
        enum: ['Pending', 'Processing', 'Shipped', 'Delivered','Cancelled','Return Processing','Return Approved','Return Rejected','Return Complited'],
        default: 'Processing'
    },
    orderDate: {
        type: Date,
        default: Date.now()
    },
    deliveryAddress: [{
        userName: {
            type: String, 
        },
        email: {
            type: String, 
        },
        mobile: {
            type: String, 
        },
        houseName: {
            type: String, 
        },
        city: {
            type: String, 
        },
        postCode: {
            type: String, required: true
        },
        district: {
            type: String, required: true
        },
        state: {
            type: String, required: true
        },
        country: {
            type:String, required: true
        },
    }],
    paymentMethod: {
        type: String,
        required: true
    },
    paymentStatus: {
        type: String,
        enum: ['Pending', 'Paid'],
        default: 'Pending'
    },
    cancelReason: {
        type: String,
    },
    returnReason: {
        type: String
    },
    deliverdAt: {
        type: Date
    },
    totalPrice: {
        type: Number,
        required: true,
    },
    discountAmount: {
        type: Number,
    },
    grandTotal: {
        type: Number
    }
})

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;