const express = require('express');
const {
    getAvailableDashboards,
    getDashboardEmbed,
    addDashboard,
    getDashboards, // New function to get all dashboards
    deleteDashboard, // New function to delete a dashboard
    updateDashboardPermissions // New function to update permissions
} = require('../controllers/dashboardController');
const { protect, isAdmin } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/', protect, getAvailableDashboards);
router.get('/all', protect, isAdmin, getDashboards);
router.post('/', protect, isAdmin, addDashboard);
router.delete('/:id', protect, isAdmin, deleteDashboard);
router.put('/:id/permissions', protect, isAdmin, updateDashboardPermissions);
router.get('/embed/:slug', protect, getDashboardEmbed);

module.exports = router;