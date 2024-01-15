const User = require('../../models/userModel')
const Product = require('../../models/productModel')
const Address = require('../../models/addressModel')
const OrderDB = require('../../models/orderModel')
const { v4: uuidv4 } = require("uuid");
const { query } = require('express');
const Razorpay = require('razorpay')

const instance = new Razorpay({
    key_id: process.env.key_id,
    key_secret: process.env.key_secret,
  });
module.exports = {


    async loadCheckout(req, res) {
        try {
            console.log('form checkout');
            let userId = req.session.user;
            // console.log("userId:- ", userId);
            // const session = req.session.user

            const address = await Address.find({ userId: req.session.user })
            // console.log("address :- ", address);

            const user = await User.findById(userId).select("-password").populate('cart.product')
            const cart = await user.cart;
            const cartLen = cart? user.cart.length : 0;

            // console.log("from loadcheckout ", user);

            res.render('user/checkout', { session: req.session.user, user, cart, address , cartLen})
        } catch (err) {
            res.render('user/500')
        }
    },

    async saveOrder(req, res) {
        const { address, payment } = req.body
        console.log("from res.body", req.body);
        console.log("form payment save", payment, address);
        try {
            const user = await User.findById(req.session.user).populate('cart')
            const addres = await Address.findById(address)
            // const currentAddress = addres[address]
            console.log(addres)

            
            console.log("grandTotal :", user.grandTotal);

            const orderId = uuidv4()

            const order = new OrderDB({
                orderId: orderId,
                user: req.session.user,
                products: user.cart,
                totalPrice: user.grandTotal,
                deliveryAddress: [addres],
                paymentMethod: payment,
                grandTotal: user.grandTotal
            })
            const data = await order.save()

            for (const cartItem of user.cart) {
                const product = await Product.findById(cartItem.product);
                product.stock_count -= cartItem.quantity;
                await product.save();
            }
            user.cart = [];
            user.grandTotal = 0;
            await user.save();

            return res.json(data);
        } catch (error) {
            console.log(error)


        }
    },




    async checkStock(req, res) {
        try {
            const user = await User.findOne({ _id: req.session.user });

            for (const cartItem of user.cart) {
                const product = await Product.findOne({ _id: cartItem.product });

                if (product.stock_count < cartItem.quantity) {
                    console.log("Insufficient stock for product:", product._id);
                    return res.json({ success: false, insufficientStockProducts: [{ productId: product._id, quantity: product.stock_count }] });
                }
            }

            console.log("All products have sufficient stock");
            return res.json({ success: true });
        } catch (error) {
            console.error('Error checking stock:', error);
            return res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
    },
    async createId(req,res){
        try{

            
            const user = await User.findOne({ _id: req.session.user });
        

            options = {
                amount: (user.grandTotal + 5) * 100,  
                currency: "INR",
                receipt: `${Math.floor(Math.random() * 10000)
                    .toString()
                    .padStart(4, "0")}${Date.now()}`, // Provide a unique receipt ID
              };
              instance.orders.create(options, function(err, order) {
                res.status(200).json(order.id)
              });
            
        }catch(err){
            console.log("Error creating ID")
        }

    }



    // const instance = new Razorpay({
    //     key_id: process.env.key_id,
    //     key_secret: process.env.key_secret,
    //   });
    //   const options = {
    //     amount: 50000,  // amount in the smallest currency unit
    //     currency: "INR",
    //     receipt: "order_rcptid_11"
    //   };
    //   instance.orders.create(options, function(err, order) {
    //     console.log(order);
    //   });

}