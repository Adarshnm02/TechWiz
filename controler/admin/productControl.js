const express = require('express')
// const bcrypt = require("bcrypt")
const Product = require("../../models/productModel")
const Category = require("../../models/categoryModel")

function isValidImage(file) {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    return allowedTypes.includes(file.mimetype);
}


module.exports = {


    // async loadAddProduct(req, res) {
    //     try {
    //         const productsWithCategory = await Product.find().populate({
    //             path: 'category',
    //             select: 'categoryName' // Select only the categoryName field from the Category model
    //         });
    
    //         if (productsWithCategory) {
    //             res.render('admin/addProduct', { productsWithCategory });
    //         } else {
    //             console.log("Products with Category not found");
    //         }
    //     } catch (err) {
    //         console.log(err);
    //         res.render("admin/500");
    //     }
    // }
    
    
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
            res.render("admin/500")
        }
    },
    
    async addProduct(req, res) {
        // console.log(req.body);
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
                if(isValidImage(file)){
                createdProduct.image.push({
                    data: file.buffer,
                    contentType: file.mimetype
                });
            }else{
                res.render('admin/addProduct',{message: "Image is not valid"})
                console.log("this is not a image");
            }
            })

            await createdProduct.save();
            console.log('ggggggggggggggggg', createdProduct);

            if (createdProduct) {
                console.log("Product added successfully");
                res.redirect("/admin/products")
            }

        } catch (error) {
            console.log(error);
            res.render("admin/500")
        }
    },

    async  loadShop(req, res) {
        try {
            const session = req.session.user;
            const page = parseInt(req.query.page) || 1; // Extract the page number from the query string
            const limit = 12; // Set the number of products per page
            const skip = (page - 1) * limit;
    
            const products = await Product
                .find({ is_delete: false })
                .populate({
                    path: 'category',
                    match: { is_disable: false } 
                })
                .skip(skip)
                .limit(limit)
                .sort({ _id: -1 });
    
            // Count total products for pagination calculation
            const totalCount = await Product.countDocuments({ is_delete: false });
    
            // Calculate total pages
            const totalPages = Math.ceil(totalCount / limit);
    
            res.render('user/shop-grid', { products, session, currentPage: page, totalPages, totalCount });
    
        } catch (err) {
            console.log(err);
            res.render("/500");
        }
    },
    

    // async loadProductList(req, res) {
    //     try {
    //         const products = await Product.find();


    //         // console.log(products);
    //         if (products) {
    //             res.render("admin/products", { products });
    //         } else {
    //             console.log("product not found");
    //         }
    //     } catch (error) {
    //         console.log(error.message);
    //         res.render("admin/500")
    //     }
    // },
    async  loadProductList(req, res) {
        const page = parseInt(req.query.page) || 1; // Extract the page number from the query string
        const limit = 10; // Set a limit for the number of products per page
        const skip = (page - 1) * limit;
    
        try {
            const products = await Product.find()
                .skip(skip)
                .limit(limit);
    
            const totalCount = await Product.countDocuments();
    
            res.render("admin/products", {
                products,
                totalCount,
                currentPage: page,
                totalPages: Math.ceil(totalCount / limit)
            });
        } catch (error) {
            console.log(error.message);
            res.render("admin/500", { error });
        }
    },
    


    async loadedit(req, res) {
        try {
            const id = req.params.id;
            const products = await Product.findById(id);
            const category = await Category.find()
            // console.log("cat from loadproductedit", category);
            if (products && category) {
                res.render("admin/editProduct", { message: "", products, id, category });
            } else {
                console.log("The Products or Category is not found ");
            }

        } catch (error) {
            console.log("error form loadedit ", error.message);
            res.render("admin/500")
        }
    },


    async editproduct(req, res) {
        console.log(req.body)
        
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
      

        // console.log(category)

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
                    if(isValidImage(file)){
                        updatedproduct.image.push({
                            data: file.buffer,
                            contentType: file.mimetype,
                        });
                    }else{
                        console.log("Not a Image")
                    }
                });
            }

            await updatedproduct.save();
            res.redirect(`/admin/products`);
        } catch (error) {
            console.log(error.message);
            // Handle the error appropriately
            res.status(500).send("Error updating product");
            res.render("admin/500")
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
            res.render("admin/500")
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
            res.render("admin/500")
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
            // res.status(500).send({ message: 'Internal Server Error' });
            res.render("admin/500", { message: 'Internal Server Error' })
        }
    }
    



};