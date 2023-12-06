const express = require('express')
// const bcrypt = require("bcrypt")
const Product = require("../../models/productModel")




module.exports = {


    loadAddProduct(req, res) {
        try {
            res.render('admin/addProduct')
        } catch (err) {
            console.log(err);
        }
    },

    async addProduct(req, res) {
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
            ) {
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
            console.log('ggggggggggggggggg', createdProduct);

            if (createdProduct) {
                console.log("Product added successfully");
                // res.redirect("")
            }

        } catch (error) {
            console.log(error);
        }
    },


    async loadShop(req, res) {
        //Fetching Product
        try {
            const products = await Product
                .find()
            console.log(products,"Product");
            res.render('user/shop-grid', {products})

        } catch (err) {
            console.log(err);
        }

        
    },



    async productDetails(req,res){
        try{
            const session = req.session.user;
            console.log("Session from product details ",session);
            const { id } = req.params;
            const details = await Product.findById({ _id:id })
            if(details){
                res.render('User/productDetails',{details,session,id})
            }
            console.log("gdfg",details.category);
            console.log("dsdsddddddddd");
    
        }catch(error){
            console.log(error.message);
        }
    
    }
    

    // res.render('user/shop-grid')

    // module.exports = {
    //     loadAddProduct,
    //     addProduct
};