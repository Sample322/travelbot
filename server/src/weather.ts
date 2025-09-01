import ky from 'ky';

/**
 * Retrieve the daily and hourly weather forecast using the OpenWeather
 * One Call 3.0 API. This endpoint returns current weather, hourly
 * forecast for 48 hours and daily forecast for eight days. We exclude
 * the minutely part by default. Units are set to metric.
 *
 * @param lat Latitude of the location.
 * @param lng Longitude of the location.
 * @param apiKey OpenWeatherMap API key.
 */
export async function oneCallDaily(lat: number, lng: number, apiKey: string) {
  const url = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lng}&exclude=minutely&units=metric&appid=${apiKey}`;
  const data = await ky.get(url).json<any>();
  return data;
}