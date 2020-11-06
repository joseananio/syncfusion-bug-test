import {
  browser, by, element, protractor,
} from 'protractor';
import { resolve } from 'path';
import { navigateTo } from './app.po';
import { getTranslation } from '../helpers/translate.helper';
import {
  waitForModalAndClose,
  waitForElementByString,
  clickButton,
  waitForCssAttribute,
  setInputFieldValue,
  getRandomString,
  absenceOf,
  assertInputElementValue,
  getInputElementValue,
  trySetInputFieldValue,
  clickToast,
} from '../helpers/element.helper';
import { logger } from '../constants/logger';
import {
  BROWSER_WAIT_INTERVAL_LONG,
  EDIT_BTN_TEXT,
  condition,
  CREATE_BTN_TEXT,
  BROWSER_WAIT_INTERVAL_SHORT,
  SAVE_BTN_TEXT,
  BROWSER_WAIT_INTERVAL_MEDIUM,
} from '../constants/constants.definitions';
import { clickRowByLabel, findLabelRecursively, getCurrentLabelPath } from '../helpers/projecttree.helper';

const projectStructure = getTranslation('PROJECT.STRUCTURE'); // Project Structure
const fileTab = getTranslation('PROJECT.FILE_TAB'); // Project File
const baseData = getTranslation('PROJECT.BASE_DATA'); // Base Data
const importProjectWarning = getTranslation('PROJECT.IMPORT_MODAL_TITLE'); // Warning - import project
// The project was imported successfully. The controller is now restarted.
const importSuccessful = getTranslation('PROJECT.IMPORT_DATA_SUCCESSFUL');
const removalWarning = getTranslation('PROJECT.REMOVE_DEVICE_ALERT'); // Are you sure you want to remove {{deviceName}}?
const errorDeviceNameTaken = getTranslation('PROJECT.DEVICE_NAME_TAKEN'); // Device name already assigned

describe('project', () => {
  /*
   * Due to an issue with websocket-js and protractor, this has to be disabled for the scope of this test.
   * See https://github.com/angular/protractor/issues/3489
   */
  browser.waitForAngularEnabled(false);

  async function importProjectData() {
    /*
     * Put into function, in case aria-level or something changes. Checks length of elements with selector by aria-level against expected.
     */
    function checkLength(ariaLevel: number, expected: number) {
      const cssSelector = `*[aria-level="${ariaLevel}"]`;
      return browser.wait(condition.presenceOf(element(by.css(cssSelector))), 1000).then(
        () => element.all(by.css(cssSelector)).then((elems) => elems.length === expected),
      );
    }

    // it's unchanged: Return success
    if (checkLength(2, 3) && checkLength(3, 7) && checkLength(4, 6) && checkLength(5, 7) && checkLength(6, 11)) {
      return Promise.resolve();
    }
    await waitForElementByString('.e-toolbar-item', fileTab);
    const fileBtn = element(by.cssContainingText('.e-toolbar-item', fileTab));
    await clickButton(fileBtn);

    const absolutePath: string = resolve(__dirname, './../testdata/projectTemplate.bin');
    const fileUpload = element(by.css('input[type="file"]'));
    await fileUpload.sendKeys(absolutePath);

    // wait until it's uploaded
    await waitForModalAndClose('#modal-question-dialog', importProjectWarning);

    // restarting the controller can take a while
    return waitForModalAndClose(
      '#modal-feedback-dialog',
      importSuccessful,
      undefined,
      '#btn-feedback-dialog-close',
      BROWSER_WAIT_INTERVAL_LONG,
    );
  }

  beforeAll(async () => {
    logger.verbose('project.e2e-spec beforeAll');
    jasmine.DEFAULT_TIMEOUT_INTERVAL *= 2;
    await navigateTo('project', '#treeelement');

    try {
      await importProjectData();
    } catch (err) {
      logger.error('couldn\'t import project data');
      logger.error(err);
    }
  });

  beforeEach(() => {
    logger.verbose('project.e2e-spec beforeEach');
    navigateTo('project');
  });

  afterAll(() => { jasmine.DEFAULT_TIMEOUT_INTERVAL /= 2; });

  it('should show three tabs and various links on the index', async () => {
    logger.verbose('project: should show three tabs and various links on the index');
    // expect(element(by.cssContainingText('.e-tab-text', projectStructure)).isPresent()).toBeTruthy();
    // expect(element(by.cssContainingText('.e-tab-text', baseData)).isPresent()).toBeTruthy();
    // expect(element(by.cssContainingText('.e-tab-text', fileTab)).isPresent()).toBeTruthy();
    await waitForElementByString('.e-tab-text', projectStructure);
    await waitForElementByString('.e-tab-text', baseData);
    await waitForElementByString('.e-tab-text', fileTab);
  });

  describe('Project Structure tab', () => {
    /*
     * Keep labels and translation strings in a map.
     */
    const allButtonLabels: Record<string, string> = {
      NEW_BUILDING: getTranslation('PROJECT.NEW_BUILDING'),
      NEW_AREA: getTranslation('PROJECT.NEW_AREA'),
      NEW_ROOM: getTranslation('PROJECT.NEW_ROOM'),
      NEW_SEGMENT: getTranslation('PROJECT.NEW_SEGMENT'),
      NEW_DEVICE_POINT: getTranslation('PROJECT.NEW_DEVICE_POINT'),
      DUPLICATE: getTranslation('PROJECT.DUPLICATE'),
      EDIT: EDIT_BTN_TEXT,
      REMOVE: getTranslation('PROJECT.REMOVE'),
      FUNCTIONAL_OVERVIEW: getTranslation('PROJECT.FUNCTIONAL_OVERVIEW'),
      ASSIGN_FUNCTION: getTranslation('PROJECT.ASSIGN_FUNCTION'),
    };

    async function validateButtonLabelsAndStates(...enabledButtonNames: string[]) {
      const linkTexts: Map<string, boolean> = new Map<string, boolean>();
      Object.keys(allButtonLabels).forEach((label: string) => {
        linkTexts.set(label, true);
      });
      const labelsForDebug = [];
      (enabledButtonNames || []).forEach((buttonStringSelector) => {
        const btnLabel = allButtonLabels[buttonStringSelector];
        linkTexts.set(btnLabel, false);
        labelsForDebug.push(btnLabel);
      });

      // we generated a map with label => isDisabled, now we need to validate it
      // eslint-disable-next-line no-restricted-syntax
      for (const [btnLabel, btnDisabled] of Array.from(linkTexts)) {
        const btn = element(by.cssContainingText('button', btnLabel));
        if (!(await btn.isPresent())) {
          return Promise.reject(new Error(
            `because a button with the label ${btnLabel} should be present and ${btnDisabled ? 'dis' : 'en'}abled`,
          ));
        }
        try {
          await waitForCssAttribute(btn, 'ng-reflect-disabled', `${btnDisabled}`);
        } catch (err) {
          return Promise.reject(new Error(
            `\n\t[${getCurrentLabelPath()}]\n\t because the button ${btnLabel}'s ng-reflect-disabled should be ${btnDisabled}`,
          ));
        }
      }

      logger.info(`all sidebar buttons are disabled${labelsForDebug.length === 0 ? '' : ` but [ ${labelsForDebug.join(', ')} ]`}`);
      return Promise.resolve(linkTexts);
    }

    async function deleteElement(fullPath: string[], elementType = ''): Promise<string[]> {
      /*
       * Delete
       */
      const elementName = fullPath[fullPath.length - 1];

      // await browser.refresh(); // TODO [Baumgarten] BUG, Stephan could reproduce

      // label = await findLabelRecursively(undefined, fullPath);
      await clickRowByLabel(fullPath);

      await clickButton(element(by.cssContainingText('button', allButtonLabels['REMOVE'])));
      // by replacing the ? we can settle for a partial match
      const expectedModalMsg = removalWarning.replace('{{deviceName}}', elementName).replace('?', '');

      await waitForModalAndClose(
        '#modal-question-dialog',
        expectedModalMsg,
        undefined,
        '#btn-question-dialog-confirm',
        BROWSER_WAIT_INTERVAL_MEDIUM,
      );

      const elem = await element(by.cssContainingText('.e-text-content', elementName));
      const errorMsg = `because ${elementType.toLowerCase()} '${fullPath.join('/')}' was deleted and the row should be gone`;
      await browser.wait(absenceOf(elem), BROWSER_WAIT_INTERVAL_MEDIUM, errorMsg);
      await expect(await elem.isPresent()).toBeFalsy(errorMsg);
      return Promise.resolve(fullPath);
    }

    async function trySetDevicePointType(type = 'DTE') {
      const dropdownList = element(by.css('*[aria-labelledby="ddlelement_hidden"]'));
      if (!dropdownList || !(await dropdownList.isPresent())) {
        return Promise.resolve();
      }
      logger.verbose(`trySetDevicePointType: setting device point type to ${type}`);
      await dropdownList.click();
      await dropdownList.sendKeys(type);
      return dropdownList.sendKeys(protractor.Key.ENTER);
    }

    async function createNewElement(
      elementName: string,
      elementType: string,
      remark = 'this is a test device',
      type = 'DTE',
    ) {
      logger.verbose(`createNewElement: name ${elementName}, type ${type}`);

      await clickButton(element(by.cssContainingText('button', allButtonLabels[`NEW_${elementType}`])));

      await waitForElementByString('#modal-dialog', getTranslation(`PROJECT.CREATE_${elementType}_TITLE`));
      await setInputFieldValue('#name', elementName);

      await trySetInputFieldValue('#remark', remark);
      await trySetDevicePointType(type);

      logger.verbose('createNewElement: Saving');
      await clickButton(element(by.cssContainingText('button', CREATE_BTN_TEXT)));
      return browser.wait(condition.not(condition.presenceOf(element(by.css('#modal-dialog')))));
    }

    async function createEditDestroy(elementType: string, elementPath: string[], skipDelete = false): Promise<string[]> {
      let elementName = elementPath[elementPath.length - 1];
      logger.info(`trying to create ${elementType.toLowerCase()} '${elementName}' under ${elementPath.join('/')}`);

      const fullPath: string[] = Object.assign([], elementPath);

      /*
       * Create
       */
      await clickRowByLabel(fullPath.slice(0, fullPath.length - 1));
      await createNewElement(fullPath[fullPath.length - 1], elementType);

      const labelPath = getCurrentLabelPath();
      let label = await findLabelRecursively(undefined, fullPath);
      browser.wait(
        condition.presenceOf(label),
        BROWSER_WAIT_INTERVAL_SHORT,
        `because ${elementType.toLowerCase()} ${labelPath} was just created`,
      );

      /*
       * Edit
       */

      elementName = `${elementName}_${getRandomString(10)}`;
      logger.debug(`editing: Changing name of ${elementName.replace(/_.*/, '')} to ${elementName}`);
      await clickRowByLabel(fullPath);

      await clickButton(element(by.cssContainingText('button', allButtonLabels['EDIT'])));
      await waitForElementByString('.modal-container', getTranslation(`PROJECT.EDIT_${elementType}TITLE`));

      const saveBtn = element(by.cssContainingText('viega-button', SAVE_BTN_TEXT));
      await expect(await saveBtn.getAttribute('disabled')).toBeTruthy('because nothing was changed yet');

      await setInputFieldValue('#name', elementName);
      await expect(await saveBtn.getAttribute('disabled')).toBeFalsy('because the name was changed');

      await clickButton(saveBtn);
      await browser.wait(absenceOf(element(by.css('#projectComponentForm'))));

      fullPath.pop();
      fullPath.push(elementName);

      label = await findLabelRecursively(undefined, fullPath);
      await browser.wait(
        condition.presenceOf(label),
        BROWSER_WAIT_INTERVAL_MEDIUM,
        `because ${elementType.toLowerCase()} was renamed to ${elementName}`,
      );

      /*
       * Destroy
       */
      return skipDelete ? Promise.resolve(fullPath) : deleteElement(fullPath, elementType);
    }

    it('should only enable sidebar buttons relevant for the selected tree node', async () => {
      // no element active in tree: None of the buttons were activated
      await validateButtonLabelsAndStates();

      await clickRowByLabel(['Project']);
      await validateButtonLabelsAndStates('NEW_BUILDING');

      await clickRowByLabel(['Linker Flügel']);
      await validateButtonLabelsAndStates('NEW_AREA', 'NEW_DEVICE_POINT', 'EDIT');

      await clickRowByLabel(['Linker Flügel', 'Empfang']);
      await validateButtonLabelsAndStates('NEW_ROOM', 'NEW_DEVICE_POINT', 'EDIT');

      await clickRowByLabel(['Linker Flügel', 'Empfang', 'Vorzimmer']);
      await validateButtonLabelsAndStates('NEW_SEGMENT', 'NEW_DEVICE_POINT', 'EDIT');

      // Room without devices: Can be removed
      await clickRowByLabel(['Linker Flügel', 'Empfang', 'Vorzimmer', 'Links']);
      await validateButtonLabelsAndStates('NEW_DEVICE_POINT', 'EDIT', 'REMOVE');

      // Room with devices: Cannot be removed
      await clickRowByLabel(['Linker Flügel', 'Laborbereich 1', 'Labor 2', 'Links']);
      await validateButtonLabelsAndStates('NEW_DEVICE_POINT', 'EDIT');

      await clickRowByLabel(['Linker Flügel', 'Laborbereich 1', 'Labor 2', 'Links', 'Beat-E Bad linker Flur']);
      await validateButtonLabelsAndStates('EDIT', 'REMOVE', 'FUNCTIONAL_OVERVIEW', 'ASSIGN_FUNCTION');
    });

    it('should create, edit, and delete empty elements', async () => {
      logger.info('project: should create, edit, and delete empty elements');

      // Top level: Building
      await createEditDestroy('BUILDING', ['Project', '_TestBuilding']);

      // Level 1: Area
      await createEditDestroy('AREA', ['Linker Flügel', '_TestArea']);
    }, jasmine.DEFAULT_TIMEOUT_INTERVAL * 2);

    async function validateModalValues(expectedConfigValues: { [x: string]: any }, changeConfigValues: { [x: string]: any } = {}) {
      // eslint-disable-next-line no-restricted-syntax
      for (const k of Object.keys(expectedConfigValues)) {
        const label = element(by.cssContainingText('.device-param-label', k));
        const valueElem = await label.element(by.xpath('following-sibling::td/*[1]'));

        let actual = await getInputElementValue(valueElem);
        let expected = expectedConfigValues[k];

        if (!changeConfigValues[k]) {
          continue;
        }
        await expect(actual).toBe(expected, `${k} is '${actual}' (expected '${expected}')`);
        expected = changeConfigValues[k];

        const elemType = await valueElem.getTagName();
        await valueElem.click();
        await browser.sleep(100);
        if (elemType.includes('input')) {
          const input = await browser.driver.switchTo().activeElement();
          await input.clear();
          await input.sendKeys(expected);
        }

        // Workaround for viega-checkboxes
        actual = await getInputElementValue(valueElem, 'on', 'true');

        await expect(actual).toBe(expected, `${k} is '${actual}' (expected '${expected}')`);
      }

      return Promise.resolve();
    }

    it('should create, edit and destroy device points', async () => {
      logger.info('project: should create, edit and destroy device points');
      /*
       * Level 4: Device Point
       */
      let elementName = '_TestDevicePoint';

      const fullPath = ['Linker Flügel', 'Empfang', 'Vorzimmer', 'Links', elementName];

      // make sure it's not present
      try {
        await deleteElement(fullPath);
      } catch (err) {
        // it's not present
      }

      await clickRowByLabel(fullPath.slice(0, fullPath.length - 1));

      /*
       * Create and edit element, do not delete
       */
      elementName = fullPath[fullPath.length - 1];
      await createNewElement(elementName, 'DEVICE_POINT', 'this is a test device', 'DTE');

      // make sure there's no toast
      await expect(await element(by.cssContainingText('.ng-trigger', errorDeviceNameTaken)).isPresent()).toBeFalsy(
        'because the element name should not be taken',
      );

      /*
       * Create element again: Alert should be shown
       */
      await clickRowByLabel(fullPath.slice(0, fullPath.length - 1));
      await createNewElement(elementName, 'DEVICE_POINT', 'this is another test device', 'DTE');
      // make sure there's a toast and close it
      await clickToast(errorDeviceNameTaken);

      /*
       * Edit it
       */
      await clickRowByLabel(fullPath);
      await clickButton(element(by.cssContainingText('button', allButtonLabels['EDIT'])));

      await waitForElementByString('.mat-dialog-container', elementName);

      let saveButton = element(by.cssContainingText('viega-button', SAVE_BTN_TEXT));
      await expect(await saveButton.getAttribute('disabled')).toBeTruthy('because nothing was changed yet');

      let deviceTypeList = element(by.cssContainingText('.row', getTranslation('PROJECT.DEVICE_TYPE')));
      expect(await (await deviceTypeList.element(by.xpath('..'))).getText()).toContain('DTE');

      await assertInputElementValue('#name', elementName);
      await assertInputElementValue('#remark', 'this is a test device');

      await setInputFieldValue('#remark', 'this is another test remark');

      /*
       * click "device point configuration" tab
       */
      let nextTab = element(by.cssContainingText('.e-tab-text', getTranslation('PROJECT.DEVICE_POINT_CONFIG')));
      await nextTab.click();

      const expectedConfigValues: Record<string, any> = {
        'Circulation pump connected': 'false',
        'Circulation pump on/off': 'false',
        'UFC connected': 'false',
        'Reset factory settings': 'false',
        'Device ready yes/no': 'false',
      };
      const changedConfigValues: Record<string, any> = {
        'Circulation pump connected': 'true',
        'Circulation pump on/off': 'true',
        'UFC connected': 'true',
        'Reset factory settings': 'true',
        'Device ready yes/no': 'true',
      };

      await validateModalValues(expectedConfigValues, changedConfigValues);

      saveButton = element(by.cssContainingText('viega-button', SAVE_BTN_TEXT));
      await expect(await saveButton.getAttribute('disabled')).toBeFalsy('becaus the name was changed');

      await clickButton(saveButton);
      await browser.wait(absenceOf(element(by.cssContainingText('.mat-dialog-container', elementName))));

      /*
       * Edit it again to verify that the values are okay
       */
      await clickRowByLabel(['Linker Flügel', 'Empfang', 'Vorzimmer', 'Links', elementName]);
      await clickButton(element(by.cssContainingText('button', allButtonLabels['EDIT'])));

      await waitForElementByString('.mat-dialog-container', elementName);

      deviceTypeList = element(by.cssContainingText('.row', getTranslation('PROJECT.DEVICE_TYPE')));
      expect(await (await deviceTypeList.element(by.xpath('..'))).getText()).toContain('DTE');

      /*
       * click "device point configuration" tab
       */
      nextTab = element(by.cssContainingText('.e-tab-text', getTranslation('PROJECT.DEVICE_POINT_CONFIG')));
      await nextTab.click();

      await browser.wait(condition.presenceOf(element(by.cssContainingText('*', Object.keys(changedConfigValues)[0]))));
      await browser.sleep(100);

      // changedConfigValues['Umschaltung: Grundbetrieb, Normabetrieb'] = '0'; // TODO [Baumgarten]
      await validateModalValues(changedConfigValues);

      await deleteElement(fullPath);
    });
  });
});

xdescribe('todo', () => {
  // TODO (Reger): These tests are obsolete because buttons logic changed.
  xit('should be possible to edit a project', async () => {
    expect(element(by.buttonText('Bearbeiten')).isPresent()).toBeTruthy('edit-button is not shown');
    element(by.buttonText('Bearbeiten')).click();
    expect(element(by.buttonText('Abbrechen')).isPresent()).toBeTruthy(' edit-button is not shown');

    const projectNameInput = element(by.css('#input-project-name'));
    projectNameInput.click();
    projectNameInput.clear();

    const randomString = (Math.random() + 1).toString(36).substr(2, 5);
    projectNameInput.sendKeys(`foobar ${randomString}`);

    element(by.buttonText('Abbrechen')).click();

    expect(element(by.buttonText('Übernehmen')).isPresent()).toBeTruthy('accept-button is not shown');
    await element(by.buttonText('Übernehmen')).click();
    expect(element(by.buttonText('Bearbeiten')).isPresent()).toBeTruthy('project name has not been changed');
    browser.refresh();

    expect(element(by.cssContainingText('#input-project-name', `foobar ${randomString}`)).isPresent()).toBeFalsy(
      'project name should have been changed',
    );
  });

  xit('should be possible to add a new project', () => {
    /** TODO: Implement */
  });

  xit('should be possible to delete an existing project', () => {
    /** TODO: Implement */
  });

  xit('should be possible to open an existing project', () => {
    /** TODO: Implement */
  });
});
