const user_Route = require('express').Router()
const userCtrl = require('../controler/user/userControle')

// userRot = require('./views/user')


user_Route.get('/',userCtrl)
user_Route.get




module.exports = user_Route;
