const user_Route = require('express').Router()

const userControle = require('../controler/user/userControle')
const productControl = require('../controler/admin/productControl')
const cartCtrl = require('../controler/user/cartController')
const checkoutCtrl = require('../controler/user/checkoutControler')
const Auth = require('../middleware/Auth')
const profileCtrl = require('../controler/user/profileController')




user_Route.get('/',Auth.isLogedout, userControle.loadHome)
user_Route.get('/index',Auth.isLogedout, userControle.loadHome)

//Login 
user_Route.get('/login', Auth.isLogged, userControle.login)
user_Route.post('/login', userControle.userLogin)
user_Route.get('/logout', Auth.logouting, userControle.logout)


//forget password
user_Route.get('/forgetPassword', userControle.loadForgetPass)
user_Route.post('/forgetPassword', userControle.forgetPassword)
user_Route.get('/verifyOTPForgetPass', userControle.loadOTPForgetPassPage)
user_Route.post('/verifyOTPForgetPass', userControle.verifyOTPForgetPassPage)
user_Route.post('/changePass', userControle.changepass)

//Signup
user_Route.get('/signup', Auth.isLogged, userControle.loadSignup)
user_Route.post('/signup', Auth.isLogged, userControle.insertUser)


user_Route.post('/verification', userControle.otpVerification)
user_Route.post('/resendOtp', userControle.resendOtp);

//pages
user_Route.get('/shop-grid',Auth.isLogedout, userControle.loadShop )
user_Route.get('/blog', userControle.loadBlog)
user_Route.get('/product/Details/:id', Auth.isLogedout, cartCtrl.productDetails)

//Cart
user_Route.get('/cart', Auth.isLogedout, cartCtrl.load_cart)
user_Route.post('/addToCart', Auth.isLogedout, cartCtrl.addToCart)
user_Route.post('/removeFromCart',Auth.isLogedout, cartCtrl.deleteFromCart)
user_Route.post('/cart/qntUpdate', Auth.isLogedout, cartCtrl.qntUpdate)



//checkout
user_Route.get('/checkout', Auth.isLogedout, checkoutCtrl.loadCheckout)
user_Route.post('/checkout', Auth.isLogedout, checkoutCtrl.saveOrder)
user_Route.post('/checkStock', Auth.isLogedout, checkoutCtrl.checkStock)
user_Route.post('/razorpay', Auth.isLogedout, checkoutCtrl.createId)

// order
user_Route.get('/order',Auth.isLogedout, profileCtrl.loadOrder)
user_Route.post('/cancelOrder/:id',Auth.isLogedout, profileCtrl.cancelOrder)
user_Route.get('/orderSuccess', Auth.isLogedout, userControle.loadHome)
user_Route.post('/returnProduct/:id' ,Auth.isLogedout, profileCtrl.returnOrder)
user_Route.get('/orderDetials', Auth.isLogedout, profileCtrl.loadOrderDetials)

//profile
user_Route.get("/profile", Auth.isLogedout, profileCtrl.loadProfile)
user_Route.get("/profile/editProfile/:id", Auth.isLogedout, profileCtrl.loadEditProfile)
user_Route.post("/profile/editProfile/:id", Auth.isLogedout, profileCtrl.updateProfile)
user_Route.get("/profile/address", Auth.isLogedout, profileCtrl.loadProfileAddress)

//Address
user_Route.get('/addAddress', Auth.isLogedout, profileCtrl.loadAddAddress)
user_Route.post('/addAddress', Auth.isLogedout, profileCtrl.addAddress)
user_Route.get('/editAddress/:id', Auth.isLogedout, profileCtrl.loadEditAddress)
user_Route.post('/editAddress/:id', Auth.isLogedout, profileCtrl.editAddress)
user_Route.post('/removeAddress/:id', Auth.isLogedout, profileCtrl.removeAddress)

//new password
user_Route.get('/newPassword', userControle.loadnewPassword)
user_Route.post('/newPassword', userControle.saveChangePassword)

//coupon
user_Route.get('/couponShow', Auth.isLogedout, cartCtrl.showCoupons)
user_Route.post('/applyCoupon', Auth.isLogedout, cartCtrl.applyCouponCode)

//filter
user_Route.post('/filterCategory', Auth.isLogedout, cartCtrl.filtering)

//wallet
user_Route.get('/wallet', Auth.isLogedout, checkoutCtrl.loadWallet)
user_Route.post('/getwallet', Auth.isLogedout, checkoutCtrl.walletPayment)

user_Route.get('/contact', userControle.loadContact)


module.exports = user_Route;