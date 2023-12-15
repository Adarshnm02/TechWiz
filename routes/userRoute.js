const user_Route = require('express').Router()


// const {loadHome,login,loadShop,loadBlog,loadOTPpage,checkOTPValid,resedOtp,loadSignup }  = require('../controler/user/userControle')
const  userControle = require('../controler/user/userControle')
const productControl = require('../controler/admin/productControl')
const Auth = require('../middleware/Auth')
// const UserOTPVerification = require("../models/userOTPVerification")

// userRot = require('./views/user')



user_Route.get('/', userControle.loadHome)
user_Route.get('/index', userControle.loadHome)

//Login 
user_Route.get('/login', Auth.isLogged, userControle.login)
user_Route.post('/login', userControle.userLogin)
user_Route.get('/logout', Auth.logouting, userControle.logout)

//Signup
user_Route.get('/signup', Auth.isLogged, userControle.loadSignup)
user_Route.post('/signup', userControle.insertUser)

user_Route.get("/otpVerification", Auth.isLogged, userControle.load_otp)
user_Route.post('/verification', userControle.otpVerification) 

//pages
user_Route.get('/shop-grid', productControl.loadShop )
user_Route.get('/blog', userControle.loadBlog)


user_Route.get('/product/Details/:id', Auth.isLogedout, productControl.productDetails)
// user_Route.get('/productDetails', productControl.productDetails)
// user_Route.get("/logindel", userControle.loadDel)

user_Route.get('/cart', Auth.isLogedout, userControle.load_cart)










// user_Route.post('/login', async (req,res)=>{
//     const {username,email} = req.body

//     try{
//         const user = new UserOTPVerification({username,email})
//         await user.save()
//         res.status(201).json({ message: 'User created successfully' });
//     }
//     catch (err) {
//        res.status(500).json({ error: err.message });
//     }
// })

// //otp verification 
// user_Route.get('/otpVerification',userControle.loadOTPpage)
//               .post('/user/otpVerification', userControle.checkOTPValid)
//               .post('/resend-otp', userControle.resedOtp)




module.exports = user_Route;
