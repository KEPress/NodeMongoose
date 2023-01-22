const mongoose = require('mongoose'), Schema = mongoose.Schema

const orderSchema = new Schema({

    products: [{
        product: { type: Object, required: true },
        quantity: { type: Number, required: true }
    }],
    user: {
        username: { type: String, required: true },
        userID: { type: Schema.Types.ObjectId, ref: 'Users_Model', required: true },
    }
})

module.exports = mongoose.model('Orders_Model', orderSchema)