// filepath: /workspaces/weather-temperature-conversor/temperature_conversor/src/environments/weatherApiKey.ts
import * as dotenv from 'dotenv';

dotenv.config();

export const weatherApiKey = {
  production: false,
  key: {
    apiKey: process.env["WEATHER_API_KEY"]
  }
};