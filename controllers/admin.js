const ProductModel = require('../models/products_model')

//const ObjectID = mongoDB.ObjectId

exports.addProductPage = (request, response, next) => {
   //Check if User is Logged In to add product page
   if (!request.session.isOnline) return response.redirect('/login')
    response.render('admin/admin-products', { 
        pageTitle: 'Add Product', 
        path: '/admin/add-product',
        edit: false,
        
    })
 }

 exports.postAddProduct = (request, response, next) => {
    const title = request.body.title
    const price = request.body.price
    const details = request.body.details
    const imageURL = request.body.imageURL
    //Create New Product
    new ProductModel({
      title: title,
      price: price,
      details: details,
      imageURL: imageURL,
      userID: request.user
    }).save().then(function () {
         response.redirect('/admin/products')
    }).catch((error) => console.log(error))
 }    

 exports.getProductsPage = (request, response, next) => {
   ProductModel.find({ userID: request.user._id })
   //.select() //to select certain fields in table
   //.populate('userID', 'name') //include user object info
   .then((products) => {
      response.render('admin/products', {
         prods: products,
         pageTitle: 'Admin Products',
         path: '/admin/products',
        
      })
   }).catch((error) => console.log(error))
 }

 exports.editProductPage = (request, response, next) => {
      const editMode = request.query.edit
      if (!editMode) return response.redirect('/')
      const productID = request.params.productID
      ProductModel.findById(productID).then((product) => {
         if (!product) return response.redirect('/')
         response.render('admin/admin-products', {
            pageTitle: 'Edit Product', 
            path: '/admin/edit-product',
            edit: editMode,
            product: product,
           
         })
      }).catch((error) => console.log(error))
 }

 //Update #1
 /***
  * 
  exports.postEditProduct = (request, response, next) => {
   const productID = request.body.productID
   const updateTitle = request.body.title
   const updateImage = request.body.imageURL
   const updateDetails = request.body.details
   const updatePrice = request.body.price
   ProductModel.findByIdAndUpdate(productID, {
      title: updateTitle, 
      details: updateDetails, 
      price: updatePrice,
      imageURL: updateImage,
      userID: request.user
   }).then( function () {
      response.redirect('/admin/products')
   }).catch((error) => console.log(error))
}
  ***/



//Update #2 findById method - either way works

 exports.postEditProduct = (request, response, next) => {
   const productID = request.body.productID
   const updateTitle = request.body.title
   const updateImage = request.body.imageURL
   const updateDetails = request.body.details
   const updatePrice = request.body.price
   ProductModel.findById(productID).then((product) => {
      if(product.userID.toString() !== request.user._id.toString()) {
         return response.redirect('/')
      }
      product.title = updateTitle
      product.details = updateDetails
      product.price = updatePrice
      product.imageURL = updateImage
      return product.save().then(function (){
         response.redirect('/admin/products')
      })
   }).catch((error) => console.log(error))
}



exports.postDeleteProduct = (request, response, next) => {
   const productID = request.body.productID
   ProductModel.deleteOne({ _id: productID, userID: request.user._id}).then(function() {
      response.redirect('/admin/products')
   }).catch((error) => console.log(error))
}


    
    


