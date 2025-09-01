import OpenAI from 'openai';

/**
 * Factory for OpenAI client. Returns null if no key is provided so
 * that downstream code can gracefully fall back to dummy data. The
 * OpenAI client is used for both route generation and travel tips.
 */
export function makeOpenAI(apiKey?: string) {
  if (!apiKey) return null;
  return new OpenAI({ apiKey });
}

/**
 * Build the system and user prompts and call the OpenAI chat
 * completion API to generate a travel route. The response must be
 * strictly JSON. The language field controls whether the prompts
 * should be Russian or English. A small temperature is used for
 * consistency.
 */
export async function generateRouteJSON(openai: OpenAI | null, payload: {
  city: string;
  time: string;
  profile: any;
  hunger: string;
  transport: string;
  withKids: boolean;
  language: 'ru' | 'en';
}) {
  if (!openai) {
    // If OpenAI client is not configured, return a simple static
    // response so that the frontend can still function. This is
    // convenient for development without an API key.
    return {
      title: payload.language === 'ru' ? `Маршрут по ${payload.city}` : `Route in ${payload.city}`,
      duration: payload.time,
      places: [
        {
          name: payload.language === 'ru' ? 'Главная площадь' : 'Main Square',
          type: payload.language === 'ru' ? 'достопримечательность' : 'sight',
          time: '45m',
          description: payload.language === 'ru' ? 'Центр города.' : 'City centre.'
        },
        {
          name: payload.language === 'ru' ? 'Музей истории' : 'History Museum',
          type: payload.language === 'ru' ? 'музей' : 'museum',
          time: '1h',
          description: payload.language === 'ru' ? 'Классическая экспозиция.' : 'Classical exhibits.'
        }
      ],
      estimatedCost: payload.language === 'ru' ? 'до 2000₽' : 'under $25'
    };
  }

  const system = payload.language === 'ru'
    ? `Ты — профессиональный туристический гид. Ответ верни строго в формате JSON (без markdown) со структурой:\n{ "title": "...", "duration": "...", "places": [{"name":"...","type":"...","time":"...","description":"..."}], "estimatedCost": "...", "language": "ru" }. Маршрут должен быть максимально пешим (минимум транспорта).`
    : `You are a professional travel guide. Respond strictly in JSON (no markdown) with structure:\n{ "title": "...", "duration": "...", "places": [{"name":"...","type":"...","time":"...","description":"..."}], "estimatedCost": "...", "language": "en" }. The route should be predominantly walkable (minimal public transport).`;

  const user = payload.language === 'ru'
    ? `Город: ${payload.city}. Время: ${payload.time}. Предпочтения: ${JSON.stringify(payload.profile)}. Голод: ${payload.hunger}. Транспорт: ${payload.transport}. Дети: ${payload.withKids ? 'да' : 'нет'}.`
    : `City: ${payload.city}. Time: ${payload.time}. Preferences: ${JSON.stringify(payload.profile)}. Hunger: ${payload.hunger}. Transport: ${payload.transport}. Kids: ${payload.withKids ? 'yes' : 'no'}.`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    temperature: 0.4,
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user }
    ]
  });
  let text = response.choices[0]?.message?.content || '{}';
  text = text.replace(/```json|```/g, '').trim();
  return JSON.parse(text);
}

/**
 * Generate travel recommendations (weather summary, clothing list,
 * best visiting times and general tips) via the OpenAI API. Takes the
 * user's preferences and a snippet of the weather forecast as input.
 */
export async function generateTips(openai: OpenAI | null, payload: {
  city: string;
  dates: { from: string; to: string };
  prefs: any;
  daily: any;
  language: 'ru' | 'en';
}) {
  const fallback = {
    weather: {
      summary: payload.language === 'ru' ? 'Посмотрите прогноз погоды на выбранные даты.' : 'Check the weather forecast for the selected dates.'
    },
    clothing: payload.language === 'ru' ? ['Удобная обувь', 'Небольшая куртка'] : ['Comfortable shoes', 'Light jacket'],
    bestTimes: payload.language === 'ru' ? ['10:00-12:00 — меньше туристов'] : ['10:00-12:00 — fewer tourists'],
    tips: payload.language === 'ru' ? ['Возьмите повербанк', 'Скачайте офлайн-карты'] : ['Bring a power bank', 'Download offline maps']
  };
  if (!openai) return fallback;

  const system = payload.language === 'ru'
    ? `Ты — эксперт по путешествиям и погоде. Верни JSON:\n{ "weather": { "summary": "..." }, "clothing": ["..."], "bestTimes": ["..."], "tips": ["..."] }.`
    : `You are a travel and weather expert. Return JSON:\n{ "weather": { "summary": "..." }, "clothing": ["..."], "bestTimes": ["..."], "tips": ["..."] }.`;
  const weatherDigest = JSON.stringify(payload.daily?.daily?.slice(0, 7) ?? []);
  const userPrompt = payload.language === 'ru'
    ? `Город: ${payload.city}. Даты: ${payload.dates.from}—${payload.dates.to}. Предпочтения: ${JSON.stringify(payload.prefs)}. Прогноз: ${weatherDigest}.`
    : `City: ${payload.city}. Dates: ${payload.dates.from}-${payload.dates.to}. Preferences: ${JSON.stringify(payload.prefs)}. Forecast: ${weatherDigest}.`;
  const resp = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    temperature: 0.2,
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: userPrompt }
    ]
  });
  let text = resp.choices[0]?.message?.content || '{}';
  text = text.replace(/```json|```/g, '').trim();
  return JSON.parse(text);
}