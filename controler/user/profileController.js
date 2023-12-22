const express = require('express')
const User = require('../../models/userModel')
const Product = require('../../models/productModel')
const Address = require('../../models/addressModel')
const Order = require('../../models/orderModel')
const { render } = require('ejs')

module.exports = {

    async loadProfile (req,res){
        try{
            // const userId = req.session.user
            const session = req.session.user
            
            const address = await Address.find({userId: req.session.user})
            console.log(address);
            const user = await User.findById(req.session.user)
            // console.log("from profile", session)
            res.render('user/user_profile', {user, address, session})
            
        }catch(err){
            console.log("Profile loading error ", err);
            res.render("user/500")
        }
    },
    async loadProfileAddress (req,res){
        try{
            // const userId = req.session.user
            const session = req.session.user
            
            const address = await Address.find({userId: req.session.user})
            console.log(address);
            const user = await User.findById(req.session.user)
            // console.log("from profile", session)
            res.render('user/profile_address', {user, address, session})
            
        }catch(err){
            console.log("Profile loading error ", err);
            res.render("user/500")
        }
    },


    async loadEditAddress(req, res) {
        try {
            let session = req.session.user
            const addressId = req.params.id
            const address = await Address.findOne({_id:addressId}).populate('userId')
            console.log("from adderere " , address);
            console.log("form params ", req.params);
            return res.render('user/editAddress', { session , address})

        } catch (err) {
            console.log(err);
            res.render('user/500')
        }
    },
    loadAddAddress(req, res) {
        try {
            let session = req.session.user
            return res.render('user/addAddress', { session })

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
                    res.redirect('/profile')

                }else{
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
            if (result) {
                console.log("updated result ", result);
                res.redirect('/profile');
            } else {
               
                res.status(404).send('Address not found');
            }
        } catch (error) {
            console.log(error.message);
            res.status(500).send('Internal Server Error');
        }
    },
   async loadOrder(req,res) {
        try{
            // const userId = req.session.user
            const session = req.session.user
            
            const address = await Address.find({userId: req.session.user})
            const orders = await Order.find({user: req.session.user}).populate('products.product')
            console.log("from back address:-",address, "orders from back", orders);
            const user = await User.findById(req.session.user)
            // console.log("from profile", session)
            res.render('user/orders', {user, address, session, orders})
            
        }catch(err){
            console.log("Profile loading error ", err);
            res.render("user/500")
        }
    }

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