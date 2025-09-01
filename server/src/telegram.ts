import { validate } from '@telegram-apps/init-data-node';

/**
 * Verify the authenticity of the init data provided by the
 * Telegram WebApp. This function throws an error if the data is
 * invalid or the HMAC doesn't match. It relies on the
 * `validate` helper from the `@telegram-apps/init-data-node` package
 * provided by the Telegram Mini Apps team.
 *
 * @param initData The raw initData string received from the client.
 * @param botToken The Telegram bot token used to compute the hash.
 * @returns Parsed init data containing user and other context fields.
 */
export function verifyInitData(initData: string, botToken: string) {
  const parsed = validate(initData, botToken);
  return parsed;
}