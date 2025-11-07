const path = require('path');
const fs = require('fs');
const multer = require('multer');
const Product = require('../models/product');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '..', 'public', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    cb(null, Date.now() + '-' + safeName);
  }
});

const upload = multer({ storage });

const ensureFarmer = (req, res, next) => {
  if (!req.session.user || req.session.user.role !== 'farmer') return res.redirect('/login');
  next();
};

const renderDashboard = async (req, res, next) => {
  try {
    const products = await Product.find({ farmerId: req.session.user._id }).sort({ createdAt: -1 });
    res.render('farmer/dashboard', { products, success: req.query.success === '1' });
  } catch (err) {
    next(err);
  }
};

const createProduct = async (req, res, next) => {
  try {
    const { name, category, price, quantity, unit, description, isOrganic } = req.body;
    const product = new Product({
      name,
      category,
      price: Number(price),
      quantity: Number(quantity),
      unit,
      description,
      isOrganic: Boolean(isOrganic),
      farmerId: req.session.user._id
    });
    if (req.file) {
      product.image = `/uploads/${req.file.filename}`;
      product.imagePath = product.image;
    }
    await product.save();
    res.redirect('/farmer/dashboard?success=1');
  } catch (err) {
    next(err);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };
    if (updates.price) updates.price = Number(updates.price);
    if (updates.quantity) updates.quantity = Number(updates.quantity);
    if (req.file) {
      // delete old image if exists
      const existing = await Product.findOne({ _id: id, farmerId: req.session.user._id });
      if (existing && existing.image) {
        const oldPath = path.join(__dirname, '..', 'public', existing.image.replace(/^\//, ''));
        fs.existsSync(oldPath) && fs.unlink(oldPath, () => {});
      }
      updates.image = `/uploads/${req.file.filename}`;
      updates.imagePath = updates.image;
    }
    await Product.findOneAndUpdate({ _id: id, farmerId: req.session.user._id }, updates, { new: true });
    res.redirect('/farmer/dashboard');
  } catch (err) {
    next(err);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await Product.findOneAndDelete({ _id: id, farmerId: req.session.user._id });
    if (existing && existing.image) {
      const filePath = path.join(__dirname, '..', 'public', existing.image.replace(/^\//, ''));
      fs.existsSync(filePath) && fs.unlink(filePath, () => {});
    }
    res.redirect('/farmer/dashboard');
  } catch (err) {
    next(err);
  }
};

module.exports = { upload, ensureFarmer, renderDashboard, createProduct, updateProduct, deleteProduct };







