const express = require('express');
const router = express.Router();
const visionController = require('../controllers/VisionController');
const authenticateToken = require('../middleware/authMiddleware');
const multer = require('multer');

const upload = multer({ dest: 'checkinout_images/' });

router.post('/findFace', authenticateToken, upload.single('image'), visionController.findFace);

module.exports = router;