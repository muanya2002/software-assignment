import { Router } from 'express';
import { create, post } from 'axios';
import { verifyToken } from '../controllers/auth-controller';
import { Car } from '../models/car-model';
const router = Router();

import { JWT_SECRET, OPENVERSE_API_URL } from '../configuration/config';
console.log(JWT_SECRET, OPENVERSE_API_URL);

// Search for car images using OpenVerse

class OpenVerseService {
    constructor() {
        this.api = create({
            baseURL: OPENVERSE_API_URL,
            headers: { 'Accept': 'application/json' }
        });
        this.accessToken = '';
    }

    async getAccessToken() {
        try {
            const response = await post(`${OPENVERSE_API_URL}/auth_tokens/token/`, {
                client_id: 'YOUR_CLIENT_ID',
                client_secret: 'YOUR_CLIENT_SECRET',
                grant_type: 'client_credentials'
            });
            this.accessToken = response.data.access_token;
            return this.accessToken;
        } catch (error) {
            console.error('Error getting access token:', error);
            return null;
        }
    }

    async searchCars(query, filters = {}) {
        try {
            if (!this.accessToken) await this.getAccessToken();
            const params = { q: query, page_size: 20, license_type: 'commercial' };
            const response = await this.api.get('/images/', { params, headers: { Authorization: `Bearer ${this.accessToken}` } });
            return response.data.results;
        } catch (error) {
            console.error('OpenVerse API search error:', error);
            throw error;
        }
    }

    async getCarDetails(id) {
        try {
            if (!this.accessToken) await this.getAccessToken();
            const response = await this.api.get(`/images/${id}/`, { headers: { Authorization: `Bearer ${this.accessToken}` } });
            return response.data;
        } catch (error) {
            console.error('Get car details error:', error);
            throw error;
        }
    }
}

const openVerseService = new OpenVerseService();

router.get('/search', verifyToken, async (req, res) => {
    try {
        const { query } = req.query;
        if (!query) return res.status(400).json({ error: 'Query parameter is required' });
        const results = await openVerseService.searchCars(query);
        res.json(results);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch from OpenVerse' });
    }
});

router.get('/cars/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const car = await openVerseService.getCarDetails(id);
        res.json(car);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch car details' });
    }
});

export default router;
