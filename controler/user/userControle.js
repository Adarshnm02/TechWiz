const express = require('express')

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

module.exports = {loadHome,login,loadShop,loadBlog}
