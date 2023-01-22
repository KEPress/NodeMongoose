const express = require('express'), router = express.Router()

const shopController = require('../controllers/shop')

const isAuth = require('../util/is-auth')


// GET => Requests
router.get('/', shopController.getHomePage)

.get('/products', shopController.getProductsPage)

.get('/products/:productID', shopController.getProductPage)

.get('/cart', isAuth, shopController.getCartPage)

.get('/orders', isAuth, shopController.getOrdersPage)

//.get('/checkout', shopController.getCheckoutPage)


//POST => Requests
router.post('/cart', isAuth, shopController.postCartInfo)

.post('/cart-delete-item', isAuth, shopController.postDeleteCartInfo)

.post('/place-order', isAuth, shopController.postPlaceOrderPage)

module.exports = router