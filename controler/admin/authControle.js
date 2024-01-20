const express = require('express')
const User = require('../../models/userModel')
const bcrypt = require('bcrypt')


module.exports = {

    async checkAdmin(req, res){
        console.log("Enter to CheckAdmin");
        try {
            
            const { email, password } = req.body;
            const findAdmin = await User.findOne({ email })
            if (!findAdmin) {
                return res.render('admin/authentication-login', { message: 'Admin not found' })
            } else {
                const bpassword = findAdmin.password
                const matchpass = await bcrypt.compare(password, bpassword)
                if (!matchpass) {
                    console.log(bpassword ,"  " ,password )
                    return res.render('admin/authentication-login', { message: 'Wrong Password' })
                } else {
                    if (findAdmin.is_Admin == true) {
                        req.session.admin = findAdmin._id;
                        return res.render('admin/index')
                    } else {
                        res.render('admin/authentication-login', { message: 'Your Not Admin' })
                    }
                }
            }
            

        } catch (error) {
            console.log(error.message);
            res.render('admin/500')
        }
    },

    isLogedout (req, res, next) {
        if (req.session.admin) {
          console.log(req.session.admin);
           next()
        } else {
            console.log("Admin not found");
            res.redirect("/admin/")
        }
    }






}