// Simple mock weather data generator used for tests and local mocking.
// Keeps shape close to OpenWeatherMap `weather` response used by the app.

function seededRandom(seed) {
  let x = seed % 2147483647;
  if (x <= 0) x += 2147483646;
  return function () {
    x = (x * 16807) % 2147483647;
    return (x - 1) / 2147483646;
  };
}

function forCity(city) {
  const now = Math.floor(Date.now() / 1000);
  const seed = city.split('').reduce((s, c) => s + c.charCodeAt(0), 0);
  const rnd = seededRandom(seed);
  const baseTemp = 10 + Math.floor(rnd() * 20); // 10..30
  const variation = Math.floor(rnd() * 6) - 2; // -2..+3
  const temp = baseTemp + variation;
  const weatherOptions = [
    { id: 800, main: 'Clear', icon: '01d' },
    { id: 801, main: 'Clouds', icon: '02d' },
    { id: 500, main: 'Rain', icon: '10d' },
    { id: 600, main: 'Snow', icon: '13d' }
  ];
  const w = weatherOptions[Math.floor(rnd() * weatherOptions.length)];
  return {
    coord: { lon: 0, lat: 0 },
    weather: [
      {
        id: w.id,
        main: w.main,
        description: `${w.main} in ${city}`,
        icon: w.icon
      }
    ],
    base: 'stations',
    main: {
      temp: temp,
      feels_like: temp - 1,
      temp_min: temp - 2,
      temp_max: temp + 2,
      pressure: 1008 + Math.floor(rnd() * 8),
      humidity: 40 + Math.floor(rnd() * 50)
    },
    visibility: 10000,
    wind: { speed: +(rnd() * 8).toFixed(1), deg: Math.floor(rnd() * 360) },
    clouds: { all: Math.floor(rnd() * 100) },
    dt: now,
    sys: { country: 'XX', sunrise: now - 3600, sunset: now + 3600 },
    timezone: 0,
    id: seed,
    name: city,
    cod: 200
  };
}

module.exports = { forCity };
