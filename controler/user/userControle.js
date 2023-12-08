const express = require('express')
// const UserOTPVerification = require("../../models/userOTPVerification")
const User = require('../../models/userModel')
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const sendMail = require('../../util/sendMail')
const userOTP = require('../../models/userOtpModel')





const loadHome = (req,res)=>{
  
        res.render('user/index')
        
}
const login = (req,res)=>{
        res.render('user/user_login')
}


const loadBlog = (req,res)=>{
        res.render('user/blog')
}

const loadSignup = (req,res)=>{
    try{
        res.render('user/userSignup')
    }catch(error){
        console.log(error.message);
    }
}

const load_otp = (req,res)=>{
    // res.render('user/forDelete')
    const id = '123';
    res.render('user/otpVerification',{id})
}









let salt;

async function generateSalt(){
    salt = await bcrypt.genSalt(10)
}

generateSalt()

// const securePassword = async (password) => {
//     try{
//         const passwordHash = await bcrypt.hash(password,10)
//         return passwordHash
//     }catch(err){
//         console.log(err);
//         // res.render('/user/interItnalError', {err})
//     }
// }





const insertUser = async (req, res) => {
    try {
        console.log("Form req.body Body", req.body);
        const { email, username, password, confirmPassword } = req.body;

        if (email && username && password && confirmPassword) {
            const foundUser = await User.findOne({ email: email });

            if (foundUser) {
                // User already exists
                res.render('user/userSignup', {message: "User already exist"});
            } else {
                if (password === confirmPassword) {
                    const hashPassword = await bcrypt.hash(password, salt)
                    const newUser = new User({
                        userName: username,
                        email: email,
                        password: hashPassword,
                        is_verified: false
                    });

                    await newUser.save();
                    console.log("Showing newUser ", newUser);
                    console.log("User saved successfully");

                    const savedUser = await User.findOne({userName:username})
                    sendMail(req,res,savedUser._id,false)

                } else {
                    // Passwords don't match
                    res.render('user/userSignup', { message: "Confirm Password is not a match" });
                    console.log("Confirm Password is not a match");
                }
            }
        } else {
            // All fields are required
            res.render('user/userSignup', { message: "All fields are required" });
            console.log("All fields are required");
        }
    } catch (error) {
        // Handle error more appropriately, either send an error response or use error middleware
        console.log(error);
        res.status(500).send("Internal Server Error");
    }
};


const otpVerification = async(req,res) =>{
    try{
        const {OTP,ID} = req.body;
        console.log(OTP);
        if(!OTP){
           return res.render('user/otpVerification',{message:"Cannot send empty message",id:ID})
        }
        const OTPrecord = await userOTP.findOne({userId:ID})
        if(!OTPrecord){
            return res.render('user/otpVerification',{message:"Enter valied OTP",id:ID})
        }
        const { expireAt, userId, otp} = OTPrecord;
        if(expireAt<Date.now()){
            await userOTP.deleteOne({userId})
            return res.render('user/otpVerification',{message:'OTP has been expired,Please try again' ,id:ID})
        }
        console.log("11"+OTP,otp);
        const isvalid =  bcrypt.compare(OTP,otp);
        // console.log(isvalid);
        // console.log("11  "+OTP+"   helo   "+otp);
        if(!isvalid){
            return res.render('user/otpVerification',{message:'The entered OTP is invalid',id:ID})
        }
        await User.updateOne({_id: ID},{$set:{is_varified:true}})
        await userOTP.deleteOne({userId})
        req.session.user = userId._id
        return res.redirect('/')
    }catch(error){
        console.log(error.message);
        res.status(500).send('Internal Server Error')
    }

}









const userLogin = async (req,res) => {
    try{
        const {email,password} = req.body;
        if(!email || !password){
            return res.render('user/user_login',{message: "Empty field are not allowed"})
        } else {
            const verifiedUser = await User.findOne({email});

            if(!verifiedUser){
                return res.render('user/user_login', {message: "User not found"})
            }else if(verifiedUser.is_blocked === true){
                return res.render('user/user_login', {message: "Your Blocked By Admin"})
            }else if(verifiedUser.is_varified === true){
                const hashPassword = verifiedUser.password;
                const match = await bcrypt.compare(password,hashPassword)
                // const matchTemp = (password === hashPassword)? true:false
                // console.log(verifiedUser.is_varified);
                // console.log(hashPassword,password);
                // console.log(match);
                // console.log(matchTemp);

                if(!match){
                    return res.render('user/user_login',{message: "Invalid Password"})
                } else {
                    req.session.user = verifiedUser._id
                    console.log("Login Successful");
                    return res.redirect("/")
                } 
            }else {
                return res.render('user/user_login',{message: "Not a Verified User "})
            }
        }
    }catch(error){
        console.log(err);
    }
}







module.exports = {loadHome, login, loadBlog, insertUser, loadSignup, load_otp, userLogin, otpVerification };













////////////////////////////////////////////////////////////////////////////////////////////////

// const insertUser = async (req,res) => {
//     try{
//         console.log("Form req.body Body",req.body);
//         const {email, username, password, confirmPassword} = req.body;

//         if(email && username && password && confirmPassword){
//             const foundUser = User.findOne({email:email})
//             if(!foundUser){
//                 res.render('user/userSignup')
//                 console.log("User already existing"); //show in frendend
//               } else {
            
//                 if(password === confirmPassword){
//                     // const hashPassword = await bcrypt.hash(password,salt)
//                     const newUser = new User({
//                         userName: username,
//                         email: email,
//                         // phone: phone,
//                         password: password,
//                         is_varified: false
//                     })

//                     await newUser.save()
//                     console.log("Showing newUser ",newUser);
//                     console.log("User saved Successfully")
//                 } else {
//                     res.render('user/userSignup')
//                     console.log("Confirm Password is not match");
//                 }
//             }
//         } else {
//             res.render('user/userSignup')
//             console.log("All fields are require"); // show in frondend 
//         }

//     }catch(error){
//         // next(error)
//         console.log(err);
//     }
// }













//////////////////////////////////////////////////////////////////////////////////





// module.exports = {loadHome, login, loadShop, loadBlog, insertUser,loadSignup,loadDel };
