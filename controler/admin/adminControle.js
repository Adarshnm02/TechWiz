const express = require('express')


const loadLogin = (req,res)=>{
    res.render('admin/authentication-login')
}


const loadIndex = (req,res) =>{
    res.render('admin/index')
}



const loadCategory = (req,res)=>{
    res.render('admin/category')
}


//for sample test 
// const loadForTest = (req,res) =>{
//     res.render('admin/delete')
// }


module.exports = {loadLogin,loadIndex,loadCategory};