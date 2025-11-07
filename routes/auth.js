const express = require('express');
const router = express.Router();
const { renderLogin, renderSignup, signup, login, logout, seedDemo } = require('../controllers/authController');

router.get('/login', renderLogin);
router.post('/login', login);
router.get('/signup', renderSignup);
router.post('/signup', signup);
router.post('/logout', logout);
router.get('/seed', seedDemo);

module.exports = router;


