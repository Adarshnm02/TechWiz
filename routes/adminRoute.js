const express = require('express');
const adminRoute = express.Router()
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const adminCtrl = require('../controler/admin/adminControle')
// const productCtrl = require('../controler/admin/productControl')
const {loadAddProduct,addProduct} = require('../controler/admin/productControl')
const categoryCtrl = require('../controler/admin/categoryControle')

adminRoute.get('/', adminCtrl.loadLogin)
adminRoute.get('/index', adminCtrl.loadIndex)  //for delete

//Product
adminRoute.get('/addProduct', loadAddProduct)
adminRoute.post('/addProduct', upload.array('image',3), addProduct)


//Category
adminRoute.get('/addCategory', categoryCtrl.loadAddCategory)
// Use upload.single() middleware to handle single file uploads
adminRoute.post('/addCategory', upload.single('image'), categoryCtrl.addProductCategory);

// //for sample test
// adminRoute.get('/delete',adminCtrl.loadForTest)



module.exports = adminRoute;