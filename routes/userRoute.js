const user_Route = require('express').Router()


// const {loadHome,login,loadShop,loadBlog,loadOTPpage,checkOTPValid,resedOtp,loadSignup }  = require('../controler/user/userControle')
const  userControle = require('../controler/user/userControle')
const productControl = require('../controler/admin/productControl')
const cartCtrl = require('../controler/user/cartController')
const checkoutCtrl = require('../controler/user/checkoutControler')
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

//Cart
user_Route.get('/cart', Auth.isLogedout, cartCtrl.load_cart)
user_Route.post('/addToCart', cartCtrl.addToCart)
user_Route.post('/removeFromCart', cartCtrl.deleteFromCart)
user_Route.post('/cart/increment/:id', Auth.isLogedout, cartCtrl.qntUpdate)
user_Route.post('/cart/decrement/:id', Auth.isLogedout, cartCtrl.qntUpdate)


//checkout
user_Route.get('/checkout', Auth.isLogedout, checkoutCtrl.loadCheckout)


module.exports = user_Route;
