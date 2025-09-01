import 'dotenv/config';

/**
 * Centralised environment variable loader. Reads known variables and
 * exposes them with default fallbacks. The server should be
 * configured via environment variables (.env file in development).
 */
export const ENV = {
  /**
   * Port on which the HTTP server listens. Defaults to 3000.
   */
  PORT: process.env.PORT || '3000',
  /**
   * Telegram bot token. Required for verifying initData.
   */
  BOT_TOKEN: process.env.BOT_TOKEN || '',
  /**
   * OpenAI API key for AI-based route and tips generation. If
   * undefined, AI functions will fall back to static mocks.
   */
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  /**
   * OpenWeatherMap One Call API key. Used for fetching weather
   * forecasts in the planning screen.
   */
  OWM_KEY: process.env.OWM_KEY || '',
  /**
   * Yandex Geocoder API key. Used for city and place
   * geocoding/reverse-geocoding and for the maps JS API. You can
   * generate one at https://developer.tech.yandex.ru.
   */
  YANDEX_KEY: process.env.YANDEX_KEY || '',
  /**
   * PostgreSQL connection string. Follows the standard URL format
   * accepted by Prisma and pg.
   */
  DATABASE_URL: process.env.DATABASE_URL || ''
};