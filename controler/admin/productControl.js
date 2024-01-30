const express = require('express')
// const bcrypt = require("bcrypt")
const Product = require("../../models/productModel")
const Category = require("../../models/categoryModel")

// function isValidImage(file) {
//     const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
//     return allowedTypes.includes(file.mimetype);
// }

const isValidImage = (file) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    return file && allowedTypes.includes(file.mimetype);
};

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
            const categorys = await Category.find()
            if (categorys) {
                res.render('admin/addProduct', { categorys })
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
        const categorys = await Category.find()
        try {
            const {
                productName,
                brandName,
                price,
                description,
                stockCount,
                category,
                productOffer,
                productColor,
            } = req.body;

                console.log("Files aer ", req.files)

            // Check if any required fields are missing
            if (!productName || !brandName || !price || !description || !stockCount || !category || !productOffer || !productColor) {
                return res.render('admin/addProduct', { message: "All fields must be filled", categorys });
            }

            // Check if there are files
            if (!req.files || req.files.length === 0) {
                return res.render('admin/addProduct', { message: "Please upload at least one image", categorys });
            }

            // Create the product
            const createdProduct = new Product({
                product_name: productName,
                brand_name: brandName,
                price: price,
                stock_count: stockCount,
                description: description,
                category: category,
                offer: productOffer,
                color: productColor,
                image: []
            });

            // Validate and process each uploaded file
            for (const file of req.files) {
                if (!isValidImage(file)) {
                    console.log("Not a valid image file");
                    return res.render('admin/addProduct', { message: "uploaded file is not valid image", categorys });
                }

                createdProduct.image.push({
                    data: file.buffer,
                    contentType: file.mimetype
                });
            }

            await createdProduct.save();
            console.log('Product added successfully:', createdProduct);
            res.redirect("/admin/products");

        } catch (error) {
            console.error(error);
            res.render("admin/500");
        }
    },

    async loadProductList(req, res) {
        const page = parseInt(req.query.page) || 1;
        const limit = 10;
        const skip = (page - 1) * limit;

        try {
            const { query } = req.query;
            let products
            let totalCount

            if (query) {
                console.log(" searched products ");
                const regex = new RegExp(query, 'i');
                products = await Product.find({ product_name: { $regex: regex } })
                    .skip(skip)
                    .limit(limit);

                totalCount = await Product.countDocuments({ product_name: { $regex: regex } });

            } else {
                products = await Product.find()
                    .skip(skip)
                    .limit(limit)
                    .sort({ _id: -1 });

                totalCount = await Product.countDocuments();
            }

            res.render("admin/products", {
                products,
                totalCount,
                currentPage: page,
                totalPages: Math.ceil(totalCount / limit),
                query: query || ""
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
            categorys,
            productOffer,
            id,
            productColor,
            
        } = req.body;

        if(req.files.length <= 0 ){
            return res.redirect('/admin//products/edit/'+ id)
        }
        // console.log(category)

        try {
            const productId = id;
            const data = {
                product_name: productName,
                brand_name: brandName,
                price: price,
                stock_count: stockCount,
                description: description,
                category: categorys,
                offer: productOffer,
                color: productColor,
            };

            const updatedproduct = await Product.findByIdAndUpdate(
                productId, { $set: data }, { new: true }
            );

            if (req.files && req.files.length > 0) {
                // Assuming 'req.files' contains the uploaded image files
                req.files.forEach((file) => {
                    if (isValidImage(file)) {
                        updatedproduct.image.push({
                            data: file.buffer,
                            contentType: file.mimetype,
                        });
                    } else {
                        console.log("Not a Image")
                    }
                });
            }

            const savedProduct = await updatedproduct.save();
            // console.log("product saved", savedProduct);
            res.redirect(`/admin/products`);
        } catch (error) {
            console.log(error.message);
            // Handle the error appropriately
            res.status(500).send("Error updating product");
            res.render("admin/500")
        }
    },



    async productActivate(req, res) {
        try {
            const { id } = req.params;
            const active = await Product.updateOne({ _id: id }, { $set: { is_delete: false } })
            if (active) {
                res.redirect('/admin/products')
            }
        } catch (error) {
            console.log(error.message);
            res.render("admin/500")
        }
    },

    async productDesable(req, res) {
        try {
            const { id } = req.params;
            const deactive = await Product.updateOne({ _id: id }, { $set: { is_delete: true } })
            if (deactive) {
                res.redirect('/admin/products')
            }
        } catch (error) {
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