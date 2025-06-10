import { Router } from 'express';
const router = Router();
import { getUserDetails, updateUserDetails, searchUsers, requestUser, changeUserRequestStatus, getUserRequests, getUserFriends } from '../controllers/UserController.js';
import authenticateToken from '../middleware/authMiddleware.js';
// const authorize = require('../middleware/permissionMiddleware');

// router.get('/getUserDetails', authenticateToken, authorize('USERS', 'VIEW_USER_DETAILS'), userController.getUserDetails);

router.get('/getUserDetails', authenticateToken, getUserDetails);
router.put('/updateUserDetails', authenticateToken, updateUserDetails);
router.get('/searchUsers', authenticateToken, searchUsers);
router.post('/requestUser', authenticateToken, requestUser);
router.put('/changeUserRequestStatus', authenticateToken, changeUserRequestStatus);
router.get('/getUserRequests', authenticateToken, getUserRequests);
router.get('/getUserFriends', authenticateToken, getUserFriends);

export default router;