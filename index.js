const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override')

const Product = require('./models/product.js');

/*mongoose.connect('mongodb://localhost:27017/farmStand',{useNewUrlParser: true,useUnifiedTopology: true})
    .then(()=>{
        console.log('CONNECTION OPEN!!!');
    })
    .catch((err)=>{
        console.log('OH NODATA, ERROR');
        console.log(err);
    })
*/
mongoose.connect("mongodb+srv://jahanvi:agritech2025@cluster0.ersuawn.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0", {
    useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("✅ Connected to MongoDB Atlas"))
.catch(err => console.error("❌ MongoDB connection error:", err));


app.set('views',path.join(__dirname,'views'));
app.set('view engine','ejs');

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'))


const categories = ['fruit','vagetable','dairy'];

app.get('/products',async (req,res)=>{
    const {category} = req.query;
    if(category){
        const products = await Product.find({category});
        res.render('products/index.ejs',{products,category});
    }else{
        const products = await Product.find({});
        res.render('products/index.ejs',{products,category: "All"});
    }
})

app.get('/products/new',(req,res)=>{
    res.render('products/new.ejs',{categories});
})

app.post('/products',async (req,res)=>{
    const newProduct = new Product(req.body);
    await newProduct.save();
   res.redirect(`/products/${newProduct._id}`);
})

app.get('/products/:id',async (req,res)=>{
    const {id} = req.params;
    const product = await Product.findById(id);
    res.render('products/show.ejs',{product})
})

app.get('/products/:id/edit',async (req,res)=>{
    const {id} = req.params;
    const product = await Product.findById(id);
    res.render('products/edit.ejs',{product,categories});
})

app.put('/products/:id',async(req,res)=>{
    const {id} = req.params;
    const product = await Product.findByIdAndUpdate(id,req.body,{runValidators: true, new: true});
    res.redirect(`/products/${product._id}`);
})

app.delete('/products/:id',async(req,res)=>{
    const {id} = req.params;
    const deleteProduct = await Product.findByIdAndDelete(id);
    res.redirect(`/products`);
})


app.listen(4000,()=>{
    console.log("Yeah port is listening")
    console.log("http://localhost:4000/products")
})
