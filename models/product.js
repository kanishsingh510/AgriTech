const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name:{
        type : String,
        required: true
    },
    price : {
        type : Number,
        required: true,
        min: 0,
        set: function(value) {
            return parseFloat(value).toFixed(2);
        }
    },
    category: {
        type : String,
        lowercase: true,
        enum: ["fruit","vegetable","dairy"]
    },
    image: {
        type: String,
        default: null
    }
})

const Product = mongoose.model('Product',productSchema);
module.exports=Product;
