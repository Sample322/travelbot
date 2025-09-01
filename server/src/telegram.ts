import crypto from 'crypto';

/**
 * Парсит initData (raw query string), возвращает Map ключей.
 */
function parseInitDataRaw(initData: string): Map<string, string> {
  const params = new URLSearchParams(initData);
  const map = new Map<string, string>();
  for (const [k, v] of params.entries()) map.set(k, v);
  return map;
}

/**
 * Строит data_check_string согласно документации Telegram:
 * 1) Удаляем ключ 'hash'
 * 2) Сортируем пары по ключу
 * 3) Склеиваем "key=value" через "\n"
 */
function buildDataCheckString(map: Map<string, string>): string {
  const entries = [...map.entries()]
    .filter(([k]) => k !== 'hash')
    .sort(([a], [b]) => a.localeCompare(b));
  return entries.map(([k, v]) => `${k}=${v}`).join('\n');
}

/**
 * Секретный ключ: HMAC_SHA256(bot_token) с ключом 'WebAppData'
 */
function makeSecretKey(botToken: string): Buffer {
  return crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();
}

/**
 * Подпись: HMAC_SHA256(data_check_string) c secret_key
 */
function sign(secretKey: Buffer, dataCheckString: string): string {
  return crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');
}

export type TelegramUser = {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  allows_write_to_pm?: boolean;
};

/**
 * Проверяет подпись initData и возвращает распарсенные поля, включая user.
 * Бросает ошибку при невалидности.
 */
export function verifyAndParseInitData(initData: string, botToken: string): {
  user: TelegramUser | null;
  auth_date?: string;
  query_id?: string;
  raw: string;
  all: Record<string, string>;
} {
  const map = parseInitDataRaw(initData);
  const givenHash = map.get('hash') || '';
  if (!givenHash) {
    throw new Error('No hash in initData');
  }

  const dataCheckString = buildDataCheckString(map);
  const secretKey = makeSecretKey(botToken);
  const calcHash = sign(secretKey, dataCheckString);

  if (calcHash !== givenHash) {
    throw new Error('Invalid initData hash');
  }

  // Распарсим user, auth_date, query_id (если есть)
  const userStr = map.get('user') || '';
  let user: TelegramUser | null = null;
  try {
    user = userStr ? (JSON.parse(userStr) as TelegramUser) : null;
  } catch {
    user = null;
  }

  const all: Record<string, string> = {};
  for (const [k, v] of map.entries()) all[k] = v;

  return {
    user,
    auth_date: map.get('auth_date') || undefined,
    query_id: map.get('query_id') || undefined,
    raw: initData,
    all
  };
}
