const express = require('express')
// const bcrypt = require("bcrypt")
const Product = require("../../models/productModel")
const Category = require("../../models/categoryModel")




module.exports = {


    async loadAddProduct(req, res) {
        try {
            const category = await Category.find()
            if (category) {
                res.render('admin/addProduct', { category })
            } else {
                console.log("Category not found");
            }
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

            // if (
            //     !productName || !brandName ||
            //     !price || !description ||
            //     !stockCount || !category
            // ) {
            //     console.log("fsfsdgsdgsdgsdgsd");
            //     return res.render('admin/addProduct')
            // }

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
                res.redirect("/admin/products")
            }

        } catch (error) {
            console.log(error);
        }
    },


    async loadShop(req, res) {
        //Fetching Product
        try {
            const session = req.session.user;
            const products = await Product
                .find({is_delete:false})
            console.log(products, "Product");
            res.render('user/shop-grid', { products, session })

        } catch (err) {
            console.log(err);
        }


    },



    async productDetails(req, res) {
        try {
            const session = req.session.user;
            console.log("Session from product details ", session);
            const { id } = req.params;
            const details = await Product.findById({ _id: id })
            console.log("from details", details);
            if (details) {
                console.log("Product Details Rendering");
                res.render('user/productDetails', { details, session, id })
            }
            console.log("gdfg", details.category);
            console.log("dsdsddddddddd");

        } catch (error) {
            console.log(error.message);
        }

    },

    async loadProductList(req, res) {
        try {
            const products = await Product.find();


            // console.log(products);
            if (products) {
                res.render("admin/products", { products });
            } else {
                console.log("product not found");
            }
        } catch (error) {
            console.log(error.message);
        }
    },


    async loadedit(req, res) {
        try {
            const id = req.params.id;
            const products = await Product.findById(id);
            const category = await Category.find()
            console.log("cat from loadproductedit", category);
            if (products && category) {
                res.render("admin/editProduct", { message: "", products, id, category });
            } else {
                console.log("The Products or Category is not found ");
            }

        } catch (error) {
            console.log("error form loadedit ", error.message);
        }
    },


    async editproduct(req, res) {
        const {
            productName,
            brandName,
            price,
            description,
            stockCount,
            category,
            offer,
            id,
        } = req.body;

        try {
            const productId = id;
            const data = {
                product_name: productName,
                brand_name: brandName,
                price: price,
                stock_count: stockCount,
                description: description,
                category: category,
                offer: offer
            };

            const updatedproduct = await Product.findByIdAndUpdate(
                productId, { $set: data }, { new: true }
            );

            if (req.files && req.files.length > 0) {
                // Assuming 'req.files' contains the uploaded image files
                req.files.forEach((file) => {
                    updatedproduct.image.push({
                        data: file.buffer,
                        contentType: file.mimetype,
                    });
                });
            }

            await updatedproduct.save();
            res.redirect(`/admin/products`);
        } catch (error) {
            console.log(error.message);
            // Handle the error appropriately
            res.status(500).send("Error updating product");
        }
    },


 
    async productActivate(req,res){
        try{
            const {id} = req.params;
            const active =await Product.updateOne({_id:id},{$set:{is_delete:false}})
            if(active){
            res.redirect('/admin/products')
            }
        }catch(error){
            console.log(error.message);
        }
    },
    
    async productDesable(req,res){
        try{
            const {id} =req.params;
            const deactive = await Product.updateOne({_id:id},{$set:{is_delete:true}})
            if(deactive){
            res.redirect('/admin/products')
            }
        }catch(error){
            console.log(error.message);
        }
    },
    

    async deleteImgDelete(req, res) {
        const id = req.params.id;
        const imageId = req.params.imageId;
    
        try {
            const deleteImg = await Product.findByIdAndUpdate(
                id,
                { $pull: { image: { _id: imageId } } },
                { new: true }
            );
    
            if (deleteImg) {
                console.log("Image deleted:", deleteImg);
                return res.redirect(`/admin/products/${req.params.id}/Edit`);
            } else {
                console.log("Image not updated");
            }
        } catch (error) {
            console.log(error.message);
            // Handle the error, perhaps send an error response
            res.status(500).send({ error: 'Internal Server Error' });
        }
    }
    






    // async deleteImgDelete (req, res){
    //     const id = req.params.id
    //     const imageId = req.params.imageId
    //     console.log(id + "here" + imageId);
    //     try {
    //         const deleteimg = await Product.findByIdAndUpdate(
    //             { _id: id },
    //             { $pull: { "images": { _id: imageId } } },
    //             { new: true }
    //         );
      
    //         // 650c7fbf086081c38a
    //         if (deleteimg) {
      
    //             console.log("Imaged deleted ",deleteimg)
    //             return res.redirect(`/admin/products/${req.params.id}/Edit`);
    //         } else {
    //             console.log("image not updated")
    //         }
    //     } catch (error) {
    //         console.log(error.message)
    //     }
    //   },   

      




    // res.render('user/shop-grid')

    // module.exports = {
    //     loadAddProduct,
    //     addProduct
};