import 'dotenv/config';

export const ENV = {
  PORT: process.env.PORT || '3000',

  // Telegram
  BOT_TOKEN: process.env.BOT_TOKEN || '',

  // ВНЕШНИЕ API
  OWM_KEY: process.env.OWM_KEY || '60e67dcf04e26cc3476576b142da0e17',        // OpenWeather
  YANDEX_KEY: process.env.YANDEX_KEY || '699a63c2-5e00-49cd-b9d6-2ef3f650d24e',  // Yandex Maps/Geocoder

  // --- OpenRouter (ИИ) ---
  // Базовый URL OpenRouter (OpenAI-совместимый):
  AI_BASE_URL: process.env.AI_BASE_URL || 'https://openrouter.ai/api/v1',
  // Ваш API-ключ OpenRouter (формата or_...):
  AI_API_KEY: process.env.AI_API_KEY || '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',
  // Модель по умолчанию — бесплатная версия gpt-oss-120b:
  AI_MODEL: process.env.AI_MODEL || 'openai/gpt-oss-120b:free',
  // Опционально (атрибуция приложения в OpenRouter):
  HTTP_REFERER: process.env.HTTP_REFERER || process.env.WEBAPP_ORIGIN || '',
  X_TITLE: process.env.X_TITLE || 'TravelBot Mini App',

  // БД
  DATABASE_URL: process.env.DATABASE_URL || ''
};
