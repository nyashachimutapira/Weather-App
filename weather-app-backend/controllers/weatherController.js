const { fetchCurrentWeather } = require('../utils/weatherUtils');
const Search = require('../models/Search');

exports.current = async (req, res, next) => {
  try {
    const city = req.query.city;
    if (!city) return res.status(400).json({ message: 'city query param required' });
    let data;
    if (process.env.MOCK_WEATHER === 'true' || process.env.NODE_ENV === 'test') {
      data = mockWeather.forCity(city);
    } else {
      data = await fetchCurrentWeather(city);
    }
    // save search (non-blocking)
    (async () => {
      try {
        const owner = req.user && req.user.id ? req.user.id : null;
        await Search.create({ user: owner, city, response: data });
      } catch (e) {
        console.warn('Search save failed:', e.message || e);
      }
    })();
    res.json({ data });
  } catch (err) {
    next(err);
  }
};
const mockWeather = require('../utils/mockWeather');
