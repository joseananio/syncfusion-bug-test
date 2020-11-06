import { readFileSync } from 'fs';
import { logger } from '../constants/logger';
import { USERNAME_TOKEN } from '../constants/constants.definitions';

const localisationDir = `${__dirname}/../../src/assets/i18n/`;

const de = getJsonObject(`${localisationDir}de.json`);
const en = getJsonObject(`${localisationDir}en.json`);

function getJsonObject(filePath: string) {
  const data = readFileSync(filePath);
  return JSON.parse(JSON.stringify(JSON.parse(data.toString())).replace(/""/g, '" "'));
}

/**
 * Helper method to get a translated string.
 *
 * @param key Key of string, example: USERS.PROFILE_REQUIRED_FIELD.
 * @param locale Locale to get the string in, will default to en if none set.
 * @returns The value as read from i18n json files. Emtpy string if none could be read.
 */
export function getTranslation(key: string, locale = 'en'): string {
  try {
    let currentTranslation = 'de' === locale ? de : en;
    key.split('.').forEach((partial) => {
      currentTranslation = currentTranslation[partial];
    });
    return currentTranslation;
  } catch (e) {
    logger.warn(`translate.helper.ts: Exception when trying to resolve ${key}`);
  }
  return key;
}

/**
 * Helper method to get a translated string.
 *
 * @param key Key of string, example: USERS.PROFILE_REQUIRED_FIELD.
 * @param username Value to substitute USERNAME_TOKEN with.
 * @param locale Locale to get the string in, will default to en if none set.
 * @returns The value as read from i18n json files. Emtpy string if none could be read.
 */
export function getTranslationWithUsername(key: string, username: string, locale = 'en'): string {
  return getTranslation(key, locale).replace(USERNAME_TOKEN, username);
}
