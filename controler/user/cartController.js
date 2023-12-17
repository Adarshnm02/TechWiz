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
        res.render('user/500')
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

async qntUpdate (req,res){
    try{
        let user = await User.findById(req.session.user)
        let cart = await user.cart.find(items => items.product._id.toString() === req.params.id)
        if(cart){
            const product = await cart.product.findById(cart.product)
            if(req.body.type === "increment"){
                if(cart.quantity + 1 > product.stock_count){
                    return res.send("Insufficient Stock")

                }else{
                    cart.quantity += 1;
                    cart.totalAmount = product.price * cart.quantity;
                }
            }else if (req.body.type === "decrement"){
                if(cart.quantity - 1 >= 0){
                    cart.quantity -= 1;
                    cart.totalAmount = product.price * cart.quantity;
                }
            } 

            let grandTotal = user.cart.forEach(item => totalCartAmount += item.totalAmount )
            user.grandTotal = totalCartAmount

            await user.save()

            return res.status(200).json({
                message: "susses",
                quantity: cart.quantity,
                totalAmount: cart.totalAmount,
                grandTotal: cart.grandTotal
            })


        }else{
            console.log("cart is not found");
            res.render('user/500')
        }

    }catch(err){
        console.log(err);
        res.render('user/500')
    }
}







}