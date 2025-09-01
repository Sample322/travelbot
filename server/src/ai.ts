import OpenAI from 'openai';
import { ENV } from './env';

/**
 * Создаём OpenAI-совместимый клиент, направленный на OpenRouter:
 *  - baseURL = https://openrouter.ai/api/v1
 *  - apiKey   = ваш or_... ключ
 *  - extra headers (опционально): HTTP-Referer, X-Title
 *
 * Документация: Quickstart + App Attribution.
 * OpenRouter поддерживает вызовы chat.completions через OpenAI SDK.
 */
export function makeLLM() {
  if (!ENV.AI_API_KEY) return null;
  return new OpenAI({
    apiKey: ENV.AI_API_KEY,
    baseURL: ENV.AI_BASE_URL
  });
}

/** Универсальный хелпер: просим модель вернуть СТРОГИЙ JSON */
async function completeJSON(system: string, user: string, temperature = 0.2) {
  const client = makeLLM();
  if (!client) return '{}';

  const res = await client.chat.completions.create({
    // имя модели берём из ENV; по умолчанию — openai/gpt-oss-120b:free
    model: ENV.AI_MODEL,
    temperature,
    response_format: { type: 'json_object' }, // запрос строго JSON (поддерживается в OpenRouter)
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user }
    ],
    // Рекомендуемые OpenRouter заголовки — для атрибуции (необязательно):
    extra_headers: {
      ...(ENV.HTTP_REFERER ? { 'HTTP-Referer': ENV.HTTP_REFERER } : {}),
      ...(ENV.X_TITLE ? { 'X-Title': ENV.X_TITLE } : {})
    }
  });

  return res.choices[0]?.message?.content || '{}';
}

/** Генерация маршрута в формате JSON */
export async function generateRouteJSON(_client: OpenAI | null, payload: {
  city: string; time: string; profile: any; hunger: string; transport: string;
  withKids: boolean; language: 'ru'|'en';
}) {
  const system = payload.language === 'ru'
    ? `Ты — профессиональный туристический гид. Верни строго JSON:
{ "title":"...", "duration":"...",
  "places":[{"name":"...","type":"...","time":"...","description":"..."}],
  "estimatedCost":"...", "language":"ru" }
Маршрут преимущественно пешком (минимум транспорта).`
    : `You are a professional travel guide. Return STRICT JSON:
{ "title":"...", "duration":"...",
  "places":[{"name":"...","type":"...","time":"...","description":"..."}],
  "estimatedCost":"...", "language":"en" }
Prefer walking routes (minimal transit).`;

  const user = payload.language === 'ru'
    ? `Город: ${payload.city}. Время: ${payload.time}.
Предпочтения: ${JSON.stringify(payload.profile)}.
Голод: ${payload.hunger}. Транспорт: ${payload.transport}. Дети: ${payload.withKids?'да':'нет'}.`
    : `City: ${payload.city}. Time: ${payload.time}.
Preferences: ${JSON.stringify(payload.profile)}.
Hunger: ${payload.hunger}. Transport: ${payload.transport}. Kids: ${payload.withKids?'yes':'no'}.`;

  const text = await completeJSON(system, user, 0.4);
  return JSON.parse(text.replace(/```json|```/g,'').trim() || '{}');
}

/** Советы по погоде/одежде */
export async function generateTips(_client: OpenAI | null, payload: {
  city: string; dates: {from:string; to:string}; prefs:any; daily:any; language:'ru'|'en';
}) {
  const system = payload.language === 'ru'
    ? `Ты — эксперт по путешествиям и погоде. Дай краткие советы в JSON:
{ "weather":{"summary":"..."},
  "clothing":["..."], "bestTimes":["..."], "tips":["..."] }`
    : `You are a travel & weather expert. Return concise JSON:
{ "weather":{"summary":"..."},
  "clothing":["..."], "bestTimes":["..."], "tips":["..."] }`;

  const user = `${payload.language==='ru'?'Город':'City'}: ${payload.city}. Dates: ${payload.dates.from}..${payload.dates.to}.
${payload.language==='ru'?'Предпочтения':'Preferences'}: ${JSON.stringify(payload.prefs)}.
OpenWeather daily excerpt: ${JSON.stringify(payload.daily?.daily?.slice(0,7) ?? [])}`;

  const text = await completeJSON(system, user, 0.2);
  return JSON.parse(text.replace(/```json|```/g,'').trim() || '{}');
}
