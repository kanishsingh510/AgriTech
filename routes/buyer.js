const express = require('express');
const router = express.Router();
const { ensureBuyer, renderMarketplace, renderDashboard } = require('../controllers/buyerController');

router.get('/marketplace', ensureBuyer, renderMarketplace);
router.get('/dashboard', ensureBuyer, renderDashboard);

module.exports = router;







