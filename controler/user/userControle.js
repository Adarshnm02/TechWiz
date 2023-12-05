const express = require('express')
// const UserOTPVerification = require("../../models/userOTPVerification")
const User = require('../../models/userModel')
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');





const loadHome = (req,res)=>{
  
        res.render('user/index')
        
}
const login = (req,res)=>{
        res.render('user/user_login')
}

const loadShop = (req,res)=>{
        res.render('user/shop-grid')
}
const loadBlog = (req,res)=>{
        res.render('user/blog')
}

const loadSignup = (req,res)=>{
    res.render('user/userSignup')
}

const loadDel = (req,res)=>{
    res.render('user/forDelete')
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



module.exports = {loadHome, login, loadShop, loadBlog, insertUser, loadSignup, loadDel, userLogin };













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
