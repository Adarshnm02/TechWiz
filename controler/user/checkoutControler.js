const User = require('../../models/userModel')
const Product = require('../../models/productModel')
const Address = require('../../models/addressModel')
const OrderDB = require('../../models/orderModel')
const Coupon = require('../../models/couponModel')
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
            let userId = req.session.user;

            const address = await Address.find({ userId: req.session.user })

            const user = await User.findById(userId).select("-password").populate('cart.product')
            const cart = await user.cart;
            const cartLen = cart ? user.cart.length : 0;

            res.render('user/checkout', { session: req.session.user, user, cart, address, cartLen, coupon: req.session?.coupon || "" })
        } catch (err) {
            res.render('user/500')
        }
    },

    async saveOrder(req, res) {

        try {
            const { address, payment } = req.body
        
            const user = await User.findById(req.session.user).populate('cart')
            const addres = await Address.findById(address)
            const coupon = req.session.coupon ? await Coupon.findById(req.session.coupon) : null;

            const orderId = uuidv4()
            let discountTotal;

            if (coupon) {
                req.session.coupon = null
                discountTotal = user.grandTotal - coupon?.discountAmount
                coupon.usedCount += 1

                if (coupon.usageLimit === coupon.usedCount) {
                    coupon.isActive = false
                }

                await coupon.save()

            } else {
                discountTotal = user.grandTotal

            }

            const userN = await User.findById(req.session.user)
            const wallet = userN.wallet.balance;
  
            if (payment === 'wallet') {
                if (discountTotal > wallet) {
                    throw new Error('Insufficient funds in the wallet!');
                } else {
                    userN.wallet.balance -= discountTotal;

                    const transactionData = {
                        amount: discountTotal,
                        description: "Order Placed",
                        type: "Debit",
                    };
                    userN.wallet.transactions.push(transactionData);
                    await userN.save();
                }
            }

            const order = new OrderDB({
                orderId: orderId,
                user: req.session.user,
                products: user.cart,
                totalPrice: discountTotal,
                deliveryAddress: [addres],
                paymentMethod: payment,
                grandTotal: user.grandTotal,
                discountAmount: (coupon) ? coupon.discountAmount : 0,
            })
            const data = await order.save()

            for (const cartItem of user.cart) {
                const product = await Product.findById(cartItem.product);
                product.stock_count -= cartItem.quantity;
                await product.save();
            }
            const userl = await User.findById(req.session.user)
            userl.cart = [];
            userl.grandTotal = 0;
            await userl.save();

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
                    return res.json({ success: false, insufficientStockProducts: [{ productId: product._id, quantity: product.stock_count }] });
                }
            }

            return res.json({ success: true });
        } catch (error) {
            console.error('Error checking stock:', error);
            return res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
    },


    async createId(req, res) {
        try {

            const { couponId } = req.body
            const user = await User.findOne({ _id: req.session.user });
            let discount = "";
            if (couponId && couponId != "undefined") {
                const coupon = await Coupon.findById(couponId)
                discount = coupon.discountAmount
            }

            options = {
                amount: (user.grandTotal - discount) * 100,
                currency: "INR",
                receipt: `${Math.floor(Math.random() * 10000)
                    .toString()
                    .padStart(4, "0")}${Date.now()}`, // Provide a unique receipt ID
            };
            instance.orders.create(options, function (err, order) {
                res.status(200).json(order.id)
            });

        } catch (err) {
            console.log("Error creating ID", err)
        }

    },

    async loadWallet(req, res) {
        try {
            if (req.session.user) {
                const user = await User.findById(req.session.user);
                const cartLen = user && user.cart ? user.cart.length : 0;
                const session = req.session.user;

                const currentUser = await User.findById(req.session.user);
                currentUser.wallet.transactions.sort((a, b) => b.timestamp - a.timestamp);

                res.render("user/wallet", { session, currentUser, cartLen });
            } else {
                console.log("Session is not found");
                res.render('user/login')
            }
        } catch (error) {
            console.log(error.message);
        }
    },


    async walletPayment(req, res) {
        try {

            const user = await User.findById(req.session.user)
            const wallet = user.wallet
            const grandTotal = user.grandTotal


            res.json({ wallet: wallet, grandTotal: grandTotal })


        } catch (error) {
            res.status(500).render("user/500")
            console.log(error);
        }
    }

}