//NOTE: Can add as many methods in the get, post, put routes and these are parsed from LEFT to RIGHT
//Be mindful of where these methods are positioned

const  express = require('express'), router = express.Router()

const adminController = require('../controllers/admin')

//Check User Online Status from util folder
const isAuth = require('../util/is-auth')


// admin/add-product => GET Requests
router.get('/add-product', isAuth, adminController.addProductPage)

.get('/products', isAuth, adminController.getProductsPage)

.get('/edit-product/:productID', isAuth, adminController.editProductPage)

// admin/add-product => POST Requests
router.post('/add-product', isAuth, adminController.postAddProduct)

.post('/edit-product', isAuth, adminController.postEditProduct)

.post('/delete-product', isAuth, adminController.postDeleteProduct)

module.exports = router