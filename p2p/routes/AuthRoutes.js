import { Router } from 'express';
const router = Router();
import { refreshToken } from '../controllers/authController.js';

router.post('/refreshToken', refreshToken);

export default router;