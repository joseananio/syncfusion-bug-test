import { setInputFieldValue, getRandomString } from './element.helper';
import { VALID_PASSWORD, USERNAME_PREFIX } from '../constants/constants.definitions';

/**
 * Types data for a valid user.
 */
export async function typeValidUser(): Promise<string> {
  const username = `${USERNAME_PREFIX}${getRandomString(4)}`;

  await setInputFieldValue('input[name="firstname"]', 'Valid');
  await setInputFieldValue('#input-user-add-lastname', 'User');
  await setInputFieldValue('#input-user-add-mail', `${username}@mail.com`);
  await setInputFieldValue('#input-user-add-username', username);
  await setInputFieldValue('#input-user-add-password', VALID_PASSWORD);
  await setInputFieldValue('#input-user-add-password-retype', VALID_PASSWORD);

  return Promise.resolve(username);
}
