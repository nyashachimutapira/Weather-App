# Weather App

A real-time weather application built with vanilla JavaScript, Express.js, and MongoDB.

## Features

- Real-time weather data from OpenWeatherMap API
- Current weather conditions with detailed metrics
- 5-day forecast
- Hourly forecast
- Recent searches with local storage
- UV Index and Air Quality data
- Responsive design for mobile and desktop
- Dark mode support
- Offline detection

## Setup

### Frontend
1. Open `index.html` in a web browser
2. Add your OpenWeatherMap API key to `js/app.js` (line 659)

### Backend
1. Install dependencies: `npm install` (in `weather-app-backend/`)
2. Create `.env` file with MongoDB URI and API keys
3. Start server: `npm run dev`

## Helpful Resources
* [OpenWeatherMap API](https://openweathermap.org/api)
* [Express.js Documentation](https://expressjs.com/)
* [MongoDB Documentation](https://docs.mongodb.com/)