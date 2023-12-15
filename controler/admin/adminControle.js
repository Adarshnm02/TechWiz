const express = require('express')
const User = require('../../models/userModel')


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