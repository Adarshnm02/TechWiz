const user_Route = require('express').Router()


// const {loadHome,login,loadShop,loadBlog,loadOTPpage,checkOTPValid,resedOtp,loadSignup }  = require('../controler/user/userControle')
const userControle = require('../controler/user/userControle')
const productControl = require('../controler/admin/productControl')
const cartCtrl = require('../controler/user/cartController')
const checkoutCtrl = require('../controler/user/checkoutControler')
const Auth = require('../middleware/Auth')
const profileCtrl = require('../controler/user/profileController')
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

//profile
user_Route.get("/profile", Auth.isLogedout, profileCtrl.loadProfile)
user_Route.get("/profile/address", Auth.isLogedout, profileCtrl.loadProfileAddress)

// //forgot Password
// user_Route.get("/profile/forgotPass", userControle.loadForgetPass)
// user_Route.post("/profile/forgotPass", userControle.forgetPassword)



//forget password
user_Route.get('/forgetPassword', userControle.loadForgetPass)
user_Route.post('/forgetPassword', userControle.forgetPassword)
user_Route.get('/verifyOTPForgetPass', userControle.loadOTPForgetPassPage)
user_Route.post('/verifyOTPForgetPass', userControle.verifyOTPForgetPassPage)
user_Route.post('/changePass', userControle.changepass)



//pages
user_Route.get('/shop-grid', productControl.loadShop )
user_Route.get('/blog', userControle.loadBlog)


user_Route.get('/product/Details/:id', Auth.isLogedout, productControl.productDetails)
// user_Route.get('/productDetails', productControl.productDetails)
// user_Route.get("/logindel", userControle.loadDel)

//Cart
user_Route.get('/cart', Auth.isLogedout, cartCtrl.load_cart)
user_Route.post('/addToCart', Auth.isLogedout, cartCtrl.addToCart)
user_Route.post('/removeFromCart', cartCtrl.deleteFromCart)
user_Route.post('/cart/qntUpdate', Auth.isLogedout, cartCtrl.qntUpdate)
// user_Route.post('/cart/decrement/:id', Auth.isLogedout, cartCtrl.qntUpdate)


//checkout
user_Route.get('/checkout', Auth.isLogedout, checkoutCtrl.loadCheckout)
user_Route.post('/checkout', Auth.isLogedout, checkoutCtrl.saveOrder)
user_Route.post('/checkStock', Auth.isLogedout, checkoutCtrl.checkStock)
user_Route.post('/razorpay', Auth.isLogedout, checkoutCtrl.createId)

// order
user_Route.get('/order', profileCtrl.loadOrder)

//Address
user_Route.get('/addAddress', Auth.isLogedout, profileCtrl.loadAddAddress)
user_Route.post('/addAddress', Auth.isLogedout, profileCtrl.addAddress)
user_Route.get('/editAddress/:id', Auth.isLogedout, profileCtrl.loadEditAddress)
user_Route.post('/editAddress/:id', Auth.isLogedout, profileCtrl.editAddress)


module.exports = user_Route;
