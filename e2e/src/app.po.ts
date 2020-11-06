import {
  browser, by, element, protractor,
} from 'protractor';
import { BROWSER_WAIT_INTERVAL_MEDIUM, BROWSER_WAIT_INTERVAL_LONG, BROWSER_WAIT_INTERVAL_SHORT } from '../constants/constants.definitions';
import { logger } from '../constants/logger';
import {
  clickButton, makePromise, waitForElementByString, setInputFieldValue, waitForElement, absenceOf,
} from '../helpers/element.helper';

/**
 * Collection of refactored classes to use while e2e-testing.
 * Cheatsheet:
 *  - Get test with getAttribute('textContent') if text is inside a div
 *  - Check if element exists: expect(element(by.css('#someId')).isPresent()).toBeTruthy();
 *  - To resolve element attributes to variables, make 'it' async and use await, e.g.:
 *    const someVar: type = await element.all(by.css('.someClass')).count();
 *  - Check if element exists containing text:
 *    expect(element(by.cssContainingText('.someClass', some text')).isPresent()).toBeTruthy();
 *    .
 */
const condition = protractor.ExpectedConditions;

/**
 * Helper function that redirects to a location if it is not the current location.
 *
 * @param [location=''] Url to redirect to (relative).
 * @returns
 */
export async function redirectConditionally(location = '') {
  const destination = location.replace(/^\/|\/$/g, '');

  return browser.getCurrentUrl().then((currentUrl) => {
    // logger.debug('redirectConditionally: url is %s, should be %s', currentUrl, location);
    if (!currentUrl.toString().endsWith(destination)) {
      logger.silly('redirecting to %s', destination);
      return browser.get(location);
    }
    return Promise.resolve();
  })
    .catch((e) => browser.get(location))
    .then(() => waitForElementByString('.top-bar', undefined, BROWSER_WAIT_INTERVAL_MEDIUM));
}

export async function login(username = 'supervisor', password = 'supervisor') {
  // await possible redirect
  await browser.get('login');
  await browser.waitForAngular();
  const loginButton = element(by.css('#button-login'));

  try {
    await waitForElementByString('#input-login-username', undefined, BROWSER_WAIT_INTERVAL_SHORT);
    await waitForElement(loginButton, BROWSER_WAIT_INTERVAL_SHORT);
  } catch (err) {
    return Promise.reject(new Error('Error when trying to log in: username field isn\'t present, most likely BE crashed'));
  }

  try {
    await setInputFieldValue('#input-login-username', username, true);
    await setInputFieldValue('#input-login-password', password, true);
    await clickButton(loginButton);
    await browser.wait(absenceOf(loginButton));
    await browser.waitForAngular();
    return Promise.resolve();
  } catch (err) {
    return makePromise(err);
  }
  // return browser.get('login').then(() => {
  //   const loginButton = element(by.css('#button-login'));
  //   return browser.waitForAngular()
  //     .then(() => setInputFieldValue('#input-login-username', username, true))
  //     .then(() => setInputFieldValue('#input-login-password', password, true))
  //     .then(() => waitForElement(loginButton))
  //     .then(() => clickButton(loginButton))
  //     .then(() => browser.wait(absenceOf(loginButton)))
  //     .then(() => browser.waitForAngular())
  //     .catch((err) => {
  //       console.log('error in login: %o', err);
  //       return Promise.reject(err);
  //     });
  // });

  return browser.getCurrentUrl().then((currentUrl: string) => {
    if (!currentUrl.includes('localhost')) {
      return browser.get('/login')
        .then(() => login(username, password)).catch((err) => {
          console.log('error in login: %o', err);
          return Promise.reject();
        });
    }

    if (currentUrl.endsWith('login')) {
      logger.info('currently at login');
      return browser.waitForAngular()
        .then(() => setInputFieldValue('#input-login-username', username, true)
          .then(() => setInputFieldValue('#input-login-password', password, true))
          .then(() => clickButton(browser.element(by.id('button-login')))).catch((err) => {
            console.log('error in login: %o', err);
            return Promise.reject();
          }));
    }
    return browser.waitForAngular()
      .then(() => waitForElementByString('.top-bar'))
      .then(() => waitForElementByString('.profile', username, BROWSER_WAIT_INTERVAL_MEDIUM))
      .catch((err) => {
        console.log('error in login: %o', err);
        return Promise.reject();
      });
  });
}

// Do _not_ refactor to use await, this allows calling it synchronously
export async function navigateWithoutLoginTo(
  section = '',
  waitForCssSelector?: string,
  containingText?: string,
  hasLoggedIn = false,
) {
  // normalize slashes to /foo/bar
  const destination = `/${section.replace(/^\/|\/$/g, '')}`;
  try {
    await browser.get(destination);
  } catch (err) {
    if ((await browser.getCurrentUrl()).indexOf('login') > 0 && !hasLoggedIn) {
      await login();
      return (navigateWithoutLoginTo(section, waitForCssSelector, containingText, true));
    }
    console.error('navigateWithoutLoginTo:');
    return Promise.reject(err);
  }
  await browser.wait(condition.urlContains(destination), BROWSER_WAIT_INTERVAL_LONG);
  return waitForElementByString(waitForCssSelector, containingText);
}

// Do _not_ refactor to use await, this allows calling it synchronously
export async function navigateTo(section = '', waitForCssSelector?: string, containingText?: string) {
  return login()
    .then(() => navigateWithoutLoginTo(section, waitForCssSelector, containingText, true))
    .catch((err: any) => Promise.reject(err));
}

// Will navigate to an URL and then sort table by column title
export async function navigateAndSort(
  location = 'users',
  sortByTableColumn = '',
  sortOrder = 'Descending',
  skipLogin = false,
) {
  await (skipLogin ? navigateWithoutLoginTo(location) : navigateTo(location));
  if (0 < sortByTableColumn.length) {
    await browser.waitForAngular();
    const tableHeader = await waitForElementByString('.e-headercelldiv', sortByTableColumn, BROWSER_WAIT_INTERVAL_MEDIUM);
    const actualSort = await tableHeader.getAttribute('aria-sort');
    if (sortOrder !== actualSort) {
      return tableHeader.click();
    }
  }
  return Promise.resolve();
}
