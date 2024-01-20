const express = require('express')
const User = require('../../models/userModel')
const Product = require('../../models/productModel')
const Address = require('../../models/addressModel')
const Order = require('../../models/orderModel')


module.exports = {

    loadLogin(req, res) {
        res.render('admin/authentication-login')
    },
    // logout(req, res) {
    //     try {
    //         req.session.destroy();
    //         res.redirect('admin/')

    //     } catch (err) {
    //         console.log(err);
    //         res.render('user/500')
    //     }
    // },


    loadIndex(req, res) {
        res.render('admin/index')
    },



    loadCategory(req, res) {
        res.render('admin/category')
    },

    async loadUserList(req, res) {
        const page = parseInt(req.query.page) || 1; // Extract the page number from the query string
        const limit = 10; // Set a limit for the number of users per page
        const skip = (page - 1) * limit;

        try {
            const { query } = req.query;
            console.log(query)
            let users;
            let totalCount;

            if (query) {
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
            console.log(error)
            res.render("admin/500", { error });
        }
    },

    async unblock_user(req, res) {
        try {
            const { id } = req.params;
            console.log("id from unblock ", id);
            const unblocked = await User.updateOne({ _id: id }, { $set: { is_blocked: false } })
            if (unblocked) {
                res.redirect('/admin/userList')
            }
        } catch (error) {
            console.log(error.message);
            res.render("admin/500")
        }
    },

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
    async loadOrderList(req, res) {
        try {
            // const userId = req.session.user
            const session = req.session.admin

            const address = await Address.find({ userId: req.session.user })
            const orders = await Order.find({ user: req.session.user }).populate('products.product')
            console.log("from back address:-", address, "orders from back", orders);
            const user = await User.findById(req.session.user)
            console.log("from profile", session)

            // console.log("fndsdjanfnsdfnsdakfnsdk", orders[0].deliveryAddress[0].email)

            res.render('admin/orderList', { session })
            // user, address,, orders

        } catch (err) {
            console.log("Profile loading error ", err);
            res.render("user/500")
        }
    },
    async loadOrder(req, res) {
        try {
            const session = req.session.admin

            const orders = await Order.find().populate('products.product').sort({ _id: -1 });

            // orders.forEach(value =>{
            //     value.forEach(item => {
            //         console.log(item);
            //     })
            //     console.log(value.product.product_name);
            // })


            res.render('admin/orders', { session, orders })

        } catch (err) {
            console.log(err)
        }
    },
    // change status
    async changeDeliveryStatus(req, res) {
        const userId = req.params.userId;
        const newStatus = req.body.newStatus;
        console.log(req.body)
        try {
            const updatedUser = await Order.findByIdAndUpdate(userId, { status: newStatus }, { new: true });

            if (updatedUser) {
                res.status(200).json({ message: 'Success' });
            } else {
                res.status(404).json({ error: 'User not found' });
            }
        } catch (error) {
            console.error('Error updating user status:', error);

        }
    },


    // async loadReturnReq(req,res){
    //     try{
    //         let ReturnOrders = await Order.find({ status : 'Returned'});

    //         if(ReturnOrders){
    //             res.render('admin/returnRequest', {ReturnOrders} );
    //         }

    //     }catch(err){
    //         console.log("Error");
    //         res.status(500).json({ error: 'Internal Server Error' });
    //     }
    // },


    // async loadReturnReq(req,res){
    //     try{
    //     const ITEMS_PER_PAGE = 10;  // Define the number of items to display per page
    //     const page = parseInt(req.query.page) || 1; // Extract the page from the query string
    //     const totalRequests = await Return.countDocuments(); // Count the total number of return requests
    //     const returnRequests = await Return.find()
    //     .populate([
    //         { path: 'user' },
    //         { path: 'order' },
    //         { path: 'product' },
    //         { path: 'address'}
    //     ])
    //     .skip((page - 1) * ITEMS_PER_PAGE) // Calculate the number of items to skip
    //     .limit(ITEMS_PER_PAGE); // Define the number of items to display per page
    //     // console.log("hkkkkkkkkkk",returnRequests);
    //     const totalPages = Math.ceil(totalRequests / ITEMS_PER_PAGE);
    //    console.log(page);
    //     res.render('admin/returnRequest',{
    //         activePage:"order",
    //         returnRequests,
    //         totalPages,
    //         currentPage: page 
    //     });

    // }catch(error){
    //     console.log(error.message);
    // }
    // }


    async loadReturnReq(req, res) {
        try {
            // Use await to wait for the asynchronous operation to complete
            const returnRequests = await Order.find({ status: "Return Processing" }).populate('products.product').populate('user.User');
            // const returnRequests = await Order.find({
            //     status: { $in: ['Return Processing', 'Return Approved', 'Return Rejected'] }
            // }).populate('products.product').populate('user.User');


            // Log the status of the first returned order (assuming there could be multiple)
            if (returnRequests.length > 0) {
                // console.log("Status of the first returned order:", returnRequests[0].deliveryAddress[0].userName);
            } else {
                console.log("No returned orders found.");
            }

            // Render the view with the returnRequests data
            res.render('admin/returnRequest', { returnRequests });
        } catch (err) {
            console.error("Error:", err);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    },

    // async returnUpdation(req,res){
    //     try{
    //         const reqStatus = req.body


    //     }catch(err){
    //         console.error("Error:", err);
    //         res.status(500).json({ error: 'Internal Server Error' });
    //     }
    // }


    // async returnUpdation(req, res) {
    //     try {
    //         const { requestId, status } = req.body;

    //         // Assuming requestId is a valid ObjectId, you can use it to update the order status
    //         const updatedOrder = await Order.findByIdAndUpdate(
    //             requestId,
    //             { $set: { status: status } },
    //             { new: true } // Return the updated document
    //         );

    //         if (!updatedOrder) {
    //             return res.status(404).json({ error: 'Order not found' });
    //         }

    //         // Send a success response
    //         res.status(200).json({ message: 'Order status updated successfully', updatedOrder });
    //     } catch (error) {
    //         console.error("Error updating order status:", error);
    //         res.status(500).json({ error: 'Internal Server Error' });
    //     }
    // },

    async returnUpdation(req, res) {
        try {
            const { requestId, status } = req.body;
            // console.log('Received Request ID:', requestId);
            // console.log('Received Status:', status);
            // console.log("From backend");
            const order = await Order.findById(requestId).populate('user.User')
            // console.log("Order finded", order, order.grandTotal);
            // order.user.wallet.balance += order.grandTotal;
            // console.log("asdf", order.user.wallet.balance);
            // await order.save()

            const user = await User.findById(order.user)
            // console.log("User ", user, user.wallet.balance);
            user.wallet.balance += order.grandTotal
            const transactionData = {
                amount: order.grandTotal,
                description: "Order cancelled",
                type: "Credit",
            };
            user.wallet.transactions.push(transactionData);
            // console.log("wallet ", user.wallet);
            await user.save();

         


            const updatedOrder = await Order.findByIdAndUpdate(
                requestId,
                { $set: { status: status } },
                { new: true } // Return the updated document
            );

            console.log(updatedOrder.status, "dsfadfasdf sfdasdf dfa adf");

            if (!updatedOrder) {
                return res.status(404).json({ error: 'Order not found' });
            }

            // Send a success response
            res.status(200).json({ message: 'Order status updated successfully', updatedOrder });



            // Your existing code here
        } catch (error) {
            console.error("Error updating order status:", error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }




    // module.exports = { returnUpdation }




}





















// async pagein(req, res){
//     const page = parseInt(req.query.page) || 1; // Extract the page number from the query string
//     const limit = 10; // Set a limit for the number of users per page
//     const skip = (page - 1) * limit;

//     try {
//         const users = await User.find().skip(skip).limit(limit); // Fetch users with pagination
//         const totalCount = await User.countDocuments(); // Get the total count of users

//         res.render('admin/userList', { users, totalCount, currentPage: page, totalPages: Math.ceil(totalCount / limit) });
//     } catch (error) {
//         // Handle errors
//         res.render('error', { error });
//     }
// },



