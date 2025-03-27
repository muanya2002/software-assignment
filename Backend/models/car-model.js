import { Schema, model as _model } from 'mongoose';

const CarSchema = new Schema({
    make: {
        type: String,
        required: true,
        trim: true
    },
    model: {
        type: String,
        required: true,
        trim: true
    },
    year: {
        type: Number,
        required: true
    },
    type: {
        type: String,
        enum: ['SUV', 'Sedan', 'Sports Car', 'Electric', 'Hybrid', 'Luxury'],
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    transmission: {
        type: String,
        enum: ['Automatic', 'Manual'],
        default: 'Automatic'
    },
    imageUrl: {
        type: String,
        default: '/api/placeholder/300/200'
    },
    details: {
        fuelType: String,
        engineSize: String,
        horsepower: Number
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Static method to search cars
CarSchema.statics.searchCars = async function(filters) {
    const query = {};

    if (filters.type) query.type = filters.type;
    if (filters.minPrice) query.price = { $gte: filters.minPrice };
    if (filters.maxPrice) query.price = { 
        ...query.price, 
        $lte: filters.maxPrice 
    };
    if (filters.make) query.make = new RegExp(filters.make, 'i');

    return await this.find(query);
};

const Car = _model('Car', CarSchema);

export default Car;