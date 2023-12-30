const express = require('express')
const User = require('../../models/userModel')
const Product = require('../../models/productModel')
const Address = require('../../models/addressModel')
const Order = require('../../models/orderModel')

module.exports = {

    loadLogin(req, res) {
        res.render('admin/authentication-login')
    },


    loadIndex(req, res) {
        res.render('admin/index')
    },



    loadCategory(req, res) {
        res.render('admin/category')
    },

    async  loadUserList(req, res) {
        const page = parseInt(req.query.page) || 1; // Extract the page number from the query string
        const limit = 10; // Set a limit for the number of users per page
        const skip = (page - 1) * limit;
    
        try {
            const { query } = req.query;
            let users;
            let totalCount;
    
            if (query) {
                users = await User.find({ name: { $regex: ".*" + query + ".*" } })
                    .skip(skip)
                    .limit(limit);
    
                totalCount = await User.countDocuments({ name: { $regex: ".*" + query + ".*" } });
            } else {
                users = await User.find()
                    .skip(skip)
                    .limit(limit);
    
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
            res.render("admin/500", { error });
        }
    },

    async unblock_user (req,res){
        try{
            const {id} = req.params;
            console.log("id from unblock ", id);
            const unblocked =await User.updateOne({_id:id},{$set:{is_blocked:false}})
            if(unblocked){
            res.redirect('/admin/userList')
            }
        }catch(error){
            console.log(error.message);
            res.render("admin/500")
        }
    },
    
    async block_user(req,res){
        try{
            const {id} =req.params;
            const blocked = await User.updateOne({_id:id},{$set:{is_blocked:true}})
            if(blocked){
            res.redirect('/admin/userList')
            }
        }catch(error){
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

            res.render('admin/orderList', {  session })
            // user, address,, orders

        } catch (err) {
            console.log("Profile loading error ", err);
            res.render("user/500")
        }
    },
    async   loadOrder(req,res) {
        try{
            const session = req.session.admin

            const orders = await Order.find().populate('products')

            // console.log("fsdfdsl",orders[0]);
            
            res.render('admin/orders',{session, orders})
            
        }catch(err){
            console.log(err)
        }
    },
    // change status
    async changeDeliveryStatus (req, res) {
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
        res.status(500).json({ error: 'Internal Server Error' });
    }
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



}