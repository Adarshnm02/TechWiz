const express = require('express')
const User = require('../../models/userModel')
const Product = require("../../models/productModel")
const Coupon = require('../../models/couponModel');
const { default: mongoose } = require('mongoose');




module.exports = {
    async load_cart(req, res) {
        try {
            if (req.session.user) {
                const page = parseInt(req.query.page) || 1;
                const limit = 6;
                const skip = (page - 1) * limit;

                const userId = req.session.user;
                // const user = await User.findById(userId).populate({
                //     path: 'cart.product',
                //     options: { skip, limit }
                // });

                const user = await User.findById(userId)
                    .populate({
                        path: 'cart.product',
                        options: { skip, limit }
                    })
                    .populate({
                        path: 'cart.product',
                        populate: {
                            path: 'category',
                            model: 'productCategory' // Corrected model name
                        }
                    });

                // console.log("User", user.cart[1].product);

                const cart = user.cart;
                const totalCount = cart.length;
                const totalPages = Math.ceil(totalCount / limit);

                // console.log(`cart ${cart} user ${user} userId ${userId} cart.productname ${cart.productName}`)
                console.log("from load cart", cart.length)
                let cartLen = cart.length;

                res.render('user/shoping-cart', { cart, user, session: req.session.user, currentPage: page, totalPages, totalCount, cartLen, message: cartLen === 0 ? "The Cart Is Empty" : "" })
            }
        } catch (err) {
            console.log(err);
            res.render('user/500')
        }
    },


    async addToCart(req, res) {
        const userId = req.session.user;
        const { product } = req.body;

        try {
            const pro = await Product.findOne({ _id: product }).populate('category')
            const user = await User.findById(userId).populate('cart.product')
            const cart = user.cart;
            let incrementAmount
            if (pro.category.offer > pro.offer) {
                const discountAmount = (pro.price * pro.category.offer) / 100;
                incrementAmount = pro.price - discountAmount;
            } else {
                const discountAmnt = (pro.price * pro.offer) / 100
                incrementAmount = pro.price - discountAmnt
            }



            const productInTheCart = cart.find(cartItem => cartItem.product.equals(product));

            if (productInTheCart) {
                await User.updateOne(
                    { _id: userId, 'cart.product': product },
                    {
                        $inc: {
                            'cart.$.quantity': 1,
                            'cart.$.totalAmount': incrementAmount,
                            'grandTotal': incrementAmount
                        }
                    }
                );
                const user = await User.findById(userId);
                const cartLen = user && user.cart ? user.cart.length : 0;
                return res.json({ message: "The product quantity incremented", cartLen })
            } else {
                await User.updateOne(
                    { _id: userId },
                    {
                        $addToSet: {
                            cart: { product, quantity: 1, totalAmount: incrementAmount },
                        },
                        $inc: {
                            grandTotal: incrementAmount
                        }
                    }
                );
                const user = await User.findById(userId);
                const cartLen = user && user.cart ? user.cart.length : 0;
                return res.json({ message: "Product added to Cart", cartLen })
            }
        } catch (error) {
            console.log("Error in adding the product to the cart", error);
            res.render('user/500')
        }

    },


    async deleteFromCart(req, res) {
        const { product } = req.body;
        const userId = req.session.user;

        try {
            const user = await User.findById(userId).populate('cart.product');
            const removedItem = await user.cart.find(cartItem => cartItem.product.equals(product));

            if (removedItem) {
                const reductionAmount = removedItem.totalAmount;

                await User.updateOne({ _id: userId }, { $pull: { cart: { product: product } } });

                const updatedGrandTotal = user.grandTotal - reductionAmount;

                await User.updateOne({ _id: userId }, { grandTotal: updatedGrandTotal });

                const user1 = await User.findById(userId);
                const cartLen = user1 && user1.cart ? user1.cart.length : 0;

                res.json({ message: `Item with ID=${product} removed`, grandTotal: updatedGrandTotal, cartLen });
            } else {
                return res.status(404).json({ message: 'Item not found in the cart' });
            }
        } catch (error) {
            console.error('Error removing product from cart:', error);
            res.status(500).json({ message: 'Failed to remove product from cart' });
        }
    },


    async qntUpdate(req, res) {
        try {
            const user = await User.findById(req.session.user);
            const cartItem = user.cart.find(item => item.product.toString() === req.body.productId);

            if (cartItem) {
                const product = await Product.findById(cartItem.product).populate('category');

                let offer = product.category.offer > product.offer ? product.category.offer : product.offer;

                if (req.body.action === "increment" && cartItem.quantity < product.stock_count) {
                    cartItem.quantity += 1;
                } else if (req.body.action === "decrement" && cartItem.quantity > 1) {
                    if (cartItem.quantity - 1 >= 0) {
                    cartItem.quantity -= 1;
                    }
                // } else {
                //     return res.status(400).json({ message: "Invalid quantity update request" });
                }
                console.log("after update ", cartItem.quantity);
                cartItem.totalAmount = (product.price - (product.price * offer) / 100) * cartItem.quantity;

                let totalCartAmount = user.cart.reduce((total, item) => total + item.totalAmount, 0);
                user.grandTotal = totalCartAmount;

                await user.save();

                return res.status(200).json({
                    message: "Success",
                    quantity: cartItem.quantity,
                    totalAmount: cartItem.totalAmount,
                    grandTotal: user.grandTotal,
                    stock_count: product.stock_count
                });
            } else {
                console.log("Cart item not found");
                return res.status(404).json({ message: "Cart item not found" });
            }
        } catch (err) {
            console.log(err);
            return res.status(500).json({ message: "Internal Server Error" });
        }
    },
    

    async productDetails(req, res) {
        try {
            const session = req.session.user;
            const { id } = req.params;
            const details = await Product.findById({ _id: id }).populate('category')
            // console.log("from details", details);

            const user = await User.findById(req.session.user).populate({
                path: 'cart.product',

            })

            console.log(details.category.offer, "cat offer");
            console.log(details.offer, "prd offer");
            let offer
            if (details.category.offer > details.offer) {
                offer = details.category.offer
            } else {
                offer = details.offer
            }

            cart = user.cart
            const cartLen = cart ? user.cart.length : 0;
            // console.log("Detials", details);
            if (details) {
                // console.log("Product Details Rendering");
                res.render('user/productDetails', { details, session, id, cart, cartLen, offer })
                // res.render('user/forDelete', { details, session, id, cart})
            }
            // console.log("gdfg", details.category);


        } catch (error) {
            console.log(error.message);
            res.render("admin/500")
        }

    },

    async showCoupons(req, res) {
        try {
            const user = await User.findById(req.session.user)
            const { grandTotal } = user
            console.log("Grad from shwoe ", grandTotal);
            const coupons = await Coupon.find({
                minimumPurchaseAmount: { $lte: grandTotal + 500 },
                isActive: true,
            })
            console.log("coupon backend");
            res.json(coupons)
        } catch (err) {
            console.log(err);
        }
    },


    async applyCouponCode(req, res) {
        try {
            const { code } = req.body;
            code.trim()
            console.log("From appllyCouponCode :-  ", code);
            const currentCoupon = await Coupon.findOne({ code })
            if (currentCoupon.length === 0) {
                console.log("There is no copon same as user enterd ");
            } else {
                req.session.coupon = currentCoupon;
                return res.json(currentCoupon)
            }




        } catch (err) {
            console.log(err);
        }
    },

    async filtering(req, res) {
        try {
            const { category } = req.body
            const page = parseInt(req.query.page) || 1;
            const limit = 12;

            const aggregationPipeline = [];





            // if (category === "All") {
            //     const products = await Product
            //         .find({ is_delete: false })
            //         .populate({
            //             path: 'category',
            //             match: { is_disable: false }
            //         })
            //     res.render('user/shop-grid', { products });
            // }

            if (category && category !== 'null') {
                console.log("category", category);

                // Assuming 'category' is an array of category IDs
                const categoryObjectId = new mongoose.Types.ObjectId(category);
                aggregationPipeline.push({
                    $match: {
                        $and: [
                            { category: categoryObjectId },
                            { is_delete: false }
                            // Add more conditions if needed
                        ]
                    }
                });
            }



            // Count total products for pagination calculation
            const totalCount = await Product.countDocuments({ is_delete: false });
            const totalPages = Math.ceil(totalCount / limit);
            const skip = (page - 1) * limit;
            aggregationPipeline.push({ $skip: skip });
            aggregationPipeline.push({ $limit: limit });

            // Execute the aggregation pipeline on your Product model
            console.log("dd", aggregationPipeline);
            const products = await Product.aggregate(aggregationPipeline);
            console.log('Found Products:', products.length);


            res.json({
                success: true,
                products,
                currentPage: page,
                totalPages: totalPages,
                totalCount

            });

            // res.status(200).json({ success: true, message: 'Successfully processed the request' });


        } catch (err) {
            console.log(err);
            res.status(500).json({ success: false, message: 'Internal server error' });

        }
    }


};










