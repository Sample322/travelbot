import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Translation resources for Russian and English. Extend these objects
// with additional keys as you add more UI text.
const resources = {
  ru: {
    translation: {
      welcome: 'Добро пожаловать',
      profile: 'Профиль',
      search: 'Поиск',
      generate: 'Создать маршрут',
      plan: 'Планирование',
      favorites: 'Избранное'
    }
  },
  en: {
    translation: {
      welcome: 'Welcome',
      profile: 'Profile',
      search: 'Search',
      generate: 'Generate route',
      plan: 'Planning',
      favorites: 'Favorites'
    }
  }
};

/** Detect the interface language from Telegram or fallback to Russian. */
export function detectLang() {
  const tg = (window as any).Telegram?.WebApp;
  const code = tg?.initDataUnsafe?.user?.language_code || 'ru';
  return code.startsWith('en') ? 'en' : 'ru';
}

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: detectLang(),
    fallbackLng: 'ru',
    interpolation: { escapeValue: false }
  });

export default i18n;