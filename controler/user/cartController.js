const express = require('express')
const User = require('../../models/userModel')
const Product = require("../../models/productModel")
const Coupon = require('../../models/couponModel')




module.exports = {
    async load_cart(req, res) {
        try {
            if (req.session.user) {
                const page = parseInt(req.query.page) || 1; 
                const limit = 6; 
                const skip = (page - 1) * limit;

                const userId = req.session.user;
                const user = await User.findById(userId).populate({
                    path: 'cart.product',
                    options: { skip, limit }
                });
                const cart = user.cart;
                const totalCount = cart.length; 
                const totalPages = Math.ceil(totalCount / limit);

                // console.log(`cart ${cart} user ${user} userId ${userId} cart.productname ${cart.productName}`)
                console.log("from load cart", cart.length)
                let cartLen = cart.length;
                
                res.render('user/shoping-cart', { cart, user, session: req.session.user, currentPage: page, totalPages, totalCount ,cartLen, message: cartLen === 0? "The Cart Is Empty" : ""})
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
                const user = await User.findById(userId);
                const cartLen = user && user.cart ? user.cart.length : 0;
                return res.json({ message: "The product quantity incremented" ,cartLen})
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
                return res.json({ message: "Product added to Cart" ,cartLen})
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
                const product = await Product.findById(cartItem.product);

                if (req.body.action === "increment" && cartItem.quantity <= product.stock_count - 1) {
                    if (cartItem.quantity > product.stock_count) {
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
            const details = await Product.findById({ _id: id })
            // console.log("from details", details);

            const user = await User.findById(req.session.user).populate({
                path: 'cart.product',

            })
            
            cart = user.cart
            const cartLen = cart ? user.cart.length : 0; 
            // console.log("Detials", details);
            if (details) {
                // console.log("Product Details Rendering");
                res.render('user/productDetails', { details, session, id, cart, cartLen})
                // res.render('user/forDelete', { details, session, id, cart})
            }
            // console.log("gdfg", details.category);
            

        } catch (error) {
            console.log(error.message);
            res.render("admin/500")
        }

    },

    async showCoupons(req,res){
        try{
            const coupons = await Coupon.find({})
            console.log("coupon backend");
            res.json(coupons)
        }catch(err){
            console.log(err);
        }
    },


    // async applyCouponCode(req, rea){
    //     try{
    //         const {code} = req.body;
    //         code.trim()
    //         console.log("From appllyCouponCode :-  ", code);
    //         const currentCoupon = await Coupon.find({code : code})
    //         if(currentCoupon.length === 0){
    //             console.log("There is no copon same as user enterd ");
    //         }
    //         const user = await User.findById(req.session.user).populate('cart.product')
    //         console.log(user);
    //         let grandTtl = user.grandTotal
    //         let minAmount =  currentCoupon[0].minimumPurchaseAmount
    //         console.log("GrandTtl and minAmount ", grandTtl, minAmount);            
    //         if(grandTtl <= minAmount){
    //             console.log("This is not possible");
    //         }
    //         user.grandTotal -= currentCoupon[0].minimumPurchaseAmount

    //     }catch(err){
    //         console.log(err);
    //     }
    // },


    // applyCoupen
const applyCoupen = async (req, res) => {
    try {
        const { code } = req.body
        const user = await User.findById(req.session.user).populate('cart.product')
        const Coupon = await Coupon.findOne({ code: code })
        console.log(Coupon.minimumPurchaseAmount, user.grandTotal)
        if (Coupon.minimumPurchaseAmount > user.grandTotal) {
            return res.status(403).json({ success: false, message: "Your cart value is less than the minimum purchase Amount" })
        }
        if (Coupon.couponDone) {
            console.log("This coupon has been used")
            return res.status(400).json({ success: false, message: "This coupon has been used." })
        } else {
            if (Coupon.discountType == 'Amount') {
                user.grandTotal -= Coupon.discountAmountOrPercentage
                const total = user.grandTotal
                const discount = Coupon.discountAmountOrPercentage
                await user.save()
                res.json({ success: true, total, discount, code })
            } else {
                const discount =Math.floor((user.grandTotal * Coupon.discountAmountOrPercentage) / 100);
                user.grandTotal -= discount
                const total = user.grandTotal;
                await user.save()
                res.json({ success: true, total, discount, code })
            }

        }
        await CoupenDB.findByIdAndUpdate(coupen._id, { couponDone: true })
    } catch (error) {
        console.log(error)
        res.redirect('/500')

    }
}




};








