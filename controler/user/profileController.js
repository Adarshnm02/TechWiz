const express = require('express')
const User = require('../../models/userModel')
const Product = require('../../models/productModel')
const Address = require('../../models/addressModel')
const { render } = require('ejs')

module.exports = {

    async loadProfile (req,res){
        try{
            const userId = req.session.user
            const session = req.session.user
            
            const user = await User.findById(userId)
            const address = await Address.findById(userId)
            // console.log("from profile", session)
            res.render('user/user_profile', {user, address, session})
            
        }catch(err){
            console.log("Profile loading error ", err);
            res.render("user/500")
        }
    },


    loadEditAddress(req, res) {
        try {
            let session = req.session.user
            return res.render('user/editAddress', { session })

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

                }
            }
        } catch (error) {
            console.log(error);
            res.render('user/500')
        }

    },



    async editAddress(req, res) {
        console.log("sdsdsd");
        const { name, email, place, post, mobile, pincode, house, district, state } = req.body;
        console.log("sdsdsd");
        try {


            const result = await Address.updateOne(
                { _id: req.body.addressId },
                {
                    $set: {
                        userName: name,
                        email: email,
                        mobile: mobile,
                        houseName: house,
                        place: place,
                        post: post,
                        postCode: pincode,
                        district: district,
                        state: state
                    }
                }
            );
            console.log("sdsdsd" + req.body.addressId);
            if (result) {
                console.log(result);
                // The update was successful, redirect to the appropriate page
                res.redirect('/profile');
            } else {
                // Handle the case where the address with the given ID was not found
                res.status(404).send('Address not found');
            }
        } catch (error) {
            console.log(error.message);
            // Handle other potential errors here
            res.status(500).send('Internal Server Error');
        }
    },

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