const bcrypt = require('bcrypt');
const User = require('../models/User');
const Product = require('../models/product');

const renderLogin = (req, res) => {
  if (req.session.user) {
    return res.redirect(req.session.user.role === 'farmer' ? '/farmer/dashboard' : '/buyer/marketplace');
  }
  res.render('login');
};

const renderSignup = (req, res) => {
  res.render('signup');
};

const signup = async (req, res, next) => {
  try {
    const { name, email, password, role, location } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).send('User already exists');
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, passwordHash, role, location });
    req.session.user = { _id: user._id, name: user.name, role: user.role };
    return res.redirect(user.role === 'farmer' ? '/farmer/dashboard' : '/buyer/marketplace');
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password, role } = req.body;
    const user = await User.findOne({ email, role });
    if (!user) return res.status(400).send('Invalid credentials');
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(400).send('Invalid credentials');
    req.session.user = { _id: user._id, name: user.name, role: user.role };
    return res.redirect(user.role === 'farmer' ? '/farmer/dashboard' : '/buyer/marketplace');
  } catch (err) {
    next(err);
  }
};

const logout = (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
};

module.exports = { renderLogin, renderSignup, signup, login, logout };
 
// Demo seed
const seedDemo = async (req, res, next) => {
  try {
    const farmerEmail = 'farmer@gmail.com';
    const buyerEmail = 'buyer@gmail.com';
    const existingFarmer = await User.findOne({ email: farmerEmail });
    const existingBuyer = await User.findOne({ email: buyerEmail });
    let farmer = existingFarmer;
    let buyer = existingBuyer;
    if (!farmer) {
      farmer = await User.create({ name: 'Demo Farmer', email: farmerEmail, passwordHash: await bcrypt.hash('123456', 10), role: 'farmer', location: 'Nashik' });
    }
    if (!buyer) {
      buyer = await User.create({ name: 'Demo Buyer', email: buyerEmail, passwordHash: await bcrypt.hash('123456', 10), role: 'buyer', location: 'Mumbai' });
    }
    const existingProducts = await Product.countDocuments({});
    if (existingProducts === 0) {
      const demo = [
        { name: 'Mango', category: 'fruits', price: 120, quantity: '1 kg', description: 'Sweet and juicy', farmerId: farmer._id },
        { name: 'Onion', category: 'vegetables', price: 35, quantity: '1 kg', description: 'Fresh onions', farmerId: farmer._id },
        { name: 'Rice', category: 'grains', price: 90, quantity: '1 kg', description: 'Premium basmati', farmerId: farmer._id },
        { name: 'Milk', category: 'dairy', price: 70, quantity: '1 litre', description: 'Organic cow milk', farmerId: farmer._id },
        { name: 'Ghee', category: 'dairy', price: 600, quantity: '1 kg', description: 'Pure desi ghee', farmerId: farmer._id },
        { name: 'Wheat', category: 'grains', price: 45, quantity: '1 kg', description: 'Stone-ground flour', farmerId: farmer._id },
        { name: 'Tomato', category: 'vegetables', price: 40, quantity: '1 kg', description: 'Red and fresh', farmerId: farmer._id }
      ];
      await Product.insertMany(demo);
    }
    res.send('Seeded demo users and products. Farmer: farmer@gmail.com/123456, Buyer: buyer@gmail.com/123456');
  } catch (err) { next(err); }
};

module.exports.seedDemo = seedDemo;


