import { ProtractorExpectedConditions, protractor } from 'protractor';
import { getTranslation } from '../helpers/translate.helper';

/** We just need one of this. */
export const condition: ProtractorExpectedConditions = protractor.ExpectedConditions;

/** Default timeout for Jasmine tests to set in beforeAll. */
export const DEFAULT_TIMEOUT_INTERVAL = 180000;

//#region default values

export const CLOSE_BUTTON_TEXT = getTranslation('GLOBAL.CLOSE_BUTTON_TEXT');
export const CANCEL_BTN_TEXT = getTranslation('GLOBAL.CANCEL_BUTTON_TEXT');
export const SAVE_BTN_TEXT = getTranslation('GLOBAL.SAVE_BUTTON_TEXT');
export const EDIT_BTN_TEXT = getTranslation('GLOBAL.EDIT_BUTTON_TEXT');
export const CREATE_BTN_TEXT = getTranslation('GLOBAL.CREATE_BUTTON_TEXT');
export const YES_BTN_TEXT = getTranslation('GLOBAL.YES_BUTTON_TEXT');

export const REQUIRED_FIELD_ERRORMSG = getTranslation('GLOBAL.REQUIRED_FIELD_TEXT');

export const CSS_SEL_ANY_CANCELBTN = 'button[class*="cancel"]';

/** Prefix for e2e-test-usernames. */
export const USERNAME_PREFIX = '0A_E2E_';

/** A valid default password. */
export const VALID_PASSWORD = '12345aA!';

/** Username token for i18n strings. */
export const USERNAME_TOKEN = '{{loginName}}'; // new RegExp('{{.*Name}}', 'gm');

/** Read the modifier from process.env - it's set in protractor.conf's onPrepare. */
const waitIntervalModifier: number = +process.env.BROWSER_TIMEOUT_MULTIPLIER || 1;

/** Browser wait intervals - set these higher when running tests in CI. */
export const BROWSER_WAIT_INTERVAL_SHORT = 2000 * waitIntervalModifier;
export const BROWSER_WAIT_INTERVAL_MEDIUM = 5000 * waitIntervalModifier;
export const BROWSER_WAIT_INTERVAL_LONG = 15000 * waitIntervalModifier;

//#endregion

//#region css classes for edit and delete buttons

/** Class of delete icon button. */
export const ICONCLASS_DELETE = '.icon-cross-01';

/** Class of edit icon button. */
export const ICONCLASS_EDIT = '.icon-edit-01';

//#endregion

//#region  UTF-8 glyphs for button values

/*
 * THESE GLYPHS ARE NOT IDENTICAL
 */

/** Content of .icon-edit-01 :before: "\e624". */
export const UTF8_GLYPH_EDIT = '""';

/** Content of .icon-cross-01 :before: "\e60f". */
export const UTF8_GLYPH_DELETE = '""';

//#endregion
