const express = require('express');
const adminRoute = express.Router()
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const {imageCrop ,multiCrop } = require('../middleware/crop')

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
adminRoute.get('/addProduct', loadAddProduct)
adminRoute.post('/addProduct', upload.array('image', 3), addProduct)

adminRoute.get('/products', productControl.loadProductList)
adminRoute.get('/products/:id/edit', productControl.loadedit)
adminRoute.post("/products/edit/:id",upload.array('image'),productControl.editproduct)
adminRoute.get("/products/:imageId/:id/deleteImg", productControl.deleteImgDelete) 


adminRoute.get('/products/activate/:id', productControl.productActivate )
adminRoute.get('/products/deactive/:id', productControl.productDesable )

//Category

adminRoute.get('/category', categoryCtrl.category )
adminRoute.get('/addCategory', categoryCtrl.loadAddCategory)
adminRoute.post('/addCategory', upload.single('image'), categoryCtrl.addProductCategory);
adminRoute.get('/category/activate/:id',  )
adminRoute.get('/category/deactivate/:id', )



module.exports = adminRoute;