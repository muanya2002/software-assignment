const express = require('express');
const Car = require('../models/car-model');
const router = express.Router();

// Get all cars
router.get('/', async (req, res) => {
    try {
        const { type, minPrice, maxPrice, make } = req.query;
        const filters = { type, minPrice, maxPrice, make };
        
        const cars = await Car.searchCars(filters);
        
        res.json({
            success: true,
            count: cars.length,
            data: cars
        });
    } catch (error) {
        console.error('Error fetching cars:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error fetching cars' 
        });
    }
});

// Get car by ID
router.get('/:id', async (req, res) => {
    try {
        const car = await Car.findById(req.params.id);
        
        if (!car) {
            return res.status(404).json({ 
                success: false, 
                message: 'Car not found' 
            });
        }
        
        res.json({
            success: true,
            data: car
        });
    } catch (error) {
        console.error('Error fetching car:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error fetching car' 
        });
    }
});

// Add favorite car
router.post('/favorite', async (req, res) => {
    try {
        const { userId, carId } = req.body;
        
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }
        
        // Check if car is already in favorites
        if (user.favorites.includes(carId)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Car already in favorites' 
            });
        }
        
        user.favorites.push(carId);
        await user.save();
        
        res.json({
            success: true,
            message: 'Car added to favorites',
            favorites: user.favorites
        });
    } catch (error) {
        console.error('Error adding favorite:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error adding favorite' 
        });
    }
});

module.exports = router;