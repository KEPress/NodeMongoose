const mongoose = require('mongoose'), Schema = mongoose.Schema

const userSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true
    },
    surname: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    passcode: {
        type: String,
        required: true
    },
    resetToken: String,
    resetTokenExpiration: Date,
    cart : {
        items:[{ 
                productID: { type: Schema.Types.ObjectId, ref: 'Products_Model', required: true }, 
                quantity: { type: Number, required: true }
            }]
        }
})

userSchema.methods.addToCart = function (product) {
       let newQuantity = 1
       const cartItems = [...this.cart.items]
      
       const productIndex = this.cart.items.findIndex((cartProduct) => {
           return cartProduct.productID.toString() === product._id.toString()
       })
       
       if (productIndex >= 0) {
            newQuantity = this.cart.items[productIndex].quantity + 1
            cartItems[productIndex].quantity = newQuantity
       } else {
            cartItems.push({ productID: product._id,  quantity: newQuantity})
       }

       const updateCart = { items: cartItems }
       this.cart = updateCart
       return this.save()
        
}

userSchema.methods.removeCartItems = function (productID) {
    const cartItems =   this.cart.items.filter((item) => {
        return item.productID.toString() !== productID.toString()
    })
    this.cart.items = cartItems
    return this.save()
} 

userSchema.methods.clearCart = function () {
    this.cart = { items: [] }
    return this.save()
}


module.exports = mongoose.model('Users_Model', userSchema)
