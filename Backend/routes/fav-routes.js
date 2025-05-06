import express from 'express';
import { verifyToken } from '../controllers/auth-controller.js';
import FavoriteController from '../controllers/favorite-controller.js';

const router = express.Router();
console.log(FavoriteController);

// All favorites routes require authentication
router.use(verifyToken);

//to get favourites
import Favorite from '../models/favorite-model.js'; // Add this line

router.post('/favorite', async (req, res) => {
    try {
        const { userId, carId, imageUrl, description } = req.body;

        const existing = await Favorite.findOne({ userId, carId });
        if (existing) {
            return res.status(400).json({ 
                success: false, 
                message: 'Car already in favorites' 
            });
        }

        const favorite = new Favorite({
            userId,
            carId,
            imageUrl,
            description
        });

        await favorite.save();

        res.json({
            success: true,
            message: 'Car added to favorites',
            data: favorite
        });
    } catch (error) {
        console.error('Error saving favorite:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error saving favorite' 
        });
    }
});
router.get('/favorites', async (req, res) => {
    try {
        const { userId } = req.query;
        const favorites = await Favorite.find({ userId });
        res.json({ success: true, data: favorites });
    } catch (error) {
        console.error('Error fetching favorites:', error);
        res.status(500).json({ success: false, message: 'Error fetching favorites' });
    }
});

router.delete('/favorite/:id', async (req, res) => {
    try {
        const favorite = await Favorite.findByIdAndDelete(req.params.id);
        if (!favorite) {
            return res.status(404).json({ success: false, message: 'Favorite not found' });
        }

        res.json({ success: true, message: 'Favorite removed' });
    } catch (error) {
        console.error('Error removing favorite:', error);
        res.status(500).json({ success: false, message: 'Error removing favorite' });
    }
});


export default router;