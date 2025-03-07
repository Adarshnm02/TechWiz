const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
    product_name: {
        type: String,
        require: true
    },
    description: {
        type: String,
        require: true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'productCategory'
    },
    brand_name: {
        type: String,
        require: true
    },
    stock_count: {
        type: Number,
        require: true
    },
    // in_stock : {
    //     type : Boolean
    // },
    price: {
        type: Number,
        // require : true
    },
    color: {
        type: String,
        require: true
    },
    offer: {
        type: Number,
        default: 0
    },
    image: [{
        data: Buffer,
        contentType: String
    }],
    is_delete: {
        type: Boolean,
        default: false
    }

})

const Product = mongoose.model(
    "Product", productSchema
)

module.exports = Product;