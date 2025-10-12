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
        enum: ["fruits","vegetables","dairy","grains","spices","organic"]
    },
    quantity: {
        type: String,
        required: true,
        default: "1 kg"
    },
    description: {
        type: String,
        required: true,
        maxlength: 200
    },
    image: {
        type: String,
        default: null
    },
    isOrganic: {
        type: Boolean,
        default: false
    },
    farmerName: {
        type: String,
        default: "Local Farmer"
    },
    location: {
        type: String,
        default: "India"
    }
})

const Product = mongoose.model('Product',productSchema);
module.exports=Product;
