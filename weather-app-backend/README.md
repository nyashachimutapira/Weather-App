# Weather App Backend

Express + MongoDB backend for the Weather App.

Quick start

1. Copy `.env.example` to `.env` and fill values.
2. Install dependencies and run:

```powershell
cd weather-app-backend
npm install
npm run dev
```
 APIs
 - `POST /api/user/register` - register
 - `POST /api/user/login` - login
 - `GET /api/user/me` - get current user (auth)
 - `GET /api/weather/current?city=...` - get current weather
 - `GET /api/my-searches` - get user's saved searches (auth)

 Mocking for tests
 - To run the server so weather responses are mocked (no external API calls), start the server with `MOCK_WEATHER=true` in PowerShell:

 ```powershell
 $env:MOCK_WEATHER='true'; npm run dev
 ```

 This will return canned weather data (useful for automated tests or when you don't have an API key).
- `GET /api/my-searches` - get user's saved searches (auth)
