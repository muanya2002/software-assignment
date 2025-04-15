import openVerseService from '../routes/openverse-routes.js';
import  Car  from '../models/car-model.js';
import  User  from '../models/user-model.js';


    // Search cars using OpenVerse
export async function searchCars(req, res) {
    try {
        const { q, category, year, make, model } = req.query;
        
        // Create filters object
        const filters = {};
        if (category) filters.category = category;
        if (model) filters.model = model;
        
        // Get cars from OpenVerse API
        const results = await openVerseService.searchCars(q, filters);
        const cars = results.cars || [];
        
        // If user is logged in, mark favorites
        if (req.user) {
            const user = await User.findById(req.user._id).populate('favorites');
            const favoriteIds = user.favorites.map(fav => fav.openVerseId);
            
            cars.forEach(car => {
                car.isFavorite = favoriteIds.includes(car.openVerseId);
            });
            }
            
            res.status(200).json({
                success: true,
                cars: cars
            });
        } 
        // Catch block for error handling
        catch (error) {
            console.error('Search cars error:', error);
            res.status(500).json({
                success: false,
                message: 'Error searching for cars'
            });
        }
    }

// Get car details
 export async function getCarDetails(req, res) {
    try {
        const { id } = req.params;
        
        // Get car details from service
        const car = await openVerseService.getCarDetails(id);
        
        // If user is logged in, check if car is favorited
        if (req.user) {
            const user = await User.findById(req.user._id).populate('favorites');
            car.isFavorite = user.favorites.some(fav => 
                fav.openVerseId === car.openVerseId || fav._id.equals(car._id)
            );
        }
        
        res.status(200).json({
            success: true,
            car: car
        });
    } catch (error) {
        console.error('Get car details error:', error);
        res.status(404).json({
            success: false,
            message: 'Car not found'
        });
    }
}


// Search car makes and models for autocomplete
 export async function searchCarMakes(req, res) {
    try {
        const { q } = req.query;
        
        // Define popular car makes for autocomplete
        const popularMakes = [
            'Toyota', 'Honda', 'Ford', 'Chevrolet', 'Nissan', 
            'BMW', 'Mercedes-Benz', 'Audi', 'Hyundai', 'Kia',
            'Subaru', 'Volkswagen', 'Tesla', 'Lexus', 'Mazda'
        ];
        
        // Filter makes based on query
        let makes = popularMakes;
        if (q) {
            makes = popularMakes.filter(make => 
                make.toLowerCase().includes(q.toLowerCase())
            );
        }
        
        res.status(200).json({
            success: true,
            makes: makes
        });
    } catch (error) {
        console.error('Search car makes error:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving car makes'
        });
    }
}

// Get car categories
 export async function getCarCategories(req, res) {
    try {
        // Define car categories
        const categories = [
            'All Cars', 'Sedan', 'SUV', 'Truck', 'Hatchback',
            'Coupe', 'Convertible', 'Van', 'Electric'
        ];
        
        res.status(200).json({
            success: true,
            categories: categories
        });
    } catch (error) {
        console.error('Get car categories error:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving car categories'
        });
    }
}

