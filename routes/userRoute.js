const user_Route = require('express').Router()


// const {loadHome,login,loadShop,loadBlog,loadOTPpage,checkOTPValid,resedOtp,loadSignup }  = require('../controler/user/userControle')
const  userControle = require('../controler/user/userControle')
const productControl = require('../controler/admin/productControl')
// const UserOTPVerification = require("../models/userOTPVerification")

// userRot = require('./views/user')



user_Route.get('/', userControle.loadHome)
user_Route.get('/index', userControle.loadHome)

//Login 
user_Route.get('/login', userControle.login)
user_Route.post('/login', userControle.userLogin)

//Signup
user_Route.get('/signup', userControle.loadSignup)
user_Route.post('/signup' ,userControle.insertUser)

//pages
user_Route.get('/shop-grid', productControl.loadShop )
user_Route.get('/blog', userControle.loadBlog)

user_Route.post('/verification' ,userControle.otpVerification)


user_Route.get('/product/Details/:id',productControl.productDetails)
// user_Route.get('/productDetails', productControl.productDetails)


// user_Route.get("/logindel", userControle.loadDel)
user_Route.get("/otpVerification", userControle.load_otp)









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
