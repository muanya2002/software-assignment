/**
 * API service for handling all backend communication
 */
const api = {
    baseUrl: 'http://localhost:3000/api',

    
    // Authentication methods
    async registerUser(fullName, email, password) {
        try {
            const response = await fetch(`${this.baseUrl}/auth/register`, {

                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ fullName, email, password })
            });
            
            const data = await response.json();
            if (data.success && data.token) {
                localStorage.setItem('registeredEmail', email);
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                window.location.href = "../pages/index.html";
            }
            return data;
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    },
    
    async loginUser(email, password) {
        try {
            const response = await fetch(`${this.baseUrl}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });
            
            const data = await response.json();
            if (data.token && data.success) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                window.location.href = "../pages/index.html";
            }
            return data;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    },
    
    initiateOAuthLogin() {
        window.location.href = `http://localhost:3000/auth/google`;
    },
    
    isLoggedIn() {
        return !!localStorage.getItem('token');
    },
    
    getUser() {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    },
    
    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = "../pages/index.html";
    

    },
    
    // Search methods
    async searchCars(query = '', filters = {}) {
      try {
        // Build query string
        const queryParams = new URLSearchParams();
        if (query) queryParams.append('q', query);
        
        // Add filters to query params
        Object.entries(filters).forEach(([key, value]) => {
          if (value) queryParams.append(key, value);
        });

// Add auth token if logged in
const headers = {};
if (this.isLoggedIn()) {
    headers['Authorization'] = `Bearer ${this.getToken()}`;
}

const response = await fetch(`${this.baseUrl}/search?${queryParams}`, {
    headers
});

return await response.json();
} catch (error) {
console.error('Search error:', error);
throw error;
}
},
  
  // Openverse Car Image Search - CORRECTED
  async searchCarImages(query) {
    try {
        const encodedQuery = encodeURIComponent(query);
        console.log(`Searching for car images with query: ${encodedQuery}`);
        
        // Use the correct endpoint that matches your backend
        const response = await fetch(`${this.baseUrl}/openverse/search?query=${encodedQuery}`);
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API error (${response.status}): ${errorText}`);
        }
        
        const data = await response.json();
        console.log('Search results:', data);
        return data;
    } catch (error) {
        console.error('Image search error:', error);
        throw error;
    }
},
  
  // Get specific car image details
  async getCarImageDetails(id) {
      try {
        const headers = {};
        if (this.isLoggedIn()) {
            headers['Authorization'] = `Bearer ${this.getToken()}`;
        }
        
        // Use the correct endpoint
        const response = await fetch(`${this.baseUrl}/openverse/cars/${id}`, { headers });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || errorData.message || 'Failed to get car image details');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Get car image details error:', error);
        throw error;
    }
},

  // Favorites methods
  async saveFavorite(carId) {
      if (!this.isLoggedIn()) {
          throw new Error('You must be logged in to save favorites');
      }
      
      try {
          const response = await fetch('http://127.0.0.1:5500/Frontend/pages/favourite.html', {
              body: JSON.stringify({ carId })
          });
          
          return await response.json();
      } catch (error) {
          console.error('Save favorite error:', error);
          throw error;
      }
  },
  
  async getFavorites() {
      if (!this.isLoggedIn()) {
          return {success: true, favorites: [] };
      }
      
      try {
          const response = await fetch('http://127.0.0.1:5500/Frontend/pages/favourite.html', {
            body: JSON.stringify({ carId})
          });
          
          return await response.json();
      } catch (error) {
          console.error('Get favorites error:', error);
          throw error;
      }
  },
    
      
      async addFavorite(carId) {
        if (!this.isLoggedIn()) {
          throw new Error('User must be logged in to add favorites');
        }
        try {
            const response = await fetch('http://127.0.0.1:5500/Frontend/pages/favourite.html', {
                body: JSON.stringify({ carId })
            });
            
            return await response.json();
        } catch (error) {
            console.error('Add favorite error:', error);
            throw error;
        }
    },
    
      // Car details
      async getCarDetails(carId) {
        try {
            const headers = {};
            if (this.isLoggedIn()) {
                headers['Authorization'] = `Bearer ${this.getToken()}`;
            }
            
            const response = await fetch(`${this.baseUrl}/search/cars/${carId}`, { headers });
            return await response.json();
        } catch (error) {
            console.error('Get car details error:', error);
            throw error;
        }
    },


    // Token Management
    setToken(token) {
        localStorage.setItem('token', token);
    },

    getToken() {
        return localStorage.getItem('token');
    },

    clearToken() {
        localStorage.removeItem('token');
    }
};

// Export for use in other scripts
window.api = api;