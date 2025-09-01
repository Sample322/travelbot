import 'dotenv/config';

/**
 * Файл собирает все переменные окружения и предоставляет их как объект ENV.
 * Эти значения задаются в панели Timeweb (Apps → Настройка → Переменные) на этапе деплоя.
 */
export const ENV = {
  PORT: process.env.PORT || '3000',
  BOT_TOKEN: process.env.BOT_TOKEN || '',
  // API keys
  OWM_KEY: process.env.OWM_KEY || '',
  YANDEX_KEY: process.env.YANDEX_KEY || '',
  // AI (OpenRouter/OpenAI)
  AI_BASE_URL: process.env.AI_BASE_URL || 'https://openrouter.ai/api/v1',
  AI_API_KEY: process.env.AI_API_KEY || '',
  AI_MODEL: process.env.AI_MODEL || 'openai/gpt-oss-120b:free',
  HTTP_REFERER: process.env.HTTP_REFERER || process.env.WEBAPP_ORIGIN || '',
  X_TITLE: process.env.X_TITLE || 'TravelBot Mini App',
  // Database
  DATABASE_URL: process.env.DATABASE_URL || '',
};
