/**
 * Handles all search-related functionality
 */
class SearchHandler {
  constructor() {
      this.searchInput = document.querySelector('.search-input');
      this.searchButton = document.querySelector('.search-button');
      this.filterChips = document.querySelectorAll('.filter-chip');
      this.resultsContainer = document.getElementById('carResults');
      
      this.activeFilters = {
          category: 'All Cars'
      };
      
      this.bindEvents();
  }
  
  bindEvents() {
      // Search button click
      if (this.searchButton) {
          this.searchButton.addEventListener('click', () => {
              const query = this.searchInput.value.trim();
              api.searchCarImages(query)
              .then(results => this.displayResults(results))
                  .catch(error => {
                    console.error('Search failed:', error);
                  });
          });
      }
      
      // Search input enter key
      if (this.searchInput) {
          this.searchInput.addEventListener('keypress', (e) => {
              if (e.key === 'Enter') {
                  this.performSearch();
              }
          });
      }
      
      // Filter chip selection
      if (this.filterChips) {
          this.filterChips.forEach(chip => {
              chip.addEventListener('click', () => {
                  // Toggle active state visually
                  this.filterChips.forEach(c => c.classList.remove('active'));
                  chip.classList.add('active');
                  
                  // Update active filter
                  this.activeFilters.category = chip.textContent;
                  
                  // Perform search with new filter
                  this.performSearch();
              });
          });
      }
  }
  
  async performSearch() {
      if (!this.searchInput || !this.resultsContainer) return;
      
      const query = this.searchInput.value.trim();
      
      // Don't search if query is empty
      if (!query) {
          this.resultsContainer.innerHTML = `
              <div class="no-results">
                  <i class="fas fa-search"></i>
                  <p>Enter a search term to find cars.</p>
              </div>
          `;
          return;
      }
      
      // Show loading state
      this.resultsContainer.innerHTML = '<div class="loading">Searching for cars...</div>';
      
      try {
          // Add error handling and timeout
          const results = await Promise.race([
              api.searchCarImages(query, this.activeFilters),
              new Promise((_, reject) => 
                  setTimeout(() => reject(new Error('Search timeout')), 15000)
              )
          ]);
          
          this.displayResults(results);
      } catch (error) {
          this.resultsContainer.innerHTML = `
              <div class="error-message">
                  <i class="fas fa-exclamation-circle"></i>
                  <p>Sorry, there was an error performing your search. Please try again.</p>
                  <small>${error.message || 'Connection error'}</small>
              </div>
          `;
          console.error('Search failed:', error);
      }
  }
  
  displayResults(results) {
      if (!this.resultsContainer) return;
      
      // Handle API error or no results
      if (!results || !results.success || !results.cars || results.cars.length === 0) {
          this.resultsContainer.innerHTML = `
              <div class="no-results">
                  <i class="fas fa-car-side"></i>
                  <p>No cars found matching your search. Try different keywords or filters.</p>
              </div>
          `;
          return;
      }
      
      this.resultsContainer.innerHTML = '';
      
      results.cars.forEach(car => {
          const carResults = document.createElement('div');
          carResults.className = 'section-title';
          document.getElementById('searchResults')?.scrollIntoView({ behavior: 'smooth' });

          
          const isFavorite = api.isLoggedIn() && car.isFavorite;
          const favoriteIcon = isFavorite ? 
              '<i class="fas fa-heart favorite-icon active"></i>' : 
              '<i class="far fa-heart favorite-icon"></i>';
          
          // Ensure there's a fallback image URL
          const imageUrl = car.imageUrl || car.thumbnail || '/images/car-placeholder.jpg';
          
          carResults.innerHTML = `
              <div class="car-image">
                  <img src="${imageUrl}" alt="${car.make} ${car.model}" onerror="this.src='/images/car-placeholder.jpg'">
                  ${favoriteIcon}
              </div>
              <div class="car-details">
                  <div class="car-title"></div>
              </div>
          `;
          
          // Add favorite functionality
          const favoriteIconEl = carResults.querySelector('.favorite-icon');
          if (favoriteIconEl) {
              favoriteIconEl.addEventListener('click', async (e) => {
                  e.stopPropagation();
                  
                  if (!api.isLoggedIn()) {
                      window.location.href = '../pages/login.html';
                      return;
                  }
                  
                  try {
                      await api.saveFavorite({
                        carId: car.id,
                        imageUrl: car.imageUrl,
                        description: `${car.make} ${car.model}`
                      });
                      favoriteIconEl.className = 'fas fa-heart favorite-icon active';
                  } catch (error) {
                      console.error('Failed to save favorite:', error);
                  }
              });
          }
          
          // Make entire card clickable for car details
          carResults.addEventListener('click', () => {
              // Navigate to car details page
              window.location.href = `car.html?id=${car.id}`;
          });
          
          this.resultsContainer.appendChild(carResults);
      });
  }
}