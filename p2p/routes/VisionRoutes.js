import { Router } from 'express';
const router = Router();
import { findFace } from '../controllers/VisionController.js';
import authenticateToken from '../middleware/authMiddleware.js';
import multer from  'multer';

const upload = multer({ dest: 'checkinout_images/' });

router.post('/findFace', authenticateToken, upload.single('image'), findFace);

export default router;