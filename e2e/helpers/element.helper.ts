import {
  element, browser, by, ElementFinder, protractor, $$, ElementArrayFinder,
} from 'protractor';
import {
  BROWSER_WAIT_INTERVAL_LONG,
  BROWSER_WAIT_INTERVAL_MEDIUM,
  BROWSER_WAIT_INTERVAL_SHORT,
  CSS_SEL_ANY_CANCELBTN,
  CANCEL_BTN_TEXT,
} from '../constants/constants.definitions';
import { logger } from '../constants/logger';

const condition = protractor.ExpectedConditions;

export function absenceOf(el: ElementFinder) {
  return condition.not(condition.presenceOf(el));
}

export function getRandomString(length: number) {
  return `${(Math.random() + 1).toString(Math.max(length + 1, 36)).substr(2, length + 1)}`;
}
export async function trySetInputFieldValue(
  locator: string | ElementFinder | ElementArrayFinder | Promise<any>,
  value = '',
  forceOverwrite = false,
  expectedErrorMessage?: string,
) {
  const el: ElementFinder = await resolveElement(locator);
  if (!el || !(await el.isPresent())) {
    return Promise.resolve();
  }
  return setInputFieldValue(el, value, forceOverwrite, expectedErrorMessage);
}

/**
 * A function to set the value of an input field.
 *
 * @param locator Input field.
 * @param value Text to enter.
 * @param forceOverwrite It not set and field already has value, function will do nothing.
 * @returns The resolved promise.
 */
export async function setInputFieldValue(
  locator: string | ElementFinder | ElementArrayFinder | Promise<any>,
  value = '',
  forceOverwrite = false,
  expectedErrorMessage?: string,
) {
  // debug output
  const withOverwrite = forceOverwrite ? ', forcing overwrite' : '';
  const withErrorMsg = expectedErrorMessage ? `, expecting validation error '${expectedErrorMessage}'` : '';
  const debugString = `input field ${await toString(locator)} => '${value}'${withOverwrite}${withErrorMsg}`;
  logger.debug(`setting value of ${debugString}`);
  try {
    const el = await resolveElement(locator);
    if (!(await el.isPresent())) {
      return makePromise();
    }
    await waitForElement(el);
    await el.click();
    await el.clear();
    if (value === '') {
      await el.sendKeys(' ');
      await el.sendKeys(protractor.Key.BACK_SPACE);
    } else {
      await el.sendKeys(value);
    }
    await removeFocusFrom(el);
    return expectFormValidationError(expectedErrorMessage);
  } catch (err) {
    logger.error('error in setInputFieldValue: %o', err);
    return Promise.reject(err);
  }
}

export async function removeFocusFrom(elem: ElementFinder) {
  if (!elem) {
    return Promise.reject(new Error('couldn\'t remove focus, no element given'));
  }
  return browser.executeScript('arguments[0].blur();', elem.getWebElement());
}

export async function expectFormValidationError(msg?: string) {
  if (!msg) {
    return Promise.resolve();
  }
  if (msg === '') {
    return expect((await $$('.alert')).length).toBe(0, 'because no error messages should be present');
  }
  const el = element(by.cssContainingText('.alert', msg));
  return browser.wait(condition.presenceOf(el), BROWSER_WAIT_INTERVAL_LONG, `because a form validation message is expected: '${msg}'`);
}

async function resolveElement(locator: string | ElementFinder | ElementArrayFinder | Promise<any>): Promise<ElementFinder> {
  if ('string' === typeof locator) {
    return Promise.resolve(element(by.css(<string>locator)));
  }
  if (locator instanceof Promise) {
    return resolveElement(await (locator as Promise<any>));
  }
  if (locator instanceof ElementFinder) {
    return Promise.resolve(locator);
  }
  if (locator instanceof ElementArrayFinder) {
    return Promise.resolve((<ElementArrayFinder>locator).first());
  }
  return Promise.reject(new Error(`resolveElement: Please implement handling for type ${typeof locator}`));
}

/**
 * A helper function to _really_ click an element. Background: Occasionally, a single click will be swallowed.
 *
 * @param locator The element to click.
 * @param sleepInterval Optional: Sleep a number of ms.
 * @returns A promise.
 */
export async function clickButton(locator: string | ElementFinder | ElementArrayFinder | Promise<any>, sleepInterval = 0) {
  let debug = locator.toString();
  // click it once
  return resolveElement(locator).then((elem) => waitForElement(elem).then(() => {
    debug = elem.locator().toString();
    // then try clicking it again, just in case
    return elem.click().then(() => browser.sleep(sleepInterval))
      .catch((ex: any) => {
        logger.warn(ex);
        return Promise.resolve(`${debug} clicked`);
      });
  }))
    .catch((ex: any) => {
      logger.error(ex);
      return Promise.reject(new Error(`couldn't click ${debug}`));
    });
}

async function toString(locator: string | ElementFinder | ElementArrayFinder | Promise<any>) {
  if ('string' === typeof locator) {
    return Promise.resolve(locator);
  }
  const elem = await resolveElement(locator);
  const html = await elem.getAttribute('outerHTML');
  try {
    if (html.startsWith('<input')) {
      const value = await getInputElementValue(elem);
      return Promise.resolve(`<input#${await elem.getAttribute('id')}> with value [${value}]`);
    }
    return Promise.resolve(html);
  } catch (err) {
    logger.error('Exception in toString: %o', err);
  }
  return Promise.resolve('Exception in toString');
}

export async function assertElementIsPresent(selector: string, text: string) {
  expect(await element(by.cssContainingText(selector, text)).isPresent()).toBeTruthy(
    `because an element ${selector} containing ${text} should be present`,
  );
}

export async function clickToast(expectedText: string) {
  const el = element(by.cssContainingText('.e-toast', expectedText));
  await browser.wait(condition.presenceOf(el));
  await clickButton(await el.element(by.css('.e-toast-close-icon')));
  return browser.wait(absenceOf(el));
}

/**
 * Helper function to get the value from an input element.
 *
 * @param locator
 * @param find Optional: As workaround for comparison, offer a string replace on the return value.
 * @param replace Optional: As workaround for comparison, offer a string replace on the return value.
 * @returns A promise containing the string.
 */
export async function getInputElementValue(
  locator: string | ElementFinder | ElementArrayFinder | Promise<any>,
  find = '',
  replace = '',
) {
  let input = await resolveElement(locator);
  if (!input || !(await input.isPresent())) {
    return Promise.reject(new Error('input not found on current page'));
  }
  let inputClass: string = input ? await input.getAttribute('class') : '';
  let ret = await input.getAttribute('ng-reflect-model');
  if (ret && ret !== '') {
    return Promise.resolve(ret.replace(find, replace));
  }
  if (!inputClass.match(/\Winput\W/)) {
    try {
      input = input.element(by.css('input'));
      inputClass = await input.getAttribute('class');
    } catch (err) {
      return Promise.reject(new Error(`no input present for ${inputClass}`));
    }
  }
  ret = await input.getAttribute('ng-reflect-model');
  if (!ret || ret === '') {
    ret = await input.getAttribute('value');
  }

  return Promise.resolve(ret.replace(find, replace));
}

export async function assertInputElementValueString(locator: string, expected: string | number) {
  const input = element(by.css(locator));
  const debugOut = locator;
  try {
    await waitForElement(input, BROWSER_WAIT_INTERVAL_SHORT, `because css element ${debugOut} should exist`);
  } catch (err) {
    return Promise.reject(new Error(`because css element ${debugOut} should exist`));
  }

  let actual: any = '';
  const argumentType = typeof expected;
  if ('string' === argumentType) {
    actual = await getInputElementValue(input);
    actual = actual || '';
  } else if ('number' === argumentType) {
    actual = await input.getAttribute('textLength');
    actual = actual || 0;
  } else {
    actual = typeof expected;
  }

  logger.debug(`DOM element "${debugOut}" should have value [${expected}], (was [${actual}])`);
  return expect(actual === expected).toBeTruthy(
    `because DOM element "${debugOut}" should have value [${expected}], but was [${actual}]`,
  );
}
/**
 * A helper function to find an input element.
 *
 * @param locator Selector to find the element.
 * @param expected Implemented so far are string and number. </br>
 * string: Compares content of input field with given text </br>
 * numeric: Compares length of input field's value with given text (for password fields etc.).
 */
export async function assertInputElementValue(locator: string | ElementFinder | ElementArrayFinder | Promise<any>, expected: any) {
  const input = await resolveElement(locator);
  const debugOut = await toString(input);
  logger.silly(`assertInputElementValue: comparing value of "${debugOut}" with [${expected}]`);
  try {
    await waitForElement(input, BROWSER_WAIT_INTERVAL_SHORT, `because css element ${debugOut} should exist`);
  } catch (err) {
    return Promise.reject(new Error(`because css element ${debugOut} should exist`));
  }

  let actual: any = '';
  const argumentType = typeof expected;
  if ('string' === argumentType) {
    actual = await input.getAttribute('value');
  } else if ('number' === argumentType) {
    actual = await input.getAttribute('textLength');
  } else {
    actual = typeof expected;
  }
  if (!actual) {
    actual = ('string' === argumentType ? '' : 0);
  }
  logger.debug(`DOM element "${debugOut}" should have value [${expected}], (was [${actual}])`);
  if (actual === expected) {
    return Promise.resolve();
  }
  return Promise.reject(new Error(`because DOM element "${debugOut}" should have value [${expected}], but was [${actual}]`));
}

export async function findElementByExactText(selector: string, exactText: string) {
  const els = await findElementsByExactText(selector, exactText);
  expect(els.length).toBe(1, `$because exactly one ${selector} with text ${exactText} should exist`);
  return Promise.resolve(els[0]);
}

export async function findElementsByExactText(selector: string, exactText: string) {
  return element.all(by.css(selector)).filter((elem) => elem.getText().then((text) => text === exactText));
}

/**
 * A helper method to check the content of an element's pseudoclass (for viega-icon-button).
 *
 * @param expected The value that the css element is supposed to have.
 * @param cssSelector The css selector of the element for document.querySelector.
 * @param psclassSelector Pseudoclass selector (:before).
 * @returns True, if the conditions are met, otherwise false.
 */
export async function checkPseudoclassContent(expected: string, cssSelector: string, psclassSelector = '') {
  let ret = true;
  try {
    // check that it exists
    await expect($$(cssSelector).isPresent()).toBeTruthy(`because css element with selector ${cssSelector} should be present`);

    // if it exists, check that it has the right text string. In case of buttons, these are defined in ../constants/strings.definitions.ts
    const data = await browser.executeScript(
      `return window.getComputedStyle(document.querySelector('${cssSelector}'), '${psclassSelector}').content`,
    );

    expect(data === expected).toBeTruthy(`${expected} was expected, but ${cssSelector} ${psclassSelector} has value ${data}`);
  } catch (e) {
    logger.error(e);
    ret = false;
  }
  return ret;
}

/**
 * Helper function to find out if an element is currently stale.
 *
 * @param elem The web element.
 * @returns True or false.
 */
export async function isElementStale(elem: ElementFinder): Promise<boolean> {
  return browser
    .wait(condition.stalenessOf(elem), 10)
    .then(() => true)
    .catch(() => false);
}

// TODO(ewa.baumgarten): Please fix this - this is very likely causing actual issues.
/* eslint-disable no-loop-func */

/**
 * Helper function to browse through paginated data until a cell text is present.
 *
 * @param findme The text that should be found, can be a partial match.
 * @returns An exception if no such cell exists.
 */
export async function findPageWithCellText(findme: string | RegExp): Promise<ElementFinder> {
  await browser.waitForAngular();

  const elem = element(by.cssContainingText('.e-rowcell', findme));
  try {
    await browser.wait(condition.presenceOf(elem), BROWSER_WAIT_INTERVAL_MEDIUM, 'trying to find a rowcell');
    return Promise.resolve(elem);
  } catch (err) {
    if (await element.all(by.css('.e-nextpage')).count() === 0) {
      return Promise.reject(new Error(`End of pagination reached. not found: ${findme}`));
    }
    await element.all(by.css('.e-nextpage')).first().click();
    return findPageWithCellText(findme);
  }
}

/* eslint-enable no-loop-func */

export async function waitForCssClass(el: ElementFinder, desiredClass: string) {
  return async function doWaitForCssClass() {
    const classValue = await el.getAttribute('class');
    return classValue && classValue.indexOf(desiredClass) >= 0;
  };
}
export async function waitForCssAttribute(el: ElementFinder, desiredAttribute: string, desiredValue) {
  return async function doWaitForCssAttribute() {
    const attributeValue = await el.getAttribute(desiredAttribute);
    return attributeValue && attributeValue.indexOf(desiredValue) >= 0;
  };
}

export async function makePromise(err?: any) {
  const toast = element(by.css('.e-toast'));
  const body = element(by.css('body'));
  const currentUrl = await browser.getCurrentUrl();
  const hasToast = await toast.isPresent();
  let errorMsg = hasToast ? await toast.getText() : '';

  if (errorMsg && errorMsg.trim() !== '') {
    errorMsg = `an error occurred at url ${currentUrl}: (toast) ${errorMsg}`;
  } else {
    errorMsg = `an error occurred at url ${currentUrl}:\n${formatHtml(await body.getAttribute('innerHTML'), true)}`;
  }

  console.log(errorMsg);
  return Promise.reject(err || errorMsg);
}

/**
 * Helper function to wait for the existence of a certain modal and close it.
 *
 * @param modalSelector Css selector to find the modal by.
 * @param modalText Text to be present in the modal.
 * @param errorMsg Error message to display if modal can't be found.
 * @param btnSelector Css selector to find the expected button.
 * @returns
 */
export async function waitForModalAndClose(
  modalSelector = '*[aria-modal="true"]',
  modalText = '',
  errorMsg = 'because a modal {} should be shown',
  btnSelector = 'button[class*="primary"].type-default',
  waitInterval: number = BROWSER_WAIT_INTERVAL_SHORT,
) {
  const eMsg = errorMsg.replace('{}', `${modalText && 0 < modalText.length ? `with message '${modalText}' ` : ''}`);
  const dialogue = await element(by.cssContainingText(modalSelector, modalText));
  await browser.wait(condition.presenceOf(dialogue), waitInterval, errorMsg);

  // if button selector does not contain a space: Make sure to prefix modal selector, so it's finding the right one
  // (important in case of error/confirmation dialogue on top of other modal)
  const buttonSelector = btnSelector.includes(' ') ? btnSelector : `${modalSelector} ${btnSelector}`;
  const btns = await dialogue.all(by.css(buttonSelector));
  if (btns.length === 0) {
    return Promise.reject(new Error(`No button with selector ${buttonSelector} found`));
  }
  const btn = btns[btns.length - 1]; // === 1 ? await element(by.css(buttonSelector)) : btns[0];
  await clickButton(btn);
  return browser.wait(condition.not(condition.elementToBeClickable(btn)), waitInterval, eMsg.replace('shown', 'hidden'));
}

/**
 * A helper function to click the coordinates of an element.
 *
 * @param el The element in question.
 * @param relativeTo Parent element relative to which the cooridnates will be resolved.
 * @returns
 */
export async function clickOnElementCoordinates(el: ElementFinder, relativeTo = 'body', skipScroll = false) {
  if (!el) {
    return Promise.reject(new Error('no element was given'));
  }
  if (!skipScroll) {
    await browser.executeScript('arguments[0].scrollIntoView();', el.getWebElement());
  }
  logger.silly('getting element position');
  const position = await el.getLocation();
  logger.silly('getting relative element');
  const canvas = await element(by.css(relativeTo));
  logger.silly('clicking');
  return browser.actions().mouseMove(canvas, { x: position.x, y: position.y }).click().perform();
}

export async function waitForModalAndCancel(
  modalSelector = '*[aria-modal="true"]',
  modalText = '',
  errorMsg = '',
  btnSelector: string = CSS_SEL_ANY_CANCELBTN,
) {
  return waitForModalAndClose(modalSelector, modalText, errorMsg, btnSelector);
}

export async function waitForElementByString(
  cssIdentifier: string,
  containingText = '',
  interval: number = BROWSER_WAIT_INTERVAL_MEDIUM,
  errorMsg?: string,
): Promise<ElementFinder> {
  if (!cssIdentifier || '' === cssIdentifier) {
    return Promise.resolve();
  }
  const containingTextMsg = containingText && containingText.length > 0 ? ` with text '${containingText}'` : '';
  const outputMsg = errorMsg || `because DOM element '${cssIdentifier}'${containingTextMsg} should be present`;
  logger.silly(`waiting for DOM element '${cssIdentifier}'${containingTextMsg}`);
  const el = containingText.length > 0 ? element(by.cssContainingText(cssIdentifier, containingText)) : element(by.css(cssIdentifier));
  return waitForElement(el, interval, outputMsg);
}

export async function waitForElement(
  el: ElementFinder,
  interval: number = BROWSER_WAIT_INTERVAL_MEDIUM,
  errorMsg?: string,
): Promise<ElementFinder> {
  if (await el.isPresent()) {
    return Promise.resolve();
  }

  try {
    await browser.wait(condition.visibilityOf(el), interval, errorMsg);
    return Promise.resolve(el);
  } catch (err) {
    return makePromise();
  }
}
function waitForText(elem: ElementFinder, text: string) {
  return async () => await getInputElementValue(elem) === text;
}

export async function waitForTextInInput(
  cssIdentifier: string,
  containingText = '',
  interval: number = BROWSER_WAIT_INTERVAL_MEDIUM,
) {
  return browser.wait(waitForText(element(by.css(cssIdentifier)), containingText),
    interval,
    `because input field should have value ${containingText}`);
}

export async function closeAnyModal() {
  try {
    const el = element(by.cssContainingText('button', CANCEL_BTN_TEXT));
    if (await el.isPresent()) {
      await clickButton(el);
      await browser.wait(absenceOf(element(by.css('app-modal-dialog'))), BROWSER_WAIT_INTERVAL_SHORT);
      return Promise.resolve();
    }
  } catch (e) {
    // don't click it then
  }
  return Promise.resolve();
}

const tab = ' ';
function formatHtml(html, removeComments = true) {
  let result = '';
  let indent = '';

  html.trim().split(/>\s*</).forEach((el) => {
    if (el.match(/^\/\w/)) {
      indent = indent.substring(tab.length);
    }
    result = `${result}${indent}<${el.trim()}>\r\n`;

    if (el.match(/^<?\w[^>]*[^/]$/)) {
      indent = `${indent}${tab}`;
    }
  });
  const ret = result.substring(1, result.length - 3);
  if (!removeComments) {
    return ret;
  }
  return ret
    .replace(/(<!--.*?-->)|(<!--[\S\s]+?-->)|(<!--[\S\s]*?$)/g, '') // fix up spacing
    .replace(/(?<=<\/app-root>)([\r\n]\s+<script.+[\r\n]\s+<\/script>)+/g, '') // strip scripts at end of page
    .replace(/<header.*class="mobile.*>([\r\n\s]+((?!<\/header>).)*)+([\r\n\s]+<\/header>)/g, '') // strip mobile header
    .replace(/<aside.*class="mobile.*>([\r\n\s]+((?!<\/header>).)*)+([\r\n\s]+<\/aside>)/g, '') // strip mobile aside
    .replace(/(?:\n(?:[^\S\n]*(?=\n))?){2,}/g, '\r\n'); // fix up empty lines
}
