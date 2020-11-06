import {
  ElementFinder, browser, element, by,
} from 'protractor';
import { condition, BROWSER_WAIT_INTERVAL_SHORT } from '../constants/constants.definitions';
import { logger } from '../constants/logger';
import { clickOnElementCoordinates, isElementStale, waitForCssAttribute } from './element.helper';

let currentLabelPath = '';
export function getCurrentLabelPath() {
  return currentLabelPath;
}

export async function findLabelRecursively(currentElement, rowLabels: string[]): Promise<ElementFinder> {
  /*
    * If called without an element: Reset to empty
    */
  currentLabelPath = currentElement ? currentLabelPath : '';
  if (rowLabels.length === 0) {
    if (currentElement) {
      try {
        await browser.wait(condition.visibilityOf(currentElement), BROWSER_WAIT_INTERVAL_SHORT);
        return Promise.resolve(currentElement);
      } catch (err) {
        console.log(err);
      }
    }
    return Promise.reject(new Error(`No labels left, no element was found. Current path: ${currentElement ? currentLabelPath : ''}`));
  }
  const labels = Object.assign([], rowLabels);
  const rowLabel = labels.shift();

  if (!currentElement) {
    currentLabelPath = rowLabel;
    const lbl = await element(by.cssContainingText('.e-text-content', rowLabel));
    return findLabelRecursively(lbl, labels);
  }

  const parent = await currentElement.element(by.xpath('..'));
  const currentLabel = await parent.element(by.cssContainingText('.e-text-content', rowLabel));

  try {
    currentLabelPath = `${currentLabelPath}/${rowLabel}`;
    return findLabelRecursively(currentLabel, labels);
  } catch (err) {
    console.log(err);
  }

  // return Promise.resolve(currentElement);
  return Promise.reject(new Error(`${currentLabelPath}: ${rowLabel} not found`));
}

export async function clickRowByLabel(rowLabels: string[], fromReload = false) {
  if (rowLabels.length === 0) {
    return Promise.reject(new Error('no labels were passed'));
  }

  const currentLabel: ElementFinder = await findLabelRecursively(undefined, rowLabels);
  if (!currentLabel || !(await currentLabel.isPresent())) {
    return Promise.reject(new Error(`${rowLabels.join('/')} not found`));
  }
  const labelText: string = await currentLabel.getText();
  const expected: string = rowLabels[rowLabels.length - 1];
  if (!labelText.includes(expected)) {
    return Promise.reject(new Error(`label expected: ${expected}, but was ${labelText}`));
  }

  if ((await isElementStale(currentLabel)) && !fromReload) {
    await browser.refresh();
    return clickRowByLabel(rowLabels, true);
  }

  logger.silly(`clicking '${rowLabels.join('/')}'`);
  await clickOnElementCoordinates(currentLabel, undefined, true);

  return browser.wait(
    waitForCssAttribute(await currentLabel.element(by.xpath('..')), 'aria-selected', 'true'),
    BROWSER_WAIT_INTERVAL_SHORT,
    `because parent element of ${currentLabel} should be 'aria-selected=true'`,
  );
}
