const express = require('express')

const loadHome = (req,res)=>{
  
        res.render('user/index')
}



module.exports = loadHome