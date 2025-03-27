const { User } = require('../user-model');
const { Car } = require('../car-model');
const openVerseService = require('../api service/openverse-api');

// Get user favorites
exports.getFavorites = async (req, res) => {
    try {
        // Get user with populated favorites
        const user = await User.findById(req.user._id).populate('favorites');
        
        // Return favorites
        res.status(200).json({
            success: true,
            favorites: user.favorites
        });
    } catch (error) {
        console.error('Get favorites error:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving favorites'
        });
    }
};

// Add car to favorites
exports.addFavorite = async (req, res) => {
    try {
        const { carId } = req.body;
        
        // Get car details
        let car = await Car.findOne({ openVerseId: carId });
        
        // If car doesn't exist in our DB yet, fetch and create it
        if (!car) {
            const carDetails = await openVerseService.getCarDetails(carId);
            car = new Car(carDetails);
            await car.save();
        }
        
        // Add to user's favorites if not already there
        const user = await User.findById(req.user._id);
        
        if (!user.favorites.includes(car._id)) {
            user.favorites.push(car._id);
            await user.save();
        }
        
        res.status(200).json({
            success: true,
            message: 'Car added to favorites'
        });
    } catch (error) {
        console.error('Add favorite error:', error);
        res.status(500).json({
            success: false,
            message: 'Error adding car to favorites'
        });
    }
};