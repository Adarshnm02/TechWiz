const session = require('express-session');
const User = require('../models/userModel')


module.exports = {

async isLogged (req, res, next){
    if (req.session.user) {
        console.log("rendering indes", req.session.user); 
         res.redirect("/")
    } else {
        console.log("User there");
          next()
    }
},
async isLogedout (req, res, next) {
    if (req.session.user) {
        const user = await User.findById(req.session.user);
        if (user.is_blocked) {
            console.log("User blocked by admin");
            req.session.destroy()
            return res.redirect('/login');
        }
       next()
    } else {
        req.session.url = req.url
        res.redirect("/login")
    }
},

isAdmin (req,res,next) {
    try {
       if(!req.session.admin){
            next()
    
       }else{

        res.redirect('/admin/')
       }
    } catch (error) {
        console.log(error.message);
    }
},

async logouting (req,res,next) {
    req.session.destroy()
    res.redirect('/login')

}



}