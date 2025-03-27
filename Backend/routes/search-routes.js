const express = require('express');
const router = express.Router();
const searchController = require('../controllers/search-controller');
const { verifyToken } = require('../controllers/auth-controller');
const optionalAuth = require('../middleware/auth-middleware');

// Search cars (optional auth to mark favorites)
router.get('/', optionalAuth, searchController.searchCars);

// Get car details (optional auth to check if favorited)
router.get('/car/:id', optionalAuth, searchController.getCarDetails);

// Get car makes for autocomplete
router.get('/makes', searchController.searchCarMakes);

// Get car categories
router.get('/categories', searchController.getCarCategories);

module.exports = router;