const user_Route = require('express').Router()


// const {loadHome,login,loadShop,loadBlog,loadOTPpage,checkOTPValid,resedOtp,loadSignup }  = require('../controler/user/userControle')
const  userControle = require('../controler/user/userControle')
const UserOTPVerification = require("../models/userOTPVerification")

// userRot = require('./views/user')


user_Route.get('/', userControle.loadHome)
user_Route.get('/index', userControle.loadHome)
user_Route.get('/login', userControle.login)
user_Route.get('/shop-grid', userControle.loadShop)
user_Route.get('/blog', userControle.loadBlog)
user_Route.get('/signup', userControle.loadSignup)
// user_Route.post('/signup',userControle)

user_Route.post('/login', async (req,res)=>{
    const {username,email} = req.body

    try{
        const user = new UserOTPVerification({username,email})
        await user.save()
        res.status(201).json({ message: 'User created successfully' });
    }
    catch (err) {
       res.status(500).json({ error: err.message });
    }
})

//otp verification 
user_Route.get('/otpVerification',userControle.loadOTPpage)
              .post('/user/otpVerification', userControle.checkOTPValid)
              .post('/resend-otp', userControle.resedOtp)



// async function findAda(){
//     try{
//         const output = new UserOTPVerification.findOne({name : "Adarsh nm"})
//         if(output){
//             console.log(output);
//         }else{
//             console.log("Not Fetching");
//         }
//     }catch(err){
//         console.log(err);
//     }
// }
// findAda()


module.exports = user_Route;
