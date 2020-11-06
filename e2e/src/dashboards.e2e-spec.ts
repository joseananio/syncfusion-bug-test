import {
  browser, element, by, ElementFinder,
} from 'protractor';
import * as path from 'path';
import { navigateTo, navigateWithoutLoginTo } from './app.po';
import {
  condition,
  REQUIRED_FIELD_ERRORMSG,
  ICONCLASS_DELETE,
  BROWSER_WAIT_INTERVAL_MEDIUM,
  EDIT_BTN_TEXT,
  SAVE_BTN_TEXT,
  BROWSER_WAIT_INTERVAL_LONG,
  BROWSER_WAIT_INTERVAL_SHORT,
} from '../constants/constants.definitions';
import { logger } from '../constants/logger';
import {
  setInputFieldValue,
  clickButton,
  closeAnyModal,
  expectFormValidationError,
  waitForElementByString,
  absenceOf,
} from '../helpers/element.helper';
import { getTranslation } from '../helpers/translate.helper';

describe('dashboards', () => {
  const addButtonSelector = '#btn-dashboard-add';
  const addSaveBtnSelector = '#btn-item-details-modal-save';
  const duplicateNameAlertMsg = getTranslation('DASHBOARD.DUPLICATE_NAME');
  const inputFieldSelector = '#input-dashboard-add-dashboardName';
  const deleteImageText = getTranslation('DASHBOARD.REMOVE_PICTURE');
  const uploadedImageSelector = '.dashboard-container[ng-reflect-app-background-image*="data:image/jpeg"]'; // the placeholder is a png
  const boardName = 'dashboard';

  /*  */
  beforeEach(() => {
    logger.verbose('dashboards beforeEach');

    return navigateTo('/dashboard')
      .then(() => {
        logger.verbose('removeAllDashboards');
        return removeAllDashboards();
      })
      .then(() => browser.waitForAngular())
      .then(() => waitForElementByString(addButtonSelector, undefined, BROWSER_WAIT_INTERVAL_MEDIUM))
      .catch((err) => {
        logger.error('error in dashboards.beforeEach:');
        logger.error(err);
      });
  });

  async function createDashboard(dashboardName: string, errorMsg?: string) {
    return clickButton(addButtonSelector)
      .then(() => setInputFieldValue(inputFieldSelector, dashboardName))
      .then(() => clickButton(addSaveBtnSelector))
      .then(() => expectFormValidationError(errorMsg))
      .then(() => browser.waitForAngular())
      .catch((err) => {
        logger.error('error in createDashboard:');
        logger.error(err);
        return Promise.reject(err);
      });
  }

  async function removeAllDashboards(numTries = 0) {
    if (numTries > 10) {
      return Promise.reject(new Error('removeAllDashboards failed'));
    }
    return browser.waitForAngular().then(() => element.all(by.css(ICONCLASS_DELETE)).then((btns) => {
      if (btns.length === 0) {
        return Promise.resolve();
      }

      return clickButton(btns[0], 200)
        .then(() => browser.wait(absenceOf(btns[0]), BROWSER_WAIT_INTERVAL_SHORT))
        .then(() => removeAllDashboards()).catch((e) => removeAllDashboards(numTries + 1));
    }));
  }

  describe('index', () => {
    it('should validate mandatory field presence and name uniqueness', async () => {
      // log to console for CI
      logger.info('dashboards: should validate mandatory field presence and name uniqueness');

      // open modal dialogue
      await createDashboard(boardName);
      await waitForElementByString('.e-card-header');

      let boards = await element.all(by.css('.e-card-header'));
      // make sure dashboard exists
      await expect(boards.length).toBe(1, `because a dashboard with the name ${boardName} has been created`);

      // try to create dashboard again. Should fail with message.
      await createDashboard(boardName, duplicateNameAlertMsg);

      // set input field value to empty, check for validation
      await setInputFieldValue(inputFieldSelector, '', true, REQUIRED_FIELD_ERRORMSG);

      await closeAnyModal();
      await browser.waitForAngular();

      boards = await element.all(by.css('.e-card-header'));

      // make sure dashboard exists exactly one
      await expect(boards.length).toBe(1, `because a dashboard with the name ${boardName} already exists and should not be created again`);
    });

    it('should display tiles for every dashboard on the index', async () => {
      // log to console for CI
      logger.info('dashboards: should display tiles for every dashboard on the index');

      const boardNameWithNumber = boardName;
      const numBoards = 3;
      for (let i = 0; i < numBoards; i += 1) {
        await createDashboard(`${boardNameWithNumber}${i}`);
        await browser.wait(absenceOf(element(by.css('app-modal-dialog'))), BROWSER_WAIT_INTERVAL_SHORT);
      }

      // add 1 to the count because element.length blah
      await expect(await element.all(by.css('.e-card-header')).count() + 1).toBeGreaterThanOrEqual(
        numBoards,
        `because we created ${numBoards} additional dashboards`,
      );
    });
  });

  describe('uploading images', () => {
    let fileName: string;
    let imgElement: ElementFinder;

    beforeEach(() => {
      logger.verbose('dashboards: uploading images beforeEach');

      browser.waitForAngular().then(() => waitForElementByString(addButtonSelector, undefined, BROWSER_WAIT_INTERVAL_MEDIUM)
        .then(() => browser.wait(absenceOf(element(by.cssContainingText('.e-card', boardName)))))
        .then(() => createDashboard(boardName)));
    });

    async function gotoEdit() {
      const board = await waitForElementByString('.e-card', boardName);
      await board.click();
      await browser.wait(
        condition.urlContains(`${boardName}/view`),
        BROWSER_WAIT_INTERVAL_MEDIUM,
        'because we should be redirected to view',
      );

      const editButton = await waitForElementByString(
        'button',
        EDIT_BTN_TEXT,
        BROWSER_WAIT_INTERVAL_MEDIUM,
        'because the edit page should display a button',
      );
      await clickButton(editButton);

      await waitForElementByString('button', SAVE_BTN_TEXT, BROWSER_WAIT_INTERVAL_MEDIUM,
        `Because the edit button says ${SAVE_BTN_TEXT} now`);
    }

    async function uploadFile() {
      await closeAnyModal();
      await gotoEdit();
      const fileToUpload = `./../testdata/${fileName}.jpg`;

      const absolutePath: string = path.resolve(__dirname, fileToUpload);
      const fileUpload = element(by.css('input[type="file"]'));
      await fileUpload.sendKeys(absolutePath);

      // wait until it's uploaded
      await waitForElementByString('button', deleteImageText);
      const tempImageElement = element(by.css(uploadedImageSelector));

      await browser.wait(
        condition.presenceOf(tempImageElement), // the placeholder file is a png
        BROWSER_WAIT_INTERVAL_MEDIUM,
        `because an image by the name ${fileName} should be displayed on the edit page`,
      );

      const imgSize = await tempImageElement.getSize();
      const windowSize = await browser.driver.manage().window().getSize();

      expect(imgSize.width).toBeGreaterThan(windowSize.width * 0.5, 'because image width should scale to browser size');
      expect(imgSize.height).toBeGreaterThan(windowSize.height * 0.5, 'because image height should scale to browser size');

      logger.silly('image upload complete');
      return Promise.resolve();
    }

    async function getNumberOfBrokenImages() {
      return browser.executeAsyncScript((callback) => {
        const imgs = document.getElementsByTagName('img');
        let loaded = 0;
        for (let i = 0; i < imgs.length; i += 1) {
          if (imgs[i].naturalWidth > 0) {
            loaded += 1;
          }
        }
        callback(imgs.length - loaded);
      });
    }

    it('should allow uploading an image in the correct aspect ratio and display it on the index', async () => {
      // log to console for CI
      logger.info(`dashboards: should allow uploading an image in the correct aspect ratio for ${boardName} and display it on the index`);

      fileName = 'image_4x3';
      await uploadFile();

      const saveBtn = await waitForElementByString('button', SAVE_BTN_TEXT);
      await saveBtn.click();
      await browser.waitForAngular();
      await waitForElementByString('button', EDIT_BTN_TEXT);

      imgElement = element(by.css(`div[style*="${fileName}"]`));
      await browser.wait(
        condition.presenceOf(imgElement),
        BROWSER_WAIT_INTERVAL_LONG,
        `because an image by the name ${fileName} should be displayed on the details page`,
      );

      await browser.sleep(BROWSER_WAIT_INTERVAL_MEDIUM); // without the wait interval, this test sometimes fails
      await navigateWithoutLoginTo('dashboard');
      await browser.waitForAngular();

      imgElement = element(by.css(`img[src*="${fileName}"]`));
      await browser.wait(
        condition.presenceOf(imgElement),
        BROWSER_WAIT_INTERVAL_LONG,
        `because ${boardName} should have an image by the name ${fileName} on the index page`,
      );

      expect(await getNumberOfBrokenImages()).toBe(0, 'because all images should be displayed correctly');
    });

    it('should stretch an image in any other aspect ratio and display it on the index', async () => {
      // log to console for CI
      logger.info('dashboards: should stretch an image in any other aspect ratio and display it on the index');

      fileName = 'image_3x4';
      await uploadFile();

      await clickButton(element(by.cssContainingText('button', SAVE_BTN_TEXT)));
      await browser.waitForAngular();

      await waitForElementByString('button', EDIT_BTN_TEXT);
      await browser.waitForAngular();

      imgElement = element(by.css(`div[style*="${fileName}"]`));
      await browser.wait(
        condition.presenceOf(imgElement),
        BROWSER_WAIT_INTERVAL_MEDIUM,
        `because an image by the name ${fileName} should be displayed on the edit page`,
      );

      const imgSize = await imgElement.getSize();
      expect(imgSize.height).toBeGreaterThan(imgSize.width, 'because 3x4 image will scale to wrapper');

      await browser.sleep(BROWSER_WAIT_INTERVAL_MEDIUM); // without the wait interval, this test sometimes fails
      await navigateWithoutLoginTo('dashboard');
      await browser.waitForAngular();

      imgElement = element(by.css(`img[src*="${fileName}"]`));
      await browser.wait(
        condition.presenceOf(imgElement),
        BROWSER_WAIT_INTERVAL_MEDIUM,
        `because an image by the name ${fileName} should be displayed on the index page`,
      );

      expect(await getNumberOfBrokenImages()).toBe(0, 'because all images should be displayed correctly');
    });

    it('should remove an image from a dashboard and display a placeholder on the index', async () => {
      // log to console for CI
      logger.info('dashboards: should remove an image from a dashboard and display a placeholder on the index');

      fileName = 'image_3x4';

      // will validate presence of uploaded file
      await uploadFile();

      // delete it
      await clickButton(element(by.cssContainingText('button', deleteImageText)));

      // make sure the other is gone
      imgElement = element(by.css(`div[style*="${fileName}"]`));
      await browser.wait(
        condition.not(condition.presenceOf(imgElement)),
        BROWSER_WAIT_INTERVAL_MEDIUM,
        `because the background image ${fileName} was removed`,
      );

      // make sure the placeholder exists
      fileName = 'dashboard-empty';
      imgElement = element(by.css(`div[style*="${fileName}"]`));
      await browser.wait(
        condition.presenceOf(imgElement),
        BROWSER_WAIT_INTERVAL_MEDIUM,
        `because the placeholder image ${fileName} should be displayed on the edit page`,
      );

      await clickButton(element(by.cssContainingText('button', SAVE_BTN_TEXT)));
      // make sure the placeholder is displayed on the detail page
      imgElement = element(by.css(`div[style*="${fileName}"]`));
      await browser.wait(
        condition.presenceOf(imgElement),
        BROWSER_WAIT_INTERVAL_MEDIUM,
        `because the placeholder image ${fileName} should be displayed on the details page after saving`,
      );

      // make sure the placeholder is displayed on the index page
      await browser.sleep(BROWSER_WAIT_INTERVAL_SHORT); // without the wait interval, this test sometimes fails
      await browser.waitForAngular();
      await navigateWithoutLoginTo('dashboard');
      await browser.waitForAngular();

      imgElement = element(by.css(`img[src*="${fileName}"]`));
      await browser.wait(
        condition.presenceOf(imgElement),
        BROWSER_WAIT_INTERVAL_MEDIUM,
        `because the placeholder image ${fileName} should be displayed on the index page`,
      );

      expect(await getNumberOfBrokenImages()).toBe(0, 'because all images should be displayed correctly');
    });
  });
});
