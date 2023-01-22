const mongoose = require('mongoose'), Schema = mongoose.Schema

const productSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    details: {
        type: String,
        required: true
    },
    imageURL: {
        type: String,
        required: true
    },
    userID: {
        type: Schema.Types.ObjectId,
        ref: 'Users_Model',
        required: true
    }

})

module.exports = mongoose.model('Products_Model', productSchema)


