const express = require('express');
const router = express.Router();
const Product = require('../models/product');

router.get('/', async (req, res, next) => {
  try {
    const { category, q, sort } = req.query;
    const filter = {};
    if (category && category !== 'All') filter.category = category.toLowerCase();
    if (q) filter.name = { $regex: q, $options: 'i' };
    let sortBy = { createdAt: -1 };
    if (sort === 'price_asc') sortBy = { price: 1 };
    if (sort === 'price_desc') sortBy = { price: -1 };
    const products = await Product.find(filter).sort(sortBy).populate('farmerId', 'name location');
    res.json({ products });
  } catch (err) { next(err); }
});

module.exports = router;




