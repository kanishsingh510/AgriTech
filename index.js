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


const categories = ['fruits','vegetables','dairy','grains','spices','organic'];

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


// Seed sample products
app.get('/seed', async (req, res) => {
    try {
        // Clear existing products
        await Product.deleteMany({});
        
        const sampleProducts = [
            {
                name: "Fresh Alphonso Mangoes",
                price: 120.00,
                category: "fruits",
                quantity: "1 kg",
                description: "Premium Alphonso mangoes, sweet and juicy, perfect for summer",
                isOrganic: false,
                
            },
            {
                name: "Organic Cow Milk",
                price: 70.00,
                category: "dairy",
                quantity: "1 litre",
                description: "Fresh organic cow milk, pure and nutritious",
                isOrganic: true,
               
            },
            {
                name: "Desi Ghee (Pure)",
                price: 600.00,
                category: "dairy",
                quantity: "1 kg",
                description: "Traditional homemade desi ghee, rich in taste and aroma",
                isOrganic: true,
                
            },
            {
                name: "Fresh Tomatoes",
                price: 40.00,
                category: "vegetables",
                quantity: "1 kg",
                description: "Fresh red tomatoes, perfect for cooking and salads",
                isOrganic: false,
                
            },
            {
                name: "Basmati Rice (Premium)",
                price: 90.00,
                category: "grains",
                quantity: "1 kg",
                description: "Premium quality basmati rice, long grain and aromatic",
                isOrganic: false,
              
            },
            {
                name: "Turmeric Powder (Haldi)",
                price: 220.00,
                category: "spices",
                quantity: "1 kg",
                description: "Pure turmeric powder, bright yellow and aromatic",
                isOrganic: true,
                
            },
            {
                name: "Organic Bananas",
                price: 60.00,
                category: "fruits",
                quantity: "1 dozen",
                description: "Fresh organic bananas, naturally ripened",
                isOrganic: true,
               
            },
            {
                name: "Fresh Onions",
                price: 35.00,
                category: "vegetables",
                quantity: "1 kg",
                description: "Fresh red onions, perfect for daily cooking",
                isOrganic: false,
                
            },
            {
                name: "Organic Wheat Flour",
                price: 45.00,
                category: "grains",
                quantity: "1 kg",
                description: "Stone-ground organic wheat flour, perfect for rotis",
                isOrganic: true,
                
            },
            {
                name: "Red Chili Powder",
                price: 180.00,
                category: "spices",
                quantity: "1 kg",
                description: "Pure red chili powder, medium spicy and aromatic",
                isOrganic: false,
                
            }
        ];
        
        await Product.insertMany(sampleProducts);
        res.send('Sample products added successfully!');
    } catch (error) {
        console.error('Error seeding products:', error);
        res.status(500).send('Error seeding products');
    }
});

app.listen(4000,()=>{
    console.log("Yeah port is listening")
    console.log("http://localhost:4000/products")
    console.log("Seed products: http://localhost:4000/seed")
})
s