const express = require('express')
const User = require('../../models/userModel')
const Product = require("../../models/productModel")




module.exports = {
    async load_cart(req, res) {
        try {
            if (req.session.user) {
                const page = parseInt(req.query.page) || 1; // Extract the page number from the query string
                const limit = 6; // Set the number of products per page
                const skip = (page - 1) * limit;
                const userId = req.session.user;
                const user = await User.findById(userId).populate({
                    path: 'cart.product',
                    options: { skip, limit }
                });
                // Count total products for pagination calculation
                // const totalCount = await Product.countDocuments({ is_delete: false });
                const cart = user.cart;
                const totalCount = cart.length; // Total items in the cart
                const totalPages = Math.ceil(totalCount / limit);

                console.log(`cart ${cart} user ${user} userId ${userId} cart.productname ${cart.productName}`)
                res.render('user/shoping-cart', { cart, user, session: req.session.user, currentPage: page, totalPages, totalCount })
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
            const pro = await Product.findOne({ _id: product })
            const user = await User.findById(userId).populate('cart.product')
            const cart = user.cart;
            const incrementAmount = pro.price;

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
                return res.json({ message: "The product quantity incremented" })
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
                return res.json({ message: "Product added to Cart" })
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

                res.json({ message: `Item with ID=${product} removed`, grandTotal: updatedGrandTotal });
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
                const product = await Product.findById(cartItem.product);

                if (req.body.action === "increment" && cartItem.quantity <= product.stock_count) {
                    if (cartItem.quantity  > product.stock_count) {
                        console.log("from qnt exeed ", cartItem.quantity);
                        return res.status(400).json({ message: "Insufficient Stock" });
                    } else {
                        cartItem.quantity += 1;
                        cartItem.totalAmount = product.price * cartItem.quantity;
                    }
                } else if (req.body.action === "decrement" && cartItem.quantity > 1) {
                    if (cartItem.quantity - 1 >= 0) {
                        cartItem.quantity -= 1;
                        cartItem.totalAmount = product.price * cartItem.quantity;
                    }
                }

                let totalCartAmount = 0;
                user.cart.forEach(item => {
                    totalCartAmount += item.totalAmount;
                });
                user.grandTotal = totalCartAmount;

                await user.save();

                return res.status(200).json({
                    message: "Success",
                    quantity: cartItem.quantity,
                    totalAmount: cartItem.totalAmount,
                    grandTotal: user.grandTotal
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
            console.log("Session from product details ", session);
            const { id } = req.params;
            const details = await Product.findById({ _id: id })
            console.log("from details", details);

            const user = await User.findById(req.session.user).populate({
                path: 'cart.product',

            })
            
            cart = user.cart
            console.log(details);
            
            if (details) {
                console.log("Product Details Rendering");
                res.render('user/productDetails', { details, session, id, cart})
            }
            console.log("gdfg", details.category);
            console.log("dsdsddddddddd");

        } catch (error) {
            console.log(error.message);
            res.render("admin/500")
        }

    },
};








