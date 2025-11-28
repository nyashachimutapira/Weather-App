const axios = require('axios');
const { baseUrl, apiKey } = require('../config/weatherApi');

async function fetchCurrentWeather(city) {
  if (!apiKey) throw new Error('WEATHER_API_KEY not configured');
  const url = `${baseUrl}/weather`;
  const params = { q: city, appid: apiKey, units: 'metric' };
  const res = await axios.get(url, { params, timeout: 5000 });
  return res.data;
}

module.exports = { fetchCurrentWeather };
