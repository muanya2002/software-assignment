import express from 'express';
import * as searchController from '../controllers/search-controller.js';
import optionalAuth from '../middleware/auth-middleware.js';


const router = express.Router();

// Search cars (optional auth to mark favorites)
router.get('/', optionalAuth, searchController.searchCars);

// Get car details (optional auth to check if favorited)
router.get('/car/:id', optionalAuth, searchController.getCarDetails);

// Get car makes for autocomplete
router.get('/makes', searchController.searchCarMakes);

// Get car categories
router.get('/categories', searchController.getCarCategories);

export default router;