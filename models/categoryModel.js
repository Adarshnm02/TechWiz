const mongoose = require('mongoose')

const productCategorySchema = new mongoose.Schema({
    categoryName: {
        type : String,
        required : true
    },
    description: {
        type : String,
        required : true
    },
    is_disable: {
        type : Boolean,
        contentType : String,
        default: false
    },
    image : {
        data: Buffer,
        contentType: String
    },offer:{
        type:Number,
        default:0
    }
})

const productCategory = mongoose.model(
    "productCategory",
    productCategorySchema

)

module.exports = productCategory