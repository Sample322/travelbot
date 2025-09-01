import OpenAI from 'openai';
import { ENV } from './env';

export function makeLLM() {
  if (!ENV.AI_API_KEY) return null;
  return new OpenAI({
    apiKey: ENV.AI_API_KEY,
    baseURL: ENV.AI_BASE_URL,
    defaultHeaders: {
      ...(ENV.HTTP_REFERER ? { 'HTTP-Referer': ENV.HTTP_REFERER } : {}),
      ...(ENV.X_TITLE ? { 'X-Title': ENV.X_TITLE } : {}),
    },
  });
}

async function completeJSON(system: string, user: string, model: string, temperature = 0.2) {
  const client = makeLLM();
  if (!client) return '{}';
  const resp = await client.chat.completions.create({
    model,
    temperature,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
  });
  return resp.choices[0]?.message?.content || '{}';
}

export async function generateRouteJSON(payload: {
  city: string;
  time: string;
  profile: any;
  hunger: string;
  transport: string;
  withKids: boolean;
  language: 'ru' | 'en';
}) {
  const { city, time, profile, hunger, transport, withKids, language } = payload;
  const system = language === 'ru'
    ? `Ты — профессиональный туристический гид. Верни строго JSON:
{ "title":"...", "duration":"...", "places":[{"name":"...","type":"...","time":"...","description":"..."}], "estimatedCost":"...", "language":"ru" }`
    : `You are a professional travel guide. Return STRICT JSON:
{ "title":"...", "duration":"...", "places":[{"name":"...","type":"...","time":"...","description":"..."}], "estimatedCost":"...", "language":"en" }`;
  const user = language === 'ru'
    ? `Город: ${city}. Время: ${time}. Предпочтения: ${JSON.stringify(profile)}. Голод: ${hunger}. Транспорт: ${transport}. Дети: ${withKids ? 'да' : 'нет'}.`
    : `City: ${city}. Time: ${time}. Preferences: ${JSON.stringify(profile)}. Hunger: ${hunger}. Transport: ${transport}. Kids: ${withKids ? 'yes' : 'no'}.`;
  const raw = await completeJSON(system, user, ENV.AI_MODEL, 0.4);
  const cleaned = raw.replace(/```json|```/g, '').trim();
  return JSON.parse(cleaned || '{}');
}

export async function generateTips(payload: {
  city: string;
  dates: { from: string; to: string };
  prefs: any;
  daily: any;
  language: 'ru' | 'en';
}) {
  const { city, dates, prefs, daily, language } = payload;
  const system = language === 'ru'
    ? `Ты — эксперт по путешествиям и погоде. Дай краткие советы в JSON:
{ "weather":{"summary":"..."}, "clothing":["..."], "bestTimes":["..."], "tips":["..."] }`
    : `You are a travel and weather expert. Return concise JSON:
{ "weather":{"summary":"..."}, "clothing":["..."], "bestTimes":["..."], "tips":["..."] }`;
  const user = `${language === 'ru' ? 'Город' : 'City'}: ${city}. Dates: ${dates.from}..${dates.to}. ${language === 'ru' ? 'Предпочтения' : 'Preferences'}: ${JSON.stringify(prefs)}. OpenWeather daily excerpt: ${JSON.stringify(daily?.daily?.slice(0, 7) ?? [])}`;
  const raw = await completeJSON(system, user, ENV.AI_MODEL, 0.2);
  const cleaned = raw.replace(/```json|```/g, '').trim();
  return JSON.parse(cleaned || '{}');
}
