import express from 'express';
import { verifyToken } from '../controllers/auth-controller.js';
import FavoriteController from '../controllers/favorite-controller.js';

const router = express.Router();
console.log(FavoriteController);

// All favorites routes require authentication
router.use(verifyToken);

//to get favourites
router.get('/favorites', verifyToken, FavoriteController.getFavorites);

//to add to favourites
router.post('/favorites', verifyToken, FavoriteController.addFavorite);

router.delete('/favorites/:carId', verifyToken, FavoriteController.removeFavorite);


export default router;