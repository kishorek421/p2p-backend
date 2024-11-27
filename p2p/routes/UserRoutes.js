const express = require('express');
const router = express.Router();
const userController = require('../controllers/UserController');
const authenticateToken = require('../middleware/authMiddleware');
// const authorize = require('../middleware/permissionMiddleware');

// router.get('/getUserDetails', authenticateToken, authorize('USERS', 'VIEW_USER_DETAILS'), userController.getUserDetails);

router.get('/getUserDetails', authenticateToken, userController.getUserDetails);
router.put('/updateUserDetails', authenticateToken, userController.updateUserDetails);
router.get('/searchUsers', authenticateToken, userController.searchUsers);
router.post('/requestUser', authenticateToken, userController.requestUser);
router.put('/changeUserRequestStatus', authenticateToken, userController.changeUserRequestStatus);

module.exports = router;