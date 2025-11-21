/**
 * Weather App - CSE 340 Technical Demonstration
 * Features: API calls, JSON parsing, error handling, local storage
 * Uses OpenWeatherMap API (free tier)
 */

class WeatherApp {
    constructor() {
        this.apiKey = 'YOUR_OPENWEATHERMAP_API_KEY'; // Replace with your API key
        this.apiUrl = 'https://api.openweathermap.org/data/2.5';
        this.currentCity = '';
        this.unit = 'metric'; // 'metric' for Celsius, 'imperial' for Fahrenheit
        this.recentSearchesKey = 'weather-recent-searches';
        this.maxRecentSearches = 5;
        
        this.elements = {
            cityInput: document.getElementById('cityInput'),
            searchBtn: document.getElementById('searchBtn'),
            recentSearches: document.getElementById('recentSearches'),
            searchesList: document.getElementById('searchesList'),
            clearSearches: document.getElementById('clearSearches'),
            loadingState: document.getElementById('loadingState'),
            errorState: document.getElementById('errorState'),
            errorMessage: document.getElementById('errorMessage'),
            retryBtn: document.getElementById('retryBtn'),
            newSearchBtn: document.getElementById('newSearchBtn'),
            weatherDisplay: document.getElementById('weatherDisplay'),
            cityName: document.getElementById('cityName'),
            currentTime: document.getElementById('currentTime'),
            lastUpdated: document.getElementById('lastUpdated'),
            weatherIcon: document.getElementById('weatherIcon'),
            tempValue: document.getElementById('tempValue'),
            tempUnit: document.getElementById('tempUnit'),
            feelsLike: document.getElementById('feelsLike'),
            humidity: document.getElementById('humidity'),
            wind: document.getElementById('wind'),
            visibility: document.getElementById('visibility'),
            pressure: document.getElementById('pressure'),
            weatherDescription: document.getElementById('weatherDescription'),
            sunrise: document.getElementById('sunrise'),
            sunset: document.getElementById('sunset'),
            uvIndex: document.getElementById('uvIndex'),
            uvFill: document.getElementById('uvFill'),
            uvDescription: document.getElementById('uvDescription'),
            aqIndex: document.getElementById('aqIndex'),
            aqColor: document.getElementById('aqColor'),
            aqDescription: document.getElementById('aqDescription'),
            hourlyGrid: document.getElementById('hourlyGrid'),
            dailyGrid: document.getElementById('dailyGrid'),
            viewHourly: document.getElementById('viewHourly')
        };
        
        this.init();
    }
    
    init() {
        // Event listeners
        this.elements.searchBtn.addEventListener('click', () => this.searchWeather());
        this.elements.cityInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.searchWeather();
            }
        });
        
        this.elements.retryBtn?.addEventListener('click', () => this.searchWeather());
        this.elements.newSearchBtn?.addEventListener('click', () => this.clearError());
        this.elements.clearSearches?.addEventListener('click', () => this.clearRecentSearches());
        this.elements.viewHourly?.addEventListener('click', (e) => {
            e.preventDefault();
            this.toggleHourlyView();
        });
        
        // Load recent searches
        this.loadRecentSearches();
        
        // Focus input on page load
        setTimeout(() => {
            this.elements.cityInput.focus();
        }, 100);
        
        // Update time every minute
        setInterval(() => {
            if (this.currentCity) {
                this.updateCurrentTime();
            }
        }, 60000);
        
        console.log('🌤️ Weather App initialized');
        console.log('📡 API Endpoint:', this.apiUrl);
        console.log('🔑 Using', this.apiKey ? 'valid API key' : 'demo mode (no API calls)');
    }
    
    async searchWeather() {
        const city = this.elements.cityInput.value.trim();
        
        if (!city) {
            this.showError('Please enter a city name');
            this.elements.cityInput.focus();
            this.elements.cityInput.classList.add('error');
            setTimeout(() => this.elements.cityInput.classList.remove('error'), 2000);
            return;
        }
        
        // Validate city name (basic)
        if (city.length < 2 || city.length > 50) {
            this.showError('City name must be between 2 and 50 characters');
            return;
        }
        
        // Sanitize input
        const cleanCity = city.replace(/[^\w\s-]/g, '').replace(/\s+/g, ' ').trim();
        
        if (cleanCity !== city) {
            this.elements.cityInput.value = cleanCity;
        }
        
        this.currentCity = cleanCity;
        this.hideAllStates();
        this.showLoading();
        
        console.log(`🔍 Searching weather for: ${cleanCity}`);
        
        try {
            // Check if API key is available
            if (!this.apiKey || this.apiKey === 'YOUR_OPENWEATHERMAP_API_KEY') {
                // Demo mode - use mock data
                console.warn('⚠️  Using demo mode (no API key provided)');
                await this.loadDemoData(cleanCity);
                return;
            }
            
            // Real API call
            const weatherData = await this.fetchWeatherData(cleanCity);
            await this.displayWeather(weatherData);
            this.addToRecentSearches(cleanCity);
            
        } catch (error) {
            console.error('❌ Weather search failed:', error);
            this.handleSearchError(error, cleanCity);
        }
    }
    
    async fetchWeatherData(city) {
        console.log(`🌐 Making API call for ${city}...`);
        
        // Current weather
        const currentUrl = `${this.apiUrl}/weather?q=${encodeURIComponent(city)}&appid=${this.apiKey}&units=${this.unit}&lang=en`;
        
        // 5-day forecast
        const forecastUrl = `${this.apiUrl}/forecast?q=${encodeURIComponent(city)}&appid=${this.apiKey}&units=${this.unit}&lang=en`;
        
        // UV index (current)
        const uvUrl = `${this.apiUrl}/uvi?lat={lat}&lon={lon}&appid=${this.apiKey}`;
        
        // Air quality (requires One Call API 3.0 - using mock for demo)
        const aqUrl = ''; // Mock data for demo
        
        try {
            // Fetch current weather first to get coordinates
            const currentResponse = await fetch(currentUrl);
            
            if (!currentResponse.ok) {
                const errorData = await currentResponse.json();
                throw new Error(`HTTP ${currentResponse.status}: ${errorData.message || 'City not found'}`);
            }
            
            const currentData = await currentResponse.json();
            console.log('✅ Current weather fetched:', currentData.name);
            
            // Get UV data using coordinates
            const uvResponse = await fetch(
                uvUrl.replace('{lat}', currentData.coord.lat).replace('{lon}', currentData.coord.lon)
            );
            const uvData = await uvResponse.json();
            
            // Get forecast
            const forecastResponse = await fetch(forecastUrl);
            const forecastData = await forecastResponse.json();
            
            return {
                current: currentData,
                forecast: forecastData,
                uv: uvData || { value: 0 },
                airQuality: this.getMockAirQuality() // Mock for demo
            };
            
        } catch (error) {
            console.error('API fetch error:', error);
            throw error;
        }
    }
    
    async loadDemoData(city) {
        console.log(`🎭 Loading demo data for ${city}...`);
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Mock weather data
        const demoData = {
            current: {
                name: city,
                weather: [{ main: 'Clear', description: 'clear sky', icon: '01d' }],
                main: { temp: 22.5, feels_like: 23.1, humidity: 65, pressure: 1013 },
                wind: { speed: 3.5 },
                visibility: 10000,
                sys: { sunrise: Math.floor(Date.now() / 1000) - 3600 * 2, sunset: Math.floor(Date.now() / 1000) + 3600 * 8 },
                coord: { lat: 40.7128, lon: -74.0060 }
            },
            forecast: {
                list: [
                    // Mock hourly data for next 6 hours
                    { dt_txt: new Date(Date.now() + 3600 * 1000).toISOString(), main: { temp: 23 }, weather: [{ icon: '01d' }] },
                    { dt_txt: new Date(Date.now() + 7200 * 1000).toISOString(), main: { temp: 24 }, weather: [{ icon: '02d' }] },
                    { dt_txt: new Date(Date.now() + 10800 * 1000).toISOString(), main: { temp: 25 }, weather: [{ icon: '03d' }] },
                    { dt_txt: new Date(Date.now() + 14400 * 1000).toISOString(), main: { temp: 24 }, weather: [{ icon: '04d' }] },
                    { dt_txt: new Date(Date.now() + 18000 * 1000).toISOString(), main: { temp: 22 }, weather: [{ icon: '01d' }] },
                    { dt_txt: new Date(Date.now() + 21600 * 1000).toISOString(), main: { temp: 21 }, weather: [{ icon: '02n' }] }
                ],
                // Mock daily data for 5 days
                daily: [
                    { temp: { day: 23, min: 18, max: 26 }, weather: [{ icon: '01d' }], dt: Math.floor(Date.now() / 1000) },
                    { temp: { day: 24, min: 19, max: 27 }, weather: [{ icon: '02d' }], dt: Math.floor(Date.now() / 1000) + 86400 },
                    { temp: { day: 22, min: 17, max: 25 }, weather: [{ icon: '03d' }], dt: Math.floor(Date.now() / 1000) + 172800 },
                    { temp: { day: 25, min: 20, max: 28 }, weather: [{ icon: '04d' }], dt: Math.floor(Date.now() / 1000) + 259200 },
                    { temp: { day: 21, min: 16, max: 24 }, weather: [{ icon: '01d' }], dt: Math.floor(Date.now() / 1000) + 345600 }
                ]
            },
            uv: { value: 5 },
            airQuality: { index: 2, category: 'Good' }
        };
        
        await this.displayWeather(demoData);
        this.addToRecentSearches(city);
    }
    
    async displayWeather(data) {
        console.log('📊 Displaying weather data...');
        
        try {
            const current = data.current;
            const forecast = data.forecast;
            const uv = data.uv;
            const airQuality = data.airQuality;
            
            // Hide loading, show weather
            this.hideLoading();
            this.elements.weatherDisplay.style.display = 'block';
            this.elements.weatherDisplay.classList.add('fade-in');
            
            // Current Weather
            this.elements.cityName.textContent = `${current.name}, ${current.sys.country}`;
            this.elements.weatherDescription.innerHTML = `
                <i class="fas fa-${this.getWeatherIcon(current.weather[0].icon)}"></i>
                <strong>${this.capitalizeFirst(current.weather[0].description)}</strong>
            `;
            
            // Temperature
            const temp = Math.round(current.main.temp);
            const feelsLike = Math.round(current.main.feels_like);
            this.elements.tempValue.textContent = temp;
            this.elements.feelsLike.textContent = `${feelsLike}°${this.getTempUnit()}`;
            
            // Weather Icon
            this.elements.weatherIcon.innerHTML = `<i class="fas fa-${this.getWeatherIcon(current.weather[0].icon)}"></i>`;
            
            // Weather Details
            this.elements.humidity.textContent = `${current.main.humidity}%`;
            this.elements.wind.textContent = `${Math.round(current.wind.speed)}${this.getWindUnit()}`;
            this.elements.visibility.textContent = `${(current.visibility / 1609.34).toFixed(1)} mi`;
            this.elements.pressure.textContent = `${current.main.pressure} hPa`;
            
            // Sunrise/Sunset
            const sunrise = new Date(current.sys.sunrise * 1000);
            const sunset = new Date(current.sys.sunset * 1000);
            this.elements.sunrise.textContent = sunrise.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
            this.elements.sunset.textContent = sunset.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
            
            // UV Index
            this.elements.uvIndex.textContent = uv.value || '--';
            const uvPercentage = Math.min((uv.value || 0) / 11 * 100, 100); // UV max 11
            this.elements.uvFill.style.width = `${uvPercentage}%`;
            this.elements.uvDescription.textContent = this.getUVDescription(uv.value || 0);
            
            // Air Quality
            this.elements.aqIndex.textContent = airQuality.index || '--';
            this.elements.aqColor.style.background = this.getAirQualityColor(airQuality.index || 0);
            this.elements.aqDescription.textContent = this.getAirQualityDescription(airQuality.index || 0);
            
            // Update time and last updated
            this.updateCurrentTime();
            this.elements.lastUpdated.textContent = `Last updated: ${new Date().toLocaleTimeString()}`;
            
            // Hourly Forecast
            this.displayHourlyForecast(forecast.list.slice(0, 6));
            
            // Daily Forecast
            this.displayDailyForecast(data.forecast.daily || forecast.list.filter((item, index, arr) => 
                index % 8 === 0 && index < 40
            ).slice(0, 5));
            
            // Add success class for animations
            document.body.classList.add('weather-loaded');
            
            console.log('✅ Weather display complete');
            
        } catch (error) {
            console.error('❌ Display error:', error);
            this.showError('Failed to display weather data. Please try again.');
        }
    }
    
    displayHourlyForecast(hourlyData) {
        const container = this.elements.hourlyGrid;
        container.innerHTML = '';
        
        hourlyData.forEach((hour, index) => {
            const time = new Date(hour.dt_txt);
            const temp = Math.round(hour.main.temp);
            const icon = hour.weather[0].icon;
            const description = this.capitalizeFirst(hour.weather[0].description);
            
            const hourCard = document.createElement('div');
            hourCard.className = 'hourly-card';
            hourCard.innerHTML = `
                <div class="hourly-icon">
                    <i class="fas fa-${this.getWeatherIcon(icon)}"></i>
                </div>
                <div class="hourly-time">${time.getHours()}:00</div>
                <div class="hourly-temp">${temp}°</div>
                <div class="hourly-desc">${description}</div>
            `;
            
            // Add click to show more details
            hourCard.addEventListener('click', () => {
                this.showHourlyDetails(hour, time);
            });
            
            container.appendChild(hourCard);
        });
        
        // Add empty cards for spacing if needed
        while (container.children.length < 8) {
            const spacer = document.createElement('div');
            spacer.style.width = '1rem';
            container.appendChild(spacer);
        }
    }
    
    displayDailyForecast(dailyData) {
        const container = this.elements.dailyGrid;
        container.innerHTML = '';
        
        dailyData.forEach((day, index) => {
            const date = new Date(day.dt * 1000);
            const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
            const tempHigh = Math.round(day.temp.max);
            const tempLow = Math.round(day.temp.min);
            const icon = day.weather[0].icon;
            const description = this.capitalizeFirst(day.weather[0].description);
            
            const dayCard = document.createElement('div');
            dayCard.className = 'daily-card';
            dayCard.innerHTML = `
                <div class="daily-day">${dayName}</div>
                <div class="daily-icon">
                    <i class="fas fa-${this.getWeatherIcon(icon)}"></i>
                </div>
                <div class="daily-temp">${tempHigh}°</div>
                <div class="daily-range">${tempLow}° / ${tempHigh}°</div>
                <div class="daily-desc">${description}</div>
            `;
            
            container.appendChild(dayCard);
        });
    }
    
    showHourlyDetails(hour, time) {
        // Simple modal or tooltip - for demo, just log
        console.log('🕐 Hourly details clicked:', {
            time: time.toLocaleString(),
            temp: Math.round(hour.main.temp),
            description: hour.weather[0].description,
            humidity: hour.main.humidity,
            wind: hour.wind.speed
        });
        
        // In a real app, this would show a modal with more details
        alert(`Hourly details for ${time.toLocaleTimeString()}:\n\nTemperature: ${Math.round(hour.main.temp)}°\nFeels like: ${Math.round(hour.main.feels_like)}°\nHumidity: ${hour.main.humidity}%\nWind: ${hour.wind.speed} ${this.getWindUnit()}\n${this.capitalizeFirst(hour.weather[0].description)}`);
    }
    
    toggleHourlyView() {
        // For demo - toggle more/less hours
        const container = this.elements.hourlyGrid;
        const cards = container.querySelectorAll('.hourly-card');
        
        if (cards.length <= 6) {
            // Show more (mock data)
            this.elements.viewHourly.textContent = 'Show Less ←';
            // In real app, fetch more hourly data
            console.log('📈 Showing extended hourly forecast...');
        } else {
            // Show less
            this.elements.viewHourly.textContent = 'View All →';
            // Remove extra cards
            console.log('📉 Showing basic hourly forecast...');
        }
    }
    
    updateCurrentTime() {
        if (!this.currentCity) return;
        
        const now = new Date();
        this.elements.currentTime.textContent = now.toLocaleTimeString([], {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    }
    
    addToRecentSearches(city) {
        let recentSearches = JSON.parse(localStorage.getItem(this.recentSearchesKey) || '[]');
        
        // Remove existing entry
        recentSearches = recentSearches.filter(search => search.city.toLowerCase() !== city.toLowerCase());
        
        // Add to beginning
        recentSearches.unshift({ city, timestamp: Date.now() });
        
        // Keep only max recent
        recentSearches = recentSearches.slice(0, this.maxRecentSearches);
        
        localStorage.setItem(this.recentSearchesKey, JSON.stringify(recentSearches));
        
        this.updateRecentSearchesDisplay();
    }
    
    loadRecentSearches() {
        const recentSearches = JSON.parse(localStorage.getItem(this.recentSearchesKey) || '[]');
        
        if (recentSearches.length > 0) {
            this.elements.recentSearches.classList.add('show');
            this.elements.clearSearches.style.display = 'inline-flex';
            this.updateRecentSearchesDisplay(recentSearches);
        }
    }
    
    updateRecentSearchesDisplay(searches = null) {
        const recentSearches = searches || JSON.parse(localStorage.getItem(this.recentSearchesKey) || '[]');
        const container = this.elements.searchesList;
        container.innerHTML = '';
        
        recentSearches.forEach(search => {
            const timeAgo = this.getTimeAgo(search.timestamp);
            const searchTag = document.createElement('div');
            searchTag.className = 'search-tag';
            searchTag.innerHTML = `
                <i class="fas fa-clock"></i>
                <span>${search.city}</span>
                <small>${timeAgo}</small>
            `;
            
            searchTag.addEventListener('click', () => {
                this.elements.cityInput.value = search.city;
                this.searchWeather();
                searchTag.classList.add('active');
                setTimeout(() => searchTag.classList.remove('active'), 200);
            });
            
            container.appendChild(searchTag);
        });
    }
    
    clearRecentSearches() {
        if (confirm('Clear all recent searches? This cannot be undone.')) {
            localStorage.removeItem(this.recentSearchesKey);
            this.elements.recentSearches.classList.remove('show');
            this.elements.clearSearches.style.display = 'none';
            this.elements.searchesList.innerHTML = '';
            console.log('🗑️ Recent searches cleared');
        }
    }
    
    getTimeAgo(timestamp) {
        const now = Date.now();
        const diff = now - timestamp;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);
        
        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;
        return new Date(timestamp).toLocaleDateString();
    }
    
    showLoading() {
        this.elements.loadingState.style.display = 'flex';
        this.elements.weatherDisplay.style.display = 'none';
        this.elements.errorState.style.display = 'none';
        document.body.classList.remove('weather-loaded');
        console.log('⏳ Showing loading state...');
    }
    
    hideLoading() {
        this.elements.loadingState.style.display = 'none';
        console.log('✅ Hiding loading state...');
    }
    
    showError(message, isCritical = false) {
        console.error('❌ Error:', message);
        
        this.elements.errorMessage.textContent = message;
        this.elements.errorState.style.display = 'flex';
        this.elements.weatherDisplay.style.display = 'none';
        this.elements.loadingState.style.display = 'none';
        
        // Add error class for styling
        this.elements.errorState.classList.add(isCritical ? 'critical' : 'warning');
        
        // Focus on retry button
        setTimeout(() => {
            this.elements.retryBtn?.focus();
        }, 100);
        
        // Auto-hide non-critical errors after 10 seconds
        if (!isCritical) {
            setTimeout(() => {
                this.clearError();
            }, 10000);
        }
    }
    
    clearError() {
        this.elements.errorState.style.display = 'none';
        this.elements.cityInput.value = '';
        this.elements.cityInput.focus();
        this.elements.cityInput.classList.remove('error');
        console.log('✅ Error cleared');
    }
    
    hideAllStates() {
        this.elements.weatherDisplay.style.display = 'none';
        this.elements.errorState.style.display = 'none';
        this.elements.loadingState.style.display = 'none';
    }
    
    handleSearchError(error, city) {
        console.error('🔍 Search error details:', {
            city,
            message: error.message,
            status: error.status,
            code: error.code
        });
        
        let errorMessage = 'Unable to fetch weather data. ';
        let isCritical = false;
        
        if (error.message.includes('404') || error.message.includes('city not found')) {
            errorMessage += `City "${city}" not found. Please check the spelling and try again.`;
        } else if (error.message.includes('network') || !navigator.onLine) {
            errorMessage += 'No internet connection. Please check your connection and try again.';
            isCritical = true;
        } else if (error.message.includes('quota') || error.message.includes('rate limit')) {
            errorMessage += 'Too many requests. Please wait a moment and try again.';
        } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
            errorMessage += 'Network error. Please check your connection and try again.';
            isCritical = true;
        } else {
            errorMessage += error.message || 'An unexpected error occurred. Please try again.';
        }
        
        this.showError(errorMessage, isCritical);
    }
    
    // Utility Methods
    getWeatherIcon(iconCode) {
        // Map OpenWeatherMap icons to Font Awesome
        const iconMap = {
            '01d': 'sun', '01n': 'moon',
            '02d': 'cloud-sun', '02n': 'cloud-moon',
            '03d': 'cloud', '03n': 'cloud',
            '04d': 'cloud', '04n': 'cloud',
            '09d': 'cloud-rain', '09n': 'cloud-rain',
            '10d': 'cloud-sun-rain', '10n': 'cloud-moon-rain',
            '11d': 'bolt', '11n': 'bolt',
            '13d': 'snowflake', '13n': 'snowflake',
            '50d': 'smog', '50n': 'smog'
        };
        
        return iconMap[iconCode] || 'cloud';
    }
    
    capitalizeFirst(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    }
    
    getTempUnit() {
        return this.unit === 'metric' ? 'C' : 'F';
    }
    
    getWindUnit() {
        return this.unit === 'metric' ? ' m/s' : ' mph';
    }
    
    getUVDescription(uv) {
        if (uv <= 2) return 'Low - No protection needed';
        if (uv <= 5) return 'Moderate - Wear sunscreen';
        if (uv <= 7) return 'High - Seek shade during midday';
        if (uv <= 10) return 'Very High - Extra protection needed';
        return 'Extreme - Avoid being outside';
    }
    
    getAirQualityDescription(index) {
        const categories = [
            'Good', 'Fair', 'Moderate', 'Poor', 'Very Poor'
        ];
        return categories[index] || 'Unknown';
    }
    
    getAirQualityColor(index) {
        const colors = [
            '#10b981', '#f59e0b', '#f59e0b', '#ef4444', '#dc2626'
        ];
        return colors[index] || '#6b7280';
    }
    
    getMockAirQuality() {
        // Mock air quality data for demo
        const index = Math.floor(Math.random() * 5);
        return {
            index,
            category: this.getAirQualityDescription(index)
        };
    }
    
    // Temperature unit toggle (bonus feature)
    toggleUnit() {
        this.unit = this.unit === 'metric' ? 'imperial' : 'metric';
        this.elements.tempUnit.textContent = this.getTempUnit();
        
        if (this.currentCity) {
            this.searchWeather(); // Refresh with new units
        }
        
        localStorage.setItem('weather-unit', this.unit);
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Check for saved unit preference
    const savedUnit = localStorage.getItem('weather-unit') || 'metric';
    
    // For demo - replace with your actual OpenWeatherMap API key
    // Get free key at: https://openweathermap.org/api
    const apiKey = 'YOUR_OPENWEATHERMAP_API_KEY'; // Replace this!
    
    if (apiKey === 'YOUR_OPENWEATHERMAP_API_KEY') {
        console.warn('⚠️  No API key provided - running in demo mode');
        console.log('🔑 Get your free API key: https://openweathermap.org/api');
        console.log('📖 Documentation: https://openweathermap.org/api/one-call-3');
    }
    
    const app = new WeatherApp();
    
    // Global error handler
    window.addEventListener('error', (e) => {
        console.error('🌐 Client error:', e.error);
        
        // Don't show app error for demo mode warnings
        if (e.error.message && !e.error.message.includes('API key')) {
            document.body.classList.add('error-state');
            const errorOverlay = document.createElement('div');
            errorOverlay.className = 'error-overlay';
            errorOverlay.innerHTML = `
                <div class="error-modal">
                    <h3>Oops! An error occurred</h3>
                    <p>${e.error.message}</p>
                    <button onclick="this.parentElement.parentElement.remove(); document.body.classList.remove('error-state')">OK</button>
                </div>
            `;
            document.body.appendChild(errorOverlay);
        }
    });
    
    // Offline detection
    window.addEventListener('online', () => {
        console.log('🌐 Back online');
        if (app.currentCity) {
            app.searchWeather();
        }
    });
    
    window.addEventListener('offline', () => {
        console.log('📴 Went offline');
        app.showError('You are currently offline. Some features may not work.');
    });
    
    console.log('🎉 Weather App ready! Enter a city name to get started.');
    console.log('💡 Pro Tip: Try "London", "New York", "Tokyo", or "Sydney"');
});