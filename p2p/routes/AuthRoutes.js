const express = require('express');
const router = express.Router();
const authController = require('../controllers/AuthController');


router.post('/refreshToken', authController.refreshToken);

module.exports = router;