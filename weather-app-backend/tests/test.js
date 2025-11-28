const axios = require('axios');

const BASE = process.env.BASE_URL || 'http://localhost:5000';
const email = process.env.TEST_EMAIL || `test+${Date.now()}@example.com`;
const password = process.env.TEST_PASSWORD || 'Secret123!';
const name = 'Test User';

async function attemptLogin() {
  try {
    const res = await axios.post(`${BASE}/api/user/login`, { email, password }, { timeout: 5000 });
    console.log('Login successful');
    return res.data.token;
  } catch (err) {
    if (err.response) console.log('Login failed:', err.response.data);
    else console.log('Login error:', err.message);
    return null;
  }
}

async function register() {
  try {
    const res = await axios.post(`${BASE}/api/user/register`, { name, email, password }, { timeout: 5000 });
    console.log('Registered user:', email);
    return res.data.token;
  } catch (err) {
    if (err.response) console.log('Register failed:', err.response.data);
    else console.log('Register error:', err.message);
    return null;
  }
}

async function getCurrentWeather(city, token) {
  try {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const res = await axios.get(`${BASE}/api/weather/current`, { params: { city }, headers, timeout: 10000 });
    console.log(`Weather for ${city}:`, res.data.data && res.data.data.weather ? res.data.data.weather[0].description : 'ok');
    return res.data;
  } catch (err) {
    if (err.response) console.log(`Weather call failed (${city}):`, err.response.data);
    else console.log(`Weather call error (${city}):`, err.message);
    return null;
  }
}

async function getMySearches(token) {
  try {
    const res = await axios.get(`${BASE}/api/my-searches`, { headers: { Authorization: `Bearer ${token}` }, timeout: 5000 });
    console.log('My searches count:', (res.data.searches || []).length);
    return res.data;
  } catch (err) {
    if (err.response) console.log('My searches failed:', err.response.data);
    else console.log('My searches error:', err.message);
    return null;
  }
}

async function run() {
  console.log('Base URL:', BASE);
  if (process.env.MOCK_WEATHER === 'true') console.log('Note: MOCK_WEATHER=true — server should return canned weather responses');
  let token = await attemptLogin();
  if (!token) {
    console.log('Attempting to register test user...');
    token = await register();
    if (!token) {
      console.error('Could not register or login. Aborting tests.');
      process.exit(1);
    }
  }

  // Try weather calls (may fail if backend lacks API key)
  await getCurrentWeather('London');
  await getCurrentWeather('New York', token);

  // Fetch user's searches
  await getMySearches(token);

  console.log('API tests completed');
  process.exit(0);
}

run();
