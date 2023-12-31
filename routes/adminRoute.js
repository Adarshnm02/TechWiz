const express = require('express');
const adminRoute = express.Router()
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const { imageCrop, multiCrop } = require('../middleware/crop')

const adminCtrl = require('../controler/admin/adminControle')
// const productCtrl = require('../controler/admin/productControl')
const { loadAddProduct, addProduct } = require('../controler/admin/productControl')
const categoryCtrl = require('../controler/admin/categoryControle');
const productControl = require('../controler/admin/productControl');
const authCtrl = require('../controler/admin/authControle')

//Login
adminRoute.route('/adminlog').get(adminCtrl.loadLogin).post(authCtrl.checkAdmin)
// adminRoute.post('/admin', authCtrl.checkAdmin)

adminRoute.get('/', adminCtrl.loadLogin)
adminRoute.get('/index', adminCtrl.loadIndex)

//Product
adminRoute.get('/addProduct', authCtrl.isLogedout, loadAddProduct)
adminRoute.post('/addProduct', upload.array('image', 3), addProduct)

adminRoute.get('/products', authCtrl.isLogedout, productControl.loadProductList)
adminRoute.get('/products/:id/edit', authCtrl.isLogedout, productControl.loadedit)
adminRoute.post("/products/edit/:id", upload.array('image'), productControl.editproduct)
adminRoute.get("/products/:imageId/:id/deleteImg", authCtrl.isLogedout, productControl.deleteImgDelete)


adminRoute.get('/products/activate/:id', authCtrl.isLogedout, productControl.productActivate)
adminRoute.get('/products/deactive/:id', authCtrl.isLogedout, productControl.productDesable)

//Category

adminRoute.get('/category', authCtrl.isLogedout, categoryCtrl.category)
adminRoute.get('/addCategory', authCtrl.isLogedout, categoryCtrl.loadAddCategory)
adminRoute.post('/addCategory', upload.single('image'), categoryCtrl.addProductCategory);
adminRoute.get('/category/activate/:id', authCtrl.isLogedout, categoryCtrl.categoryActive)
adminRoute.get('/category/deactivate/:id', authCtrl.isLogedout, categoryCtrl.categoryDisable)
adminRoute.get('/category/:id/edit', authCtrl.isLogedout, categoryCtrl.loadCategoryEdit)
adminRoute.post('/category/edit/:id', upload.single('image'), categoryCtrl.updateCategory)
adminRoute.get('/category/:id/deleteImg', authCtrl.isLogedout, categoryCtrl.imageDelete)


//User management

adminRoute.get('/userList', authCtrl.isLogedout, adminCtrl.loadUserList)
adminRoute.get('/userList/Unblock/:id', authCtrl.isLogedout, adminCtrl.unblock_user)
adminRoute.get('/userList/Block/:id', authCtrl.isLogedout, adminCtrl.block_user)


// orders

adminRoute.get('/order',authCtrl.isLogedout, adminCtrl.loadOrder)
adminRoute.get('/orderList',authCtrl.isLogedout, adminCtrl.loadOrderList)
adminRoute.post('/userlist/updateStatus/:userId',authCtrl.isLogedout, adminCtrl.changeDeliveryStatus);

module.exports = adminRoute;