const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const multer = require('multer');
const fs = require('fs');

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
app.use(methodOverride('_method'));

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, 'public', 'imgs');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    fileFilter: function (req, file, cb) {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only image files (jpeg, jpg, png, gif, webp) are allowed!'));
        }
    },
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});


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

app.post('/products', upload.single('image'), async (req,res)=>{
    try {
        const productData = { ...req.body };
        
        // Add image path if file was uploaded
        if (req.file) {
            productData.image = `/imgs/${req.file.filename}`;
        }
        
        const newProduct = new Product(productData);
        await newProduct.save();
        res.redirect(`/products/${newProduct._id}`);
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).send('Error creating product');
    }
})

// kanish verma
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

app.put('/products/:id', upload.single('image'), async(req,res)=>{
    try {
        const {id} = req.params;
        const productData = { ...req.body };
        
        // Add image path if file was uploaded
        if (req.file) {
            productData.image = `/imgs/${req.file.filename}`;
        }
        
        const product = await Product.findByIdAndUpdate(id, productData, {runValidators: true, new: true});
        res.redirect(`/products/${product._id}`);
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).send('Error updating product');
    }
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
