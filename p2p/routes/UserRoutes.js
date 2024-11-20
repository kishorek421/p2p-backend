const express = require('express');
const router = express.Router();
const userController = require('../controllers/UserController');
// const authenticateToken = require('../middleware/authMiddleware');
// const authorize = require('../middleware/permissionMiddleware');

// router.get('/getUserDetails', authenticateToken, authorize('USERS', 'VIEW_USER_DETAILS'), userController.getUserDetails);

router.get('/getUserDetails', userController.getUserDetails);
router.put('/updateUserDetails', userController.updateUserDetails);
router.get('/searchUsers', userController.searchUsers);
router.post('/requestUser', userController.requestUser);
router.put('/changeUserRequestStatus', userController.changeUserRequestStatus);

module.exports = router;