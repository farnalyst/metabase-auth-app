const express = require('express');
const { getUsers, createUser, updateUserStatus, updateUserRole } = require('../controllers/userController');
const { protect, isAdmin } = require('../middleware/authMiddleware');
const router = express.Router();

router.route('/').get(protect, isAdmin, getUsers).post(protect, isAdmin, createUser);
router.route('/:id/status').put(protect, isAdmin, updateUserStatus);
router.route('/:id/role').put(protect, isAdmin, updateUserRole);

module.exports = router;