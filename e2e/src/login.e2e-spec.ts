import { browser, by, element } from 'protractor';
import { navigateWithoutLoginTo, login } from './app.po';
import { waitForElementByString, setInputFieldValue } from '../helpers/element.helper';
import { BROWSER_WAIT_INTERVAL_SHORT, BROWSER_WAIT_INTERVAL_MEDIUM } from '../constants/constants.definitions';
import { getTranslation } from '../helpers/translate.helper';

// Tests /login
// The user should not be logged in initially
// An invalid login should not be accepted and display an error message
// A valid login should result in a menu being shown
describe('login with valid and invalid credentials', () => {
  beforeEach(() => {
    navigateWithoutLoginTo('login');
  });

  it('should display project name on login page', async () => {
    console.log('navigation complete.');
    expect(await element(by.css('#text-customer')).isPresent()).toBeTruthy();
    const myElement = await element(by.css('#text-customer')).getAttribute('textContent');
    expect(myElement).toBe('AquaVip Solutions');
  });

  it('should initially not be logged in and then login successfully on DB mock-user', async () => {
    expect(await element(by.css('app-home')).isPresent()).toBeFalsy();
    await login();
    await waitForElementByString('app-home', undefined, BROWSER_WAIT_INTERVAL_MEDIUM);
  });

  it('should show an error after invalid login credentials', async () => {
    await setInputFieldValue('#input-login-username', 'invalid_login', true);
    await setInputFieldValue('#input-login-password', 'invalid_login', true);
    await browser.element(by.id('button-login')).click();
    await waitForElementByString('.e-toast', 'Login failed', BROWSER_WAIT_INTERVAL_SHORT);
    await expect(
      element(by.cssContainingText('#button-login', getTranslation('LOGIN.BUTTON_TEXT').toUpperCase())).isPresent(),
    ).toBeTruthy();
  });

  it('should show profile information after logging in', async () => {
    await expect(element(by.css('div.profile')).isPresent()).toBeFalsy();
    await setInputFieldValue('#input-login-username', 'supervisor', true);
    await setInputFieldValue('#input-login-password', 'supervisor', true);
    await browser.element(by.id('button-login')).click();
    await waitForElementByString('div.profile');
  });
});
