const user_Route = require('express').Router()
const userCtrl = require('../controler/user/userControle')

// userRot = require('./views/user')


user_Route.get('/',userCtrl.loadHome)
user_Route.get('/index',userCtrl.loadHome)
user_Route.get('/login',userCtrl.login)
user_Route.get('/shop-grid',userCtrl.loadShop)
user_Route.get('/blog',userCtrl.loadBlog)




module.exports = user_Route;
