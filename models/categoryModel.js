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
        contentType : String
    }
})

const productCategory = mongoose.model(
    "productCategory",
    productCategorySchema

)

module.exports = productCategory