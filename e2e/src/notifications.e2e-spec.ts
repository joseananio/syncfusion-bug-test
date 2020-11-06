import {
  browser, by, element, ElementFinder,
} from 'protractor';
import { condition, BROWSER_WAIT_INTERVAL_LONG } from '../constants/constants.definitions';
import { navigateTo, navigateWithoutLoginTo } from './app.po';
import {
  waitForElementByString, waitForModalAndCancel, waitForModalAndClose,
} from '../helpers/element.helper';
import { getTranslation } from '../helpers/translate.helper';

describe('notifications', () => {
  const TIMESTAMP_COL_INDEX = 1;
  const SOURCE_COL_INDEX = 2;
  const DESCRIPTION_COL_INDEX = 3;
  const TABS = [
    { path: 'notifications/new', component: 'app-open-notifications', tabTitle: getTranslation('NOTIFICATIONS.REPORTS') },
    { path: 'notifications/archive', component: 'app-done-notifications', tabTitle: getTranslation('NOTIFICATIONS.DONE') },
    { path: 'notifications/events', component: 'app-event-notifications', tabTitle: getTranslation('NOTIFICATIONS.EVENTS') },
  ];

  function getTableElem(tabIdent: number | string, colIndex: number, childType = '.e-row', descendantSelector = '') {
    const tabDescription: string = 'number' === typeof tabIdent ? TABS[tabIdent].component : tabIdent as string;
    return `${tabDescription} ${childType}:nth-child(${colIndex}) ${descendantSelector}`.trim();
  }

  beforeAll(async () => {
    const cssSelector = getTableElem(0, DESCRIPTION_COL_INDEX);
    await navigateTo('notifications', cssSelector);
  });

  beforeEach(async () => navigateWithoutLoginTo('notifications', getTableElem(0, DESCRIPTION_COL_INDEX)));

  async function gotoTab(tab: { path?: string; component?: string; tabTitle: any; }) {
    const tabTitle = element(by.cssContainingText('div[role="tab"]', tab.tabTitle));
    await tabTitle.click();
    return browser.waitForAngular();
  }

  TABS.forEach((tab) => {
    // this needs to be wrapped into an additional async call, or we'll run into issues with the for loop
    it(`should open device details on ${tab.path}`, () => async () => {
      await gotoTab(tab);

      const cssSelector = `${tab.component} .e-rowcell`;

      const cell = element.all(by.css(cssSelector)).first();
      await cell.click();
      await waitForModalAndCancel('app-modal-dialog');
    });
  });

  TABS.forEach((tab) => {
    it(`should contain the same message in the details view on ${tab.path}`, () => async () => {
      await gotoTab(tab);

      const firstDescriptionCell = element.all(by.css(getTableElem(tab.component, DESCRIPTION_COL_INDEX))).first();

      await firstDescriptionCell.click();
      const summary = element.all(by.css('.summary .notification-detail-text')).get(1);
      expect(summary.getText()).toEqual(firstDescriptionCell.getText());
    });
  });

  TABS.forEach((tab) => {
    it(`should be possible to close the dialog on ${tab.path}`, () => async () => {
      await gotoTab(tab);

      const cell = element.all(by.css(getTableElem(tab.component, SOURCE_COL_INDEX, '.e-rowcell'))).first();
      await cell.click();
      await waitForModalAndCancel('app-modal-dialog');
    });
  });

  it('should redirect to device page when clicking on device name', async () => {
    const cssSelector = getTableElem(0, SOURCE_COL_INDEX, '.e-row', `td:nth-child(${SOURCE_COL_INDEX}) span`);
    const span: ElementFinder = await waitForElementByString(cssSelector);
    await span.click();
    await browser.wait(
      condition.urlContains('devices'),
      BROWSER_WAIT_INTERVAL_LONG,
      'because click on device name should redirect to /devices',
    );
  });

  it('should should open a dialog on row description and close it again on click', async () => {
    const cssSelector = getTableElem(0, DESCRIPTION_COL_INDEX, '.e-row', `td:nth-child(${DESCRIPTION_COL_INDEX}`);
    const td: ElementFinder = await waitForElementByString(cssSelector);
    await td.click();

    await waitForModalAndCancel('#modal-notification-details', '', 'because clicking on the row should open a modal');
  });

  // TODO [Baumgarten] https://collab.cbb.de/jira/browse/TWMS2020-2941
  xit('should move an acknowledged notification to the "done" tab', async () => {
    let cssSelector = getTableElem(0, DESCRIPTION_COL_INDEX, '.e-row', `td:nth-child(${DESCRIPTION_COL_INDEX}`);

    let firstDescriptionCell = element.all(by.css(cssSelector)).first();
    const firstMessageDescription = await firstDescriptionCell.getText();

    const ackButton = element.all(by.css('#button-notifications-fixed')).first();
    await ackButton.click();

    await waitForModalAndClose('app-modal-dialog');

    const doneTab = element(by.cssContainingText('div[role="tab"]', getTranslation('NOTIFICATIONS.DONE')));
    await doneTab.click();
    cssSelector = `${TABS[1].component} .e-headercell:nth-child(${TIMESTAMP_COL_INDEX})`;
    // await navigateWithoutLoginTo(TABS[1].component, cssSelector);
    await browser.waitForAngular();

    // Sort by timestamp in reverse order
    const timestampColumnHeader = element(by.css(cssSelector));
    while (await timestampColumnHeader.getAttribute('aria-sort') !== 'Descending') {
      await timestampColumnHeader.click();
    }

    firstDescriptionCell = element.all(by.css(`${TABS[1].component} .e-rowcell:nth-child(${DESCRIPTION_COL_INDEX})`)).first();
    expect(await firstDescriptionCell.getText()).toEqual(firstMessageDescription);
  });
});
