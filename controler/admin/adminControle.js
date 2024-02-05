const express = require('express')
const User = require('../../models/userModel')
const Order = require('../../models/orderModel')


module.exports = {

    loadLogin(req, res) {
        res.render('admin/authentication-login')
    },

    //Admin logouting and destroying the session
    logout(req, res) {
        try {
            req.session.destroy();
            res.redirect('/admin/')

        } catch (err) {
            console.log("Logout", err);
            res.render('user/500')
        }
    },

    loadIndex(req, res) {
        res.render('admin/index')
    },

    loadCategory(req, res) {
        res.render('admin/category')
    },

    //Loading the users list
    async loadUserList(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = 10;
            const skip = (page - 1) * limit;


            const { query } = req.query;
            // console.log(query)
            let users, totalCount;
            if (query) {  //User searched products finding.
                const regex = new RegExp(query, 'i');
                users = await User.find({ userName: { $regex: regex } })
                    .skip(skip)
                    .limit(limit)
                    .sort({ _id: -1 });

                totalCount = await User.countDocuments({ userName: { $regex: regex } });
            } else {
                users = await User.find()
                    .skip(skip)
                    .limit(limit)
                    .sort({ _id: -1 });

                totalCount = await User.countDocuments();
            }

            res.render("admin/userList", {
                users,
                totalCount,
                currentPage: page,
                totalPages: Math.ceil(totalCount / limit),
                query: query || ""
            });
        } catch (error) {
            console.log("Users list", error)
            res.render("admin/500", { error });
        }
    },

    //Unblocking the user
    async unblock_user(req, res) {
        try {
            const { id } = req.params;
            const unblocked = await User.updateOne({ _id: id }, { $set: { is_blocked: false } })
            if (unblocked) {
                res.redirect('/admin/userList')
            }
        } catch (error) {
            console.log(error.message);
            res.render("admin/500")

        }
    },

    //Blocking the user
    async block_user(req, res) {
        try {
            const { id } = req.params;
            const blocked = await User.updateOne({ _id: id }, { $set: { is_blocked: true } })
            if (blocked) {
                res.redirect('/admin/userList')
            }
        } catch (error) {
            console.log(error.message);
            res.render("admin/500")
        }
    },

    //loading orders list page
    async loadOrder(req, res) {
        try {
            const session = req.session.admin
            const orders = await Order.find().populate('products.product').sort({ _id: -1 });

            res.render('admin/orders', { session, orders })

        } catch (err) {
            console.log(err.message)
            res.render("admin/500")
        }
    },
    // change status
    async changeDeliveryStatus(req, res) {
        const userId = req.params.userId;
        const newStatus = req.body.newStatus;
        try {
            const updatedUser = await Order.findByIdAndUpdate(userId, { status: newStatus }, { new: true });

            if (updatedUser) {
                res.status(200).json({ message: 'Success' });
            } else {
                res.status(404).json({ error: 'User not found' });
            }
        } catch (error) {
            console.error('Error updating user status:', error.message);

        }
    },

    async loadReturnReq(req, res) {
        try {
            const returnRequests = await Order.find({ status: "Return Processing" }).populate('products.product').populate('user.User');
            res.render('admin/returnRequest', { returnRequests });
        } catch (err) {
            console.error("Error:", err.message);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    },


    async returnUpdation(req, res) {
        try {
            const { requestId, status } = req.body;
            const order = await Order.findById(requestId).populate('user.User')
            const user = await User.findById(order.user)

            user.wallet.balance += order.totalPrice
            const transactionData = {
                amount: order.totalPrice,
                description: "Order Returned",
                type: "Credit",
            };
            user.wallet.transactions.push(transactionData);
            await user.save();

            const updatedOrder = await Order.findByIdAndUpdate(
                requestId,
                { $set: { status: status } },
                { new: true } // Return the updated document
            );

            if (!updatedOrder) {
                return res.status(404).json({ error: 'Order not found' });
            }

            // Send a success response
            res.status(200).json({ message: 'Order status updated successfully', updatedOrder });



            // Your existing code here
        } catch (error) {
            console.error("Error updating order status:", error.message);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }


}




