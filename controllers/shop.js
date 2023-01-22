const ProductModel = require('../models/products_model')
const OrderModel = require('../models/orders_model')


exports.getHomePage = (request, response, next) => {
    ProductModel.find().then((products) => {
        response.render('shop/home', { 
            prods: products, 
            pageTitle:'Home Page', 
            path:'/',
            isAuthenticated: request.session.isOnline,
            csurfToken: request.csrfToken()
        })
    }).catch((error) => console.log(error))
}

exports.getProductsPage = (request, response, next) => { 
   ProductModel.find().then((products) => {
        response.render('shop/products', { 
            prods: products, 
            pageTitle:'All Products', 
            path:'/products',
         
        })
    }).catch((error) => console.log(error))
}


exports.getProductPage = (request, response, next) => {
    const productID = request.params.productID
    ProductModel.findById(productID).then((product) => {
        response.render('shop/details', { 
            product: product, 
            pageTitle: product.title,
            path: '/products',
        
        })
    }).catch((error) => console.log(error))
}

exports.getCartPage = (request, response, next) => {
    request.user.populate('cart.items.productID').then((user) => {   
            const products = user.cart.items    
            response.render('shop/cart', {
            products: products,
            pageTitle: 'Your Cart',
            path: '/cart',
          
        })
    }).catch((error) => console.log(error))
}
       

    
exports.postCartInfo = (request, response, next) => {
    const productID = request.body.productID
    ProductModel.findById(productID).then((product) => {
        return request.user.addToCart(product)
    }).then(function () {
        response.redirect('/cart')
    }).catch((error) => console.log(error))
}

exports.postDeleteCartInfo = (request, response, next) => {
    const productID = request.body.productID
    request.user.removeCartItems(productID).then( function () {
        response.redirect('/cart')
    }).catch((error) => console.log(error))
}


exports.postPlaceOrderPage = (request, response, next) => {
    request.user.populate('cart.items.productID').then((user) => {
        const products = user.cart.items.map((item) => {
            return { quantity: item.quantity, product: {...item.productID._doc} }
        })
        const orders = new OrderModel({
            user: { username: request.user.username, userID: request.user },
            products: products
        })
        return orders.save()
    }).then( function () {
        return request.user.clearCart()
    }).then( function () {
        response.redirect('/orders')
    }).catch((error) => console.log(error))
}

/***
 exports.getCheckoutPage = (request, response, next) => {
    response.render('shop/checkout', { 
        pageTitle:'Checkout', 
        path:'/checkout'
    })
}
*
*/

exports.getOrdersPage = (request, response, next) => {
    OrderModel.find({'user.userID': request.user._id}).then((orders) => {
        response.render('shop/orders', {
            orders: orders, 
            pageTitle:'Orders Placed', 
            path:'/orders',
        })
    }).catch((error) => console.log(error))
   
}

