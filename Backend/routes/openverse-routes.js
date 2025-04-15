import { Router } from 'express';
import axios from 'axios';
import { JWT_SECRET, OPENVERSE_API_URL } from '../configuration/config.js';

const router = Router();

class OpenVerseService {
    constructor() {
        this.api = axios.create({
            baseURL: OPENVERSE_API_URL || 'https://api.openverse.org',
            headers: { 'Accept': 'application/json' }
        });
        this.accessToken = '';
    }

    async getAccessToken() {
        const now = Date.now();
        if (this.accessToken && this.tokenExpiry && now < this.tokenExpiry) {
            return this.accessToken; // Return existing token if not expired
        }
        try {
            // Replace with your actual credentials from OpenVerse
            const response = await axios.post(
                `${OPENVERSE_API_URL}/v1/auth_tokens/token/`,
            {
                client_id: process.env.OPENVERSE_CLIENT_ID,
                client_secret: process.env.OPENVERSE_CLIENT_SECRET,
                grant_type: 'client_credentials'
            },
            {
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            });
            this.accessToken = response.data.access_token;

            const expiresIn = response.data.expires_in || 3600;
            this.tokenExpiry = Date.now() + expiresIn * 1000; // Set token expiry time

            return this.accessToken;
        } catch (error) {
            console.error('Error getting access token:', error.message);
            // Continue without token for public endpoints
            throw new Error('Failed to get access token');
        }
    }

    async searchCars(query, filters = {}) {
        try {
            // Try to get token but proceed without it for public endpoints
            await this.getAccessToken();

            console.log('Openverse API search query:', query);
              const params = { 
                    q: query, 
                    license_type: 'all',
                    categories: 'photography',
                    page_size: 20 
                };
            const response = await axios.get(`${OPENVERSE_API_URL || 'https://api.openverse.org'}/v1/images/`, {
                params,
                headers: {
                    Authorization: `Bearer ${this.accessToken}`,
                }
            });
            console.log(`Found ${response.data.results.length} results from OpenVerse API`);

            console.log('OpenVerse API raw results:', response.data.results);

            return {
                success: true,
                cars: response.data.results.map(item => ({
                    id: item.id,
                    openVerseId: item.id,
                    make: filters.make || '',
                    imageUrl: item.thumbnail || item.url,
                    isFavorite: false
                }))
            };
            
        } catch (error) {
            console.error('OpenVerse API search error:', error.message);
            return { success: false, cars: [] }; // Return empty results rather than throwing
            // Return empty results rather than throwing
        }
    }

    async getCarDetails(id) {
        try {
            await this.getAccessToken();
        
                
            const response = await axios.get(`${OPENVERSE_API_URL || 'https://api.openverse.org'}/v1/images/${id}/`, {
                headers: {
                    Authorization: `Bearer ${this.accessToken}`
                }
            });
            
            // Transform the response to match your application's expected format
            return {
                    id: item.id,
                    openVerseId: item.id,
                    make: filters.make || '',
                    imageUrl: item.thumbnail || item.url,
                    isFavorite: false
            };
        } catch (error) {
            console.error('Get car details error:', error.message);
            throw new Error('Failed to fetch car details from OpenVerse');
        }
    }
}

// Create and export a single instance of the service
const openVerseService = new OpenVerseService();

// Add routes to use the OpenVerseService
router.get('/search', async (req, res) => {
    try {
console.log('OpenVerse search endpoint called with query params:', req.query);

        const { query } = req.query;

        if (!query) {
            return res.status(400).json({ 
                success: false, 
                message: 'Query parameter is required' 
            });
        }

        const results = await openVerseService.searchCars(query);
        res.json(results);
    } catch (error) {
        console.error('OpenVerse search error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error searching OpenVerse' 
        });
    }
});

router.get('/cars/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const car = await openVerseService.getCarDetails(id);
        res.json({
            success: true,
            car
        });
    } catch (error) {
        console.error('OpenVerse get car error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error getting car from OpenVerse' 
        });
    }
});

// Export both the router and the service
export { openVerseService };
export default router;