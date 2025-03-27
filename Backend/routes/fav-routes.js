const express = require('express');
const router = express.Router();
const favouriteController = require('../controllers/favorite-controller');
const { verifyToken } = require('../controllers/auth-controller');


// All favorites routes require authentication
router.use(verifyToken);

//to get favourites
router.get('/favorites', verifyToken, favouriteController.getFavorites);

//to add to favourites
router.post('/favorites', verifyToken, favouriteController.addFavorite);

//to delete from
router.delete('/favorites/:carId', verifyToken, favouriteController.removeFavorite);

module.exports = router;