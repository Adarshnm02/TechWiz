const express = require('express')
const User = require('../../models/userModel')
const Product = require("../../models/productModel")




module.exports = {
async load_cart(req, res) {
    try {
        if(req.session.user){
            const userId = req.session.user;
            const user = await User.findById(userId).populate('cart.product')
            const cart = user.cart;

            console.log(`cart ${cart} user ${user} userId ${userId} cart.productname ${cart.product}`)
            res.render('user/shoping-cart', { cart, user , session : req.session.user})
        }
    } catch (err) {
        console.log(err);
        res.render('user/500')
    }
},




async addToCart (req,res) {
    const userId = req.session.user;
    const {product} = req.body;

    try{
        const pro = await Product.findOne({_id: product})
        const user = await User.findById(userId).populate('cart.product')
        const cart = user.cart;
        const incrementAmount = pro.price;

        const productInTheCart = cart.find(cartItem => cartItem.product.equals(product));

        if(productInTheCart){
            await User.updateOne(
                {_id: userId, 'cart.product': product },
                { $inc: {
                    'cart.$.quantity': 1,
                    'cart.$.totalAmount': incrementAmount,
                    'grandTotal': incrementAmount
                }}
            );
            return res.json({message: "The product quantity incremented"})
        } else {
            await User.updateOne(
                {_id: userId},
                {
                    $addToSet: {
                        cart: {product, quantity: 1, totalAmount: incrementAmount},
                    },
                    $inc: {
                        grandTotal: incrementAmount
                    }
                }
            );
            return res.join({ message: "Product added to Cart"})
        }
    }catch(error){
        console.log("Error in adding the product to the cart", error);
        res.render('/user/500')
    }
    
},


async deleteFromCart (req, res){
    const { product } = req.body;
    const userId = req.session.user;

    try {
        const user = await User.findById(userId).populate('cart.product');
        const removedItem = user.cart.find(cartItem => cartItem.product.equals(product));

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








}