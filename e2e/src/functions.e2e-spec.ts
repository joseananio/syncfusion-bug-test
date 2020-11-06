import {
  browser, by, element, protractor, ElementFinder,
} from 'protractor';
import { BROWSER_WAIT_INTERVAL_MEDIUM } from '../constants/constants.definitions';
import { navigateTo } from './app.po';
import { FunctionsManagement } from './functions.e2e.po';
import { logger } from '../constants/logger';
import { setInputFieldValue } from '../helpers/element.helper';

xdescribe('functions', () => {
  let functionsManagement: FunctionsManagement;

  const FORM_NAME_STEP1 = '#form-function-step-one';
  const FORM_NAME_STEP2 = '#form-function-device';
  const FORM_NAME_STEP3 = '#form-function-detail';

  const BUTTON_BACK = '#back';
  const BUTTON_NEXT = '#next';
  const BUTTON_SAVE = '#save';

  beforeAll(async () => {
    functionsManagement = new FunctionsManagement();
    // Make sure, the archive section is populated with at least one item.
  });

  beforeEach(async () => navigateTo('functions'));

  function checkElementPresence(selectorClass, expectedClass) {
    const el = element(by.css(selectorClass));
    const shouldBePresent = selectorClass === expectedClass;
    return el.isPresent()
      .then((isPresent) => (shouldBePresent ? expect(isPresent).toBeTruthy() : expect(isPresent).toBeFalsy()));
  }
  function checkFormStep(expectedFormStage) {
    return checkElementPresence(FORM_NAME_STEP1, expectedFormStage)
      .then(() => checkElementPresence(FORM_NAME_STEP2, expectedFormStage))
      .then(() => checkElementPresence(FORM_NAME_STEP3, expectedFormStage));
  }

  function checkButtonState(buttonSelector, shouldPresent, shouldDisable) {
    const button = element(by.css(buttonSelector));
    return button.isPresent()
      .then((isPresent) => (shouldPresent ? expect(isPresent).toBeTruthy() : expect(isPresent).toBeFalsy()))
      .then(() => button.getAttribute('disabled'))
      .then((isDisabled) => (shouldDisable ? expect(isDisabled).toBeTruthy() : expect(isDisabled).toBeFalsy()));
  }

  it('should spawn a modal dialog clicking on "New Function" button', async () => {
    logger.info('    functions/index: it should spawn a modal dialog clicking on "New Function" button');

    expect(await element(by.css('#table-function-grid')).isPresent()).toBeTruthy();
    expect(await element(by.css('#modal-function-add')).isPresent()).toBeFalsy();
    await element(by.css('#btn-function-add')).click();
    expect(await element(by.css('#modal-function-add')).isPresent()).toBeTruthy();
  });

  it('should be possible to add a new function', async () => {
    logger.info('    functions/index: it should be possible to add a new function');
    const expectedCondition = protractor.ExpectedConditions;
    const testFunction = functionsManagement.generateFunctionName();

    expect(await element(by.css('#table-function-grid')).isPresent()).toBeTruthy();
    expect(await element(by.css('#modal-function-add')).isPresent()).toBeFalsy();
    await element(by.css('#btn-function-add')).click();

    expect(await element(by.css('#modal-function-add')).isPresent()).toBeTruthy();

    await checkFormStep(FORM_NAME_STEP1);

    // basic view
    await checkButtonState(BUTTON_BACK, true, true);
    await checkButtonState(BUTTON_NEXT, true, true);
    await checkButtonState(BUTTON_SAVE, true, true);

    await setInputFieldValue('#input-func-name', testFunction);

    const functionTypes = element.all(by.repeater('type in functionTypes'));
    console.log('gooooooooooooooo', await functionTypes.count());
    await element(by.id('funct-type-radio')).all(by.tagName('label')).get(0).click();

    await checkButtonState(BUTTON_NEXT, true, false);
    await element(by.css(BUTTON_NEXT)).click();

    await checkFormStep(FORM_NAME_STEP2);

    // await browser.sleep(16000);

    // basic view
    await checkButtonState(BUTTON_BACK, true, false);
    await checkButtonState(BUTTON_NEXT, true, true);
    await checkButtonState(BUTTON_SAVE, true, true);

    // Wait until project tree has loaded, then click first node
    await browser.sleep(BROWSER_WAIT_INTERVAL_MEDIUM);

    await element.all(by.css('.e-checkbox-wrapper')).get(0).click();
    await browser.sleep(16000);

    await checkButtonState(BUTTON_NEXT, true, false);
    await element(by.css(BUTTON_NEXT)).click();

    await checkFormStep(FORM_NAME_STEP3);

    // basic view
    await checkButtonState(BUTTON_BACK, true, false);
    await checkButtonState(BUTTON_NEXT, true, true);
    await checkButtonState(BUTTON_SAVE, true, false);

    const saveButton = element(by.css(BUTTON_SAVE));
    await saveButton.click();

    await browser.wait(expectedCondition.invisibilityOf(saveButton), 3000).then(async () => {
      console.log('Done waiting for dialog closing');
      // This previsously missed an afterclosed event of the feedback dialog. Pls fix aftercloses if failing
      await findPageWithFunction(testFunction);
      expect(await element(by.cssContainingText('.e-rowcell', testFunction)).isPresent()).toBeTruthy(
        'because the new function should now be listed in the table',
      );
      await functionsManagement.deleteFunction(testFunction);
    });
  });

  it('should be possible to delete an existing function', async () => {
    logger.info('    functions/index: it should be possible to delete an existing function');

    expect(element(by.css('#table-function-grid')).isPresent()).toBeTruthy();
    expect(element(by.id('action-header')).isPresent()).toBeTruthy();
    await browser.waitForAngular();

    const testFunction = await functionsManagement.createFunction();

    const functionRow: ElementFinder = element(by.cssContainingText('.e-row', testFunction));

    const confirmModal = element(by.id('modal-question-dialog'));
    expect(confirmModal.isPresent()).toBeFalsy();

    await functionRow.all(by.deepCss('.icon-cross-01')).get(0).click();

    expect(confirmModal.isPresent()).toBeTruthy();
    await element(by.css('#btn-question-dialog-confirm')).click();
    await browser.waitForAngular();

    browser.wait(protractor.ExpectedConditions.invisibilityOf(confirmModal), 5000).then(() => {
      findPageWithFunction(testFunction);
      expect(element(by.cssContainingText('.e-row', testFunction)).isPresent()).toBeFalsy(
        'because the function should now be removed from the list',
      );
    });
  });

  it('should be possible to disable an enabled function', async () => {
    logger.info('    functions/index: it should be possible to disable an enabled function');

    expect(element(by.css('#table-function-grid')).isPresent()).toBeTruthy();
    await browser.waitForAngular();

    const testFunction = await functionsManagement.createFunction();
    const functionRow: ElementFinder = element(by.cssContainingText('.e-row', testFunction));

    const toggleButton: ElementFinder = functionRow.all(by.deepCss('.toggle-button')).get(0);

    await toggleButton.click();
    await browser.waitForAngular();
    expect(functionRow.all(by.tagName('input')).get(0).getAttribute('checked')).toBeFalsy();
  });

  it('should be possible to enable a disabled function', async () => {
    logger.info('    functions/index: it should be possible to enable a disabled function');

    expect(element(by.css('#table-function-grid')).isPresent()).toBeTruthy();
    await browser.waitForAngular();

    const testFunction = await functionsManagement.createFunction();
    const functionRow: ElementFinder = element(by.cssContainingText('.e-row', testFunction));

    const toggleButton: ElementFinder = functionRow.all(by.deepCss('.toggle-button')).get(0);
    const btnInputChecked = functionRow.all(by.tagName('input')).get(0).getAttribute('checked');
    expect(btnInputChecked).toBeTruthy();

    await toggleButton.click();
    await browser.waitForAngular();
    expect(functionRow.all(by.tagName('input')).get(0).getAttribute('checked')).toBeFalsy();

    await toggleButton.click();
    await browser.waitForAngular();
    expect(functionRow.all(by.tagName('input')).get(0).getAttribute('checked')).toBeTruthy();
  });
});

async function findPageWithFunction(testFunction) {
  while (true) {
    const nextPageButton = element(by.css('.e-nextpage'));
    element(by.cssContainingText('.e-rowcell', testFunction));
    const itemFound = await element(by.cssContainingText('.e-rowcell', testFunction)).isPresent();
    const isLastPage = !(await nextPageButton.isPresent());
    if (!itemFound && !isLastPage) {
      await nextPageButton.click();
    } else {
      break;
    }
  }
}
