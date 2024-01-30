const express = require('express')
const User = require('../../models/userModel')
const Product = require('../../models/productModel')
const Address = require('../../models/addressModel')
const Order = require('../../models/orderModel')


const { render } = require('ejs')

module.exports = {

    async loadProfile(req, res) {
        try {

            const session = req.session.user

            const address = await Address.find({ userId: req.session.user })
            const user = await User.findById(req.session.user)
            // console.log(address);
            // console.log("from profile", session)
            const cartLen = user && user.cart ? user.cart.length : 0;
            res.render('user/user_profile', { user, address, session, cartLen })

        } catch (err) {
            console.log("Profile loading error ", err);
            res.render("user/500")
        }
    },
    async loadProfileAddress(req, res) {
        try {
            // const userId = req.session.user
            const session = req.session.user

            const address = await Address.find({ userId: req.session.user })
            console.log("from load addres", address);
            const user = await User.findById(req.session.user)
            const cartLen = user && user.cart ? user.cart.length : 0;
            res.render('user/profile_address', { user, address, session, cartLen })

        } catch (err) {
            console.log("Profile loading error ", err);
            res.render("user/500")
        }
    },


    async loadEditProfile(req, res) {
        try {
            const session = req.session.user;
            const user = await User.findById(session)
            const cartLen = user && user.cart ? user.cart.length : 0;
            res.render('user/editProfile', { user, session, cartLen });

        } catch (err) {
            console.log(err);
            res.render('user/500');
        }
    },

    async updateProfile(req, res) {
        try {
            const userId = req.session.user
            console.log(userId)

            const { userName, mobile } = req.body;

            if (userName) {
                const user = await User.findById(userId);

                if (!user) {
                    console.log("User is Not found");
                    return res.status(404).render('user/404');
                }
                user.userName = userName;
                user.mobile = mobile;
                // user.email 

                await user.save();
                console.log(user, "form submited");
                res.redirect('/profile')
            }

        } catch (err) {
            console.log(err);
            res.render('user/500');
        }
    },

    async loadEditAddress(req, res) {
        try {
            let session = req.session.user
            const addressId = req.params.id
            const address = await Address.findOne({ _id: addressId }).populate('userId')
            // console.log("from adderere ", address);
            // console.log("form params ", req.params);
            const user = await User.findById(session);
            const cartLen = user && user.cart ? user.cart.length : 0;
            return res.render('user/editAddress', { session, address, cartLen })

        } catch (err) {
            console.log(err);
            res.render('user/500')
        }
    },
    async loadAddAddress(req, res) {
        try {
            let session = req.session.user
            const user = await User.findById(session);
            const cartLen = user && user.cart ? user.cart.length : 0;
            return res.render('user/addAddress', { session, cartLen })

        } catch (err) {
            console.log(err);
            res.render('user/500')
        }
    },

    async addAddress(req, res) {
        try {
            // let session = req.session.user
            const { userName, email, mobile, city, postCode, district, state, country, houseName } = req.body
            if (userName && email && mobile && city && postCode && district && state && country) {
                const otherAddress = await Address.find({ userId: req.session.user })

                if (otherAddress.length < 3) {
                    const newAddress = new Address({
                        userId: req.session.user,
                        userName: userName,
                        email: email,
                        mobile: mobile,
                        city: city,
                        postCode: postCode,
                        district: district,
                        country: country,
                        state: state,
                        houseName: houseName,
                        default: (otherAddress.length === 0) ? true : false
                    })
                    await newAddress.save();
                    // res.redirect('/profile/address')
                    const url = req.session?.url ? req.session.url : "/index"
                    return res.redirect(url)

                } else {
                    res.send({ status: 'fail', message: 'You can only have up to three addresses.' })
                    console.log("Address limit exceeded");
                }

            }
        } catch (error) {
            console.log(error);
            res.render('user/500')
        }

    },



    async editAddress(req, res) {

        const { userName, mobile, email, address, city, district, state, country, postCode } = req.body;
        try {


            const result = await Address.updateOne(
                { _id: req.params.id },
                {
                    $set: {
                        userName: userName,
                        email: email,
                        mobile: mobile,
                        houseName: address,
                        city: city,
                        district: district,
                        postCode: postCode,
                        state: state,
                        country: country,

                    }
                }
            );
            if (!result) {
                // console.log("updated result ", result);
                // res.redirect('/profile/address');
                res.status(404).send('Address not found');
            }

            const url = req.session?.url ? req.session.url : "/index"
            return res.redirect(url)
            // res.status(404).send('Address not found');

        } catch (error) {
            console.log(error.message);
            res.status(500).send('Internal Server Error');
        }
    },
    async removeAddress(req, res) {
        try {
            const { addressId } = req.body;

            const result = await Address.findByIdAndDelete(addressId);
            console.log("result ", result);

            if (result) {
                console.log("Deleted address:", result);
                res.json({ success: true, result })
            }
        } catch (error) {
            console.error("Error:", error);
            res.status(500).json({ message: "Internal Server Error" });
        }
    },





    async loadOrder(req, res) {
        try {
            // const userId = req.session.user
            const session = req.session.user
            const page = parseInt(req.query.page) || 1;
            const limit = 10;
            const skip = (page - 1) * limit;
            console.log("From orders in ");
            const address = await Address.find({ userId: req.session.user })
            const orders = await Order.find({ user: req.session.user }).populate('products.product').populate('user').skip(skip)
                .limit(limit)
                .sort({ _id: -1 });
            // console.log(orders[0].user.userName);
            // console.log(orders.length, "sadfg");

            const user = await User.findById(req.session.user)
            const totalCount = await Order.countDocuments({});
            const totalPages = Math.ceil(totalCount / limit);

            console.log(page, totalPages, totalCount);
            // console.log("fndsdjanfnsdfnsdakfnsdk", orders[0].products[0].product.product_name)
            const cartLen = user && user.cart ? user.cart.length : 0;

            res.render('user/orders', { user, address, session, orders, currentPage: page, totalPages, totalCount, cartLen })

        } catch (err) {
            console.log("Profile loading error ", err);
            res.render("user/500")
        }
    },

    // cancelorder
    async cancelOrder(req, res) {
        let { id } = req.params;
        const { reason } = req.body;
        console.log(id, reason);
        try {
            const result = await Order.findOneAndUpdate(
                { orderId: id },
                { $set: { status: 'Cancelled', cancelReason: reason } },
                { new: true }
            );

            console.log("from cancel ", result.products[0].quantity);

            for (const item of result.products) {
                let product = await Product.findById(item.product);

                product.stock_count += item.quantity;


                await product.save();
            }
            const order = await Order.find({orderId: id})
                console.log("order", order[0].paymentMethod, order[0].status);

            if (order[0].paymentMethod !== "cod" && order[0].status === 'Cancelled' || order[0].status === 'Return Complited') {

                const user = await User.findById(req.session.user)
                console.log(user);

                user.wallet.balance += order[0].grandTotal;
                const transactionData = {
                    amount: order[0].grandTotal,
                    description: "Order cancelled",
                    type: "Credit",
                };
                user.wallet.transactions.push(transactionData);
                console.log("wallet ", user.wallet);
                await user.save();
            } else {
                console.log("User not found");
            }

            return res.json({ success: true, message: 'Order cancelled successfully.', result });
        } catch (err) {
            console.error('Error cancelling order:', err);
            return res.status(500).json({ success: false, message: 'Failed to cancel order. Please try again.' });
        }
    },


    async returnOrder(req, res) {
        try {
            let { id } = req.params;
            const { reason } = req.body;
            console.log(id, reason, 'gfdgfjguyedyrsgchgvuhvhgssyditgfhh');


            const result = await Order.findOneAndUpdate(
                { orderId: id },
                { $set: { status: 'Return Processing', returnReason: reason } },
                { new: true }
            );


            console.log(result, "foeroejfa");

            return res.json({ success: true, message: 'Order Returend Successfully', result })
        } catch (err) {
            console.error(err);
            return res.status(500).json({ success: false, message: 'Failed to Return Order. Please try again.' });
        }

    },

    async loadOrderDetials(req, res) {
        try {
            const session = req.session.user
            const user = await User.findById(req.session.user)
            const orderId = req.query.orderId;


            const order = await Order.find({ orderId: orderId }).populate('user').populate('products.product')
            // console.log(order[0].products);
            


            const cartLen = user && user.cart ? user.cart.length : 0;

            res.render('user/orderDetials', { session, user, order, cartLen })
        } catch (err) {
            console.log(err);

        }
    }














    // async returnOrder(req, res, next){
    //     try {
    //       let { id } = req.params;
    //       const { reason } = req.body;
    //       const foundOrder = await Order.findById(id).populate(
    //         "products.product"
    //       );
    //       console.log("dddddddddddddddd", foundOrder);

    //       const foundProduct = await Product.findOne({
    //         product_name: req.body.product,
    //       });
    //       // console.log("ffffffffffffffffffffffffff",foundProduct);
    //       const returnProduct = new Return({
    //         user: req.session.user,
    //         order: foundOrder._id,
    //         product: foundProduct._id,
    //         quantity: parseInt(req.body.quantity),
    //         reason: reason,
    //         address: foundOrder.deliveryAddress,
    //       });
    //       await returnProduct.save();
    //       foundOrder.products.forEach((product) => {
    //         if (product.product._id.toString() === foundProduct._id.toString()) {
    //           product.returnRequested = "Pending";
    //         }
    //       });
    //       await foundOrder.save();
    //       res.redirect("/user/orders");
    //     } catch (error) {
    //       console.log(error.message);
    //     }
    //   },



}












// async loadEditAddress(req,res) {
//     const session = req.session.user;
//     let cartnum;
//     if(req.session.user){
//       cartnum = await User.findById(req.session.user)
//       //  console.log("jjjjjjjjjjjjj",currentuser.cart.length);
//           }

//     // console.log('dddddddddddd'+req.query.addressid);
//     try{
//         const address = await Address.findById(req.query.addressid)
//         // console.log("vvvvvvvvvvv"+address);
//         res.render('user/editAddress',{session,cartnum, address })

//     }
//     catch(error){
//         console.log(error.message);
//     }
// },