const express = require('express')
// const bcrypt = require("bcrypt")
const Product = require("../../models/productModel")


const loadAddProduct = (req,res) => {
    try{
        res.render('admin/addProduct')
    }catch(err){
        console.log(err);
    }
}
const addProduct = async (req, res) => {
    console.log(req.body);
    try {
        const {
            productName,
            brandName,
            price,
            description,
            stockCount,
            category, 
        } = req.body;

        if (
            !productName || !brandName ||
            !price || !description || 
            !stockCount || !category
        ){
            console.log("fsfsdgsdgsdgsdgsd");
            return res.render('admin/addProduct')
        }

        // Create the product 

        const createdProduct = new Product({
            product_name: productName,
            brand_name: brandName,
            price: price,
            stock_count: stockCount,
            description: description,
            category: category,
            image: []
        });
        req.files.forEach((file) => {
            createdProduct.image.push({
                data: file.buffer,
                contentType: file.mimetype
            });
        })

        await createdProduct.save();
        console.log('ggggggggggggggggg',createdProduct);

        if(createdProduct){
            console.log("Product added successfully");
            // res.redirect("")
        }
        
    } catch(error) {
        console.log(error);
    }
}


module.exports = {
    loadAddProduct,
    addProduct
};