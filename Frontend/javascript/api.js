/**
 * API service for handling all backend communication
 */
const api = {
    baseUrl: 'http://localhost:3000',

    
    // Authentication methods
    async registerUser(fullName, email, password) {
        try {
            const response = await fetch(`${this.baseUrl}/api/auth/register`, {

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
            const response = await fetch(`${this.baseUrl}/api/auth/login`, {
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
        window.location.href = `${this.baseUrl}/auth/google`;
    },
    
    isLoggedIn() {
        return !!localStorage.getItem('token');
    },
    
    getUser() {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    },
    
    logout() {
        // First, call the server logout endpoint
        fetch(`${this.baseUrl}/api/auth/logout`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.getToken()}`
            }
        }).finally(() => {

        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = "../pages/index.html";
        });

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

const response = await fetch(`${this.baseUrl}/api/search?${queryParams}`, {
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
        const response = await fetch(`${this.baseUrl}/api/openverse/search?query=${encodedQuery}`);
        
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
        const response = await fetch(`${this.baseUrl}/api/openverse/cars/${id}`, { headers });
        
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
getUserId() {
    const user = JSON.parse(localStorage.getItem('user'));
    return user.id; // or `user.id` depending on your auth payload
  },
  

  // Favorites methods
  async saveFavorite(car) {
      if (!this.isLoggedIn()) {
          throw new Error('You must be logged in to save favorites');
      }
      try {
        const response = await fetch(`${this.baseUrl}/api/cars/favorites`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.getToken()}`
            },
            body: JSON.stringify({ userId: this.getUserId(),   // Make sure this returns the current user's ID
                carId: car.carId,
                imageUrl: car.imageUrl,
                description: car.description
              })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to save favorite');
        }

        return await response.json();
    } catch (error) {
        console.error('Save favorite error:', error);
        throw error;
    }
},
      
  
async getFavorites() {
        if (!this.isLoggedIn()) 
            throw new Error('You must be logged in to view favorites');
      
        const response = await fetch(`${this.baseUrl}/api/cars/favorites?userId=${this.getUserId()}`, {
          headers: {
            'Authorization': `Bearer ${this.getToken()}`
          }
        });
      
        if (!response.ok) throw new Error('Failed to fetch favorites');
        const result = await response.json();
        return result.data;
      },
      
      async removeFavorite(favoriteId) {
        if (!this.isLoggedIn()) throw new Error('You must be logged in to remove favorites');
      
        const response = await fetch(`${this.baseUrl}/api/cars/favorite/${favoriteId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${this.getToken()}`
          }
        });
      
        if (!response.ok) throw new Error('Failed to remove favorite');
      return await response.json();
      },
      
    
      // Car details
      async getCarDetails(carId) {
        try {
            const headers = {};
            if (this.isLoggedIn()) {
                headers['Authorization'] = `Bearer ${this.getToken()}`;
            }
            
            const response = await fetch(`${this.baseUrl}/api/search/cars/${carId}`, { headers });
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
    },
     // Check authentication status from server
     async checkAuthStatus() {
        try {
            const response = await fetch(`${this.baseUrl}/api/auth/status`, {
                headers: {
                    'Authorization': `Bearer ${this.getToken()}`
                }
            });
            
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Auth status check error:', error);
            return { success: false, isLoggedIn: false };
        }
    }
};

// Export for use in other scripts
window.api = api;