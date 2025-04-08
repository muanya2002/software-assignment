import { Router } from 'express';
import axios from 'axios'; // Fixed import
import { verifyToken } from '../controllers/auth-controller.js'; // Add .js extension
import { JWT_SECRET, OPENVERSE_API_URL } from '../configuration/config.js';

const router = Router();

class OpenVerseService {
    constructor() {
        this.api = axios.create({  // Fixed from create to axios.create
            baseURL: OPENVERSE_API_URL || 'https://api.openverse.org/v1',
            headers: { 'Accept': 'application/json' }
        });
        this.accessToken = '';
    }

    async getAccessToken() {
        try {
            // For demo purposes, some Openverse endpoints work without authentication
            // In production, use proper credentials
            const response = await axios.post(`${OPENVERSE_API_URL || 'https://api.openverse.org/v1'}/auth_tokens/token/`, {
                client_id: process.env.OPENVERSE_CLIENT_ID || 'YOUR_CLIENT_ID',
                client_secret: process.env.OPENVERSE_CLIENT_SECRET || 'YOUR_CLIENT_SECRET',
                grant_type: 'client_credentials'
            });
            this.accessToken = response.data.access_token;
            return this.accessToken;
        } catch (error) {
            console.error('Error getting access token:', error.message);
            // For demo purposes, return a dummy token
            this.accessToken = 'dummy_token';
            return this.accessToken;
        }
    }

    async searchCars(query, filters = {}) {
        try {
            // For testing purposes, we'll use the public API without auth
            // In production, uncomment the authentication line
            // if (!this.accessToken) await this.getAccessToken();
            
            const params = { 
                q: `car ${query}`, // Add "car" to query to improve results
                page_size: 20 
            };
            
            // Use axios directly without authorization header for testing
            const response = await axios.get(`${OPENVERSE_API_URL || 'https://api.openverse.org/v1'}/images/`, { params });
            
            // Format the response to match what frontend expects
            return {
                success: true,
                cars: response.data.results.map(item => ({
                    id: item.id,
                    make: query,
                    model: 'Model',
                    year: 2023,
                    category: 'Car',
                    transmission: 'Automatic',
                    price: 25000,
                    imageUrl: item.thumbnail || item.url,
                    isFavorite: false
                }))
            };
        } catch (error) {
            console.error('OpenVerse API search error:', error.message);
            // Return empty results rather than throwing
            return { success: false, cars: [] };
        }
    }

    async getCarDetails(id) {
        try {
            // if (!this.accessToken) await this.getAccessToken();
            const response = await axios.get(`${OPENVERSE_API_URL || 'https://api.openverse.org/v1'}/images/${id}/`);
            return response.data;
        } catch (error) {
            console.error('Get car details error:', error.message);
            throw error;
        }
    }
}

const openVerseService = new OpenVerseService();

// Modify endpoint to match what frontend expects
router.get('/', async (req, res) => {
    try {
        const query = req.query.q || '';
        if (!query) return res.status(400).json({ success: false, message: 'Query parameter is required' });
        
        const results = await openVerseService.searchCars(query);
        res.json(results);
    } catch (error) {
        console.error('Search API error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch from OpenVerse' });
    }
});

router.get('/cars/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const car = await openVerseService.getCarDetails(id);
        res.json(car);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch car details' });
    }
});

export default router;