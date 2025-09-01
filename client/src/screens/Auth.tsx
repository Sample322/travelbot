import React from 'react';
import { useTranslation } from 'react-i18next';
import { authVerify } from '../api';

interface AuthProps {
  onOk: () => void;
}

/**
 * Auth screen. When the app is launched outside Telegram or the
 * verification fails, this screen is shown. It prompts the user to
 * open the mini‑app inside Telegram. A retry button attempts to
 * perform verification again by calling the backend.
 */
export default function Auth({ onOk }: AuthProps) {
  const { t } = useTranslation();
  const handleRetry = async () => {
    try {
      const result: any = await authVerify();
      if (result?.ok) {
        onOk();
      }
    } catch (err) {
      // Ignore errors; remain on auth screen.
    }
  };
  return (
    <div className="h-full flex flex-col items-center justify-center p-4">
      <h1 className="text-xl font-bold mb-4">{t('welcome')} TravelBot</h1>
      <p className="text-center mb-4">
        Откройте это приложение через Telegram, чтобы продолжить.
      </p>
      <button onClick={handleRetry} className="bg-blue-600 text-white px-4 py-2 rounded">
        Повторить попытку
      </button>
    </div>
  );
}