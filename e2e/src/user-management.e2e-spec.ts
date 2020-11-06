import { browser, by, element } from 'protractor';
import {
  BROWSER_WAIT_INTERVAL_MEDIUM,
  BROWSER_WAIT_INTERVAL_LONG,
  BROWSER_WAIT_INTERVAL_SHORT,
  USERNAME_PREFIX,
  CSS_SEL_ANY_CANCELBTN,

  UTF8_GLYPH_DELETE,
  UTF8_GLYPH_EDIT,
  ICONCLASS_EDIT,
  ICONCLASS_DELETE,
  condition,
  VALID_PASSWORD,
} from '../constants/constants.definitions';
import { logger } from '../constants/logger';
import { navigateAndSort, redirectConditionally } from './app.po';
import { typeValidUser } from '../helpers/user.helper.po';
import { getTranslation, getTranslationWithUsername } from '../helpers/translate.helper';
import {
  setInputFieldValue,
  assertInputElementValue,
  checkPseudoclassContent,
  findPageWithCellText,
  waitForModalAndClose,
  clickButton,
  closeAnyModal,
  waitForElementByString,
  waitForModalAndCancel,
  waitForCssAttribute,
} from '../helpers/element.helper';

/* TODO (Reger): Some data binding got broken in the tested components in a way
that protractor can't track them no more. Either tests or components need fixes. */
describe('user-management', () => {
  const testUsers: string[] = [];
  const obsoleteTestUsers: string[] = [];

  /*
   * number of users that will be destructively handled
   */
  const TOTAL_USERS_REQUIRED = 5;

  /*
   * field by which to sort table
   */
  const loginName = getTranslation('USERS.LOGINNAME');

  beforeAll(() => {
    logger.info('user-management: beforeAll');
    navigateAndSort('/users', loginName)
      .then(() => createUsers(TOTAL_USERS_REQUIRED)).catch((err) => {
        logger.error('error in user-management: beforeAll: \n%o', err);
        return Promise.reject(err);
      });
  });

  beforeEach(() => navigateAndSort('/users', loginName));

  afterAll(async () => {
    logger.debug('user-management: afterAll');
    try {
      await deleteObsoleteUsers();
    } catch (e) {
      logger.info('could not delete users. This is unlikey to cause future problems.');
    }
  });

  async function getTestUser(willChange = false) {
    if (testUsers.length === 0) {
      await createUser();
    }
    const currentUser = willChange ? testUsers.pop() : testUsers[0];
    if (willChange) {
      obsoleteTestUsers.push(currentUser);
    }
    await findPageWithCellText(currentUser);
    return Promise.resolve(currentUser);
  }

  async function createUser(): Promise<string> {
    if ((await browser.getCurrentUrl()).indexOf('/users') < 0) {
      return navigateAndSort('/users', loginName).then(() => createUser());
    }

    element(by.css('#btn-user-add')).click();
    await browser.wait(
      condition.presenceOf(element(by.css('#modal-user-add'))),
      BROWSER_WAIT_INTERVAL_SHORT,
      'because the user-add-modal should be present',
    );

    const currentUser = await typeValidUser();
    // click save button
    await element(by.css('#btn-user-add-modal-save')).click();

    testUsers.push(currentUser.replace('@mail.*$', ''));

    // expect message that user was successfully created and dismiss it
    try {
      await waitForModalAndCancel('app-feedback-dialog', getTranslationWithUsername('USERS.CREATE_USER_SUCCESS', currentUser));
    } catch (err) {
      logger.error(err);
    }
    return Promise.resolve(currentUser);
  }

  async function scanPresentUsers() {
    const existingCells = await element.all(by.cssContainingText('.e-rowcell', USERNAME_PREFIX));

    // empty arrays
    obsoleteTestUsers.splice(0, obsoleteTestUsers.length);
    testUsers.splice(0, testUsers.length);
    for (let index = 0; index < existingCells.length; index += 1) {
      const tablecell = existingCells[index];
      const username = await tablecell.getText();

      const tr = await tablecell.element(by.xpath('ancestor::tr'));
      const loginCell = await tr.element(by.css(`[aria-label*='${lastLogin}']`));
      const loginCellText = await loginCell.getText();

      (loginCellText.length > 0 ? obsoleteTestUsers : testUsers).push(username.replace('@mail.com', ''));

      await browser.sleep(50);
    }

    return Promise.resolve();
  }

  const lastLogin = getTranslation('USERS.LAST_LOGIN');

  /**
   * Helper function to initially create test data. Will re-use existing test data to speed up things.
   */
  async function createUsers(numRequired = 5) {
    logger.debug('making sure %d users exist', numRequired);
    return scanPresentUsers().then(() => {
      const numTotal = numRequired - testUsers.length;
      if (numTotal === numRequired) {
        return Promise.resolve();
      }
      return createUser().then(() => createUsers(numRequired)).catch((err) => logger.error('error in createUsers: %o', err));
    }).catch((err) => {
      logger.error('Error in createUsers: %o', err);
      return Promise.reject(err);
    });
  }

  async function deleteUser(currentUser: string, failOnException = false) {
    logger.debug('deleteUser: about to delete %o (allowed to fail: %o)', currentUser, !failOnException);
    const tr = element(by.cssContainingText('.e-row', currentUser));
    try {
      await tr.element(by.css(ICONCLASS_DELETE)).element(by.xpath('ancestor::button')).click();

      // close any modal containing the expected user message
      await waitForModalAndClose(undefined, getTranslationWithUsername('USERS.DELETE_USER_ALERT', currentUser));

      // close confirmation message
      await waitForModalAndClose(undefined, getTranslationWithUsername('USERS.USER_DELETED_ALERT', currentUser));
    } catch (e) {
      if (failOnException) {
        throw e;
      }
    }
    return Promise.resolve();
  }

  async function deleteObsoleteUsers() {
    logger.debug('deleting %d users...', obsoleteTestUsers.length);
    if (obsoleteTestUsers.length === 0) {
      return;
    }
    redirectConditionally('/users');
    closeAnyModal();

    logger.debug('deleting %d users...', obsoleteTestUsers.length);
    for (let i = 0; i < obsoleteTestUsers.length; i += 1) {
      await deleteUser(obsoleteTestUsers.pop());
      await browser.sleep(200);
    }
    await scanPresentUsers();
    if (obsoleteTestUsers.length !== 0) {
      deleteObsoleteUsers();
    }
  }

  //  ___         _
  // |_ _|_ _  __| |_____ __
  //  | || ' \/ _` / -_) \ /
  // |___|_||_\__,_\___/_\_\

  describe('index', () => {
    it('should show some users initially', async () => {
      // print to logger for CI
      logger.info('    users/index: it should show some users initially');

      // waitForElement('#table-user-list');
      expect(await element(by.css('#table-user-list')).isPresent()).toBeTruthy();

      // Chosing greater than 1 because an emptry grid contains one row
      expect(await element.all(by.css('.e-row')).count()).toBeGreaterThan(1);
    });

    it('should show delete and edit icons inside the grid containing the expected UTF8-Glyphs', async () => {
      // print to logger for CI
      logger.info('    users/index: it should show delete and edit icons inside the grid containing the expected UTF8-Glyphs');

      expect(await element(by.css('#table-user-list')).isPresent()).toBeTruthy();

      // Can't do this with byCssContainingText
      // check that delete button exists and has the right utf-8 glyph.
      expect(await checkPseudoclassContent(UTF8_GLYPH_DELETE, ICONCLASS_DELETE, ':before')).toBeTruthy(
        'because the delete icon should exist',
      );

      // check that edit button exists and has the right utf-8 glyph.
      expect(await checkPseudoclassContent(UTF8_GLYPH_EDIT, ICONCLASS_EDIT, ':before')).toBeTruthy('because the edit icon should exist');
    });

    it('should highlight a row upon click instead of spawning a modal', async () => {
      // print to logger for CI
      logger.info('    users/index: it should highlight a row upon click instead of spawning a modal');

      const row = element(by.css('.e-row:first-child .e-rowcell:first-child'));
      await row.click();

      expect(await element(by.css('#modal-user-details')).isPresent()).toBeFalsy('because only the edit button shows the edit modal');
      expect((await row.getAttribute('class')).match('e-active')).toBeTruthy('because the row should be highlighted');
      await element(by.css('.e-row:nth-child(2) .e-rowcell:first-child')).click();
      expect((await row.getAttribute('class')).match('e-active')).toBeFalsy('because another row should be highlighted');
    });
  });
  //    _      _    _   _   _
  //   /_\  __| |__| | | | | |___ ___ _ _
  //  / _ \/ _` / _` | | |_| (_-</ -_) '_|
  // /_/ \_\__,_\__,_|  \___//__/\___|_|

  describe('adding users', () => {
    it('should spawn a modal dialog clicking on "add user" button', () => {
      // print to logger for CI
      logger.info('    users/adding users: it should spawn a modal dialog clicking on "add user" button');

      expect(element(by.css('#table-user-list')).isPresent()).toBeTruthy();
      expect(element(by.css('#modal-user-add')).isPresent()).toBeFalsy();
      element(by.css('#btn-user-add')).click();
      expect(element(by.css('#modal-user-add')).isPresent()).toBeTruthy();
    });

    it('should add a new user and auto-update the grid, then not add them a second time', async () => {
      const currentUser = await createUser();
      await findPageWithCellText(currentUser);
      await browser.wait(
        condition.presenceOf(element(by.cssContainingText('.e-row', currentUser))),
        BROWSER_WAIT_INTERVAL_MEDIUM,
        `because we just created user ${currentUser}`,
      );

      await element(by.css('#btn-user-add')).click();
      const otherUserName = await typeValidUser();

      // Try to add the same user again. Unique values are expected for email and username.

      // User same username as before
      await setInputFieldValue('#input-user-add-username', currentUser);
      await clickButton(element(by.css('#btn-user-add-modal-save')));

      // browser.sleep(150000);
      await waitForModalAndClose('#modal-feedback-dialog', getTranslationWithUsername('USERS.USER_ALREADY_EXISTS', currentUser));

      // reset username field
      await setInputFieldValue('#input-user-add-username', otherUserName);

      await setInputFieldValue('#input-user-add-mail', `${currentUser}@mail.com`);

      await clickButton(element(by.css('#btn-user-add-modal-save')));

      await waitForModalAndCancel('#modal-feedback-dialog', getTranslation('USERS.EMAIL_EXISTS'));
    });
  });

  //  ___      _     _         _   _
  // |   \ ___| |___| |_ ___  | | | |___ ___ _ _
  // | |) / -_) / -_)  _/ -_) | |_| (_-</ -_) '_|
  // |___/\___|_\___|\__\___|  \___//__/\___|_|

  describe('deleting users', () => {
    it(
      'should delete a user and auto update the grid',
      async () => {
        // print to logger for CI
        logger.info('    users/deleting users: should delete a user and auto update the grid');

        const currentUser = await getTestUser(true);
        deleteUser(currentUser, true);
      },
      BROWSER_WAIT_INTERVAL_LONG,
    );

    // TODO: Supervisor won't be displayed anymore
    xit('should prevent deleting yourself', async () => {
      // print to logger for CI
      logger.info('    users/deleting users: it should prevent deleting yourself');

      // navigate to users, then find current user entry
      const currentUser = 'supervisor';

      await findPageWithCellText(currentUser);
      const tr = element.all(by.cssContainingText('.e-row', currentUser)).first();
      await browser.wait(condition.visibilityOf(tr), 10000, `Because we just browsed to the page showing ${currentUser}`);
      logger.debug('user found, trying to delete:');
      await tr.element(by.css(ICONCLASS_DELETE)).element(by.xpath('ancestor::button')).click();

      let expected = getTranslationWithUsername('USERS.DELETE_USER_ALERT', currentUser);
      await browser.wait(
        condition.visibilityOf(element(by.cssContainingText('#modal-question-dialog', expected))),
        BROWSER_WAIT_INTERVAL_SHORT,
        'because it should ask if the user should really be deleted',
      );
      const confirmButton = element(by.css('#btn-question-dialog-confirm'));
      await confirmButton.click();
      await browser.wait(
        condition.invisibilityOf(confirmButton),
        BROWSER_WAIT_INTERVAL_SHORT,
        'because we confirmed that we want to close the dialogue',
      );

      // TODO [Baumgarten] use the right string key as soon as this gets fixed
      // expected = getTranslationWithUsername('USERS.CANT_DELETE_SELF_ALERT', currentUser);
      expected = getTranslationWithUsername('USERS.DELETE_USER_ERROR', currentUser);
      await browser.wait(
        condition.visibilityOf(element(by.cssContainingText('#modal-feedback-dialog', expected))),
        BROWSER_WAIT_INTERVAL_SHORT,
        `because an error message ${expected} should be shown`,
      );
    });

    // TODO [Baumgarten] Requires additional supervisor user
    xit('should prevent deleting supervisors', () => {
      // const currentUser = 'ProductionTest';
    });
  });

  //  ___    _ _ _     _   _
  // | __|__| (_) |_  | | | |___ ___ _ _
  // | _|/ _` | |  _| | |_| (_-</ -_) '_|
  // |___\__,_|_|\__|  \___//__/\___|_|

  describe('editing users', () => {
    it('should show the correct user details in the edit dialog and adjust save button visibility', async () => {
      // print to logger for CI
      logger.info('    users/editing users: it should show the correct user details in the edit dialog and adjust save button visibility');

      const currentUser = await getTestUser(true);
      logger.debug(`editing ${currentUser}`);

      const tr = element(by.cssContainingText('.e-row', currentUser));
      await browser.wait(condition.visibilityOf(tr), 10000, `Because we just created the user ${currentUser}`);

      await tr.element(by.css(ICONCLASS_EDIT)).element(by.xpath('ancestor::button')).click();

      await browser.wait(
        condition.visibilityOf(element(by.css('#modal-user-details'))),
        BROWSER_WAIT_INTERVAL_MEDIUM,
        'because edit modal dialog should pop up now',
      );
      await browser.waitForAngular();

      logger.debug('modal dialogue open, setting values:');
      // assert that the right values are displayed
      await assertInputElementValue('#input-user-details-firstname', 'Valid');
      await assertInputElementValue('#input-user-details-lastname', 'User');
      await assertInputElementValue('#input-user-details-email', `${currentUser}@mail.com`);
      await assertInputElementValue('#input-user-details-username', currentUser);
      await assertInputElementValue('#input-user-details-password', null);

      const saveBtn = element(by.css('#btn-user-details-modal-save'));

      // no changes: save button should be disabled
      expect(await saveBtn.getAttribute('disabled')).toBeTruthy('because nothing was changed');

      // valid change: save button should be enabled after firstname change
      await setInputFieldValue('#input-user-details-firstname', 'Valid2');
      expect(await saveBtn.getAttribute('disabled')).toBeFalsy('because we changed firstname');
      await setInputFieldValue('#input-user-details-firstname', 'Valid');
      expect(await saveBtn.getAttribute('truthy')).toBeFalsy('because we changed firstname back');

      // valid change: save button should be enabled after lastname change
      await setInputFieldValue('#input-user-details-lastname', 'User2');
      expect(await saveBtn.getAttribute('disabled')).toBeFalsy('because we changed lastname');
      await setInputFieldValue('#input-user-details-lastname', 'User');
      expect(await saveBtn.getAttribute('truthy')).toBeFalsy('because we changed lastname back');

      // valid change: save button should be enabled after username change
      await setInputFieldValue('#input-user-details-username', `${currentUser}2`);
      expect(await saveBtn.getAttribute('disabled')).toBeFalsy('because we changed username');
      await setInputFieldValue('#input-user-details-username', currentUser);
      expect(await saveBtn.getAttribute('truthy')).toBeFalsy('because we changed username back');

      // valid change: save button should be enabled
      await setInputFieldValue('#input-user-details-email', `${currentUser}@mail.de`);
      expect(await saveBtn.getAttribute('disabled')).toBeFalsy('because we changed the e-mail');

      // // invalid change: save button should be disable dagain
      await setInputFieldValue('#input-user-details-email', 'valid.user');
      expect(await saveBtn.getAttribute('disabled')).toBeTruthy('because a field value was changed to invalid');

      // valid change: save button should be enabled
      await setInputFieldValue('#input-user-details-email', `${currentUser}@mail.com`);
      expect(await saveBtn.getAttribute('disabled')).toBeTruthy('because we changed the e-mail back to the valid original');
    });

    it('should change status of other user to disabled when disabling their account', async () => {
      // print to logger for CI
      logger.info('    users/editing users: it should change status of other user to disabled when disabling their account');

      // open edit user modal
      const currentUser = await getTestUser(true);
      const tr = element(by.cssContainingText('.e-row', currentUser));
      await tr.element(by.css(ICONCLASS_EDIT)).element(by.xpath('ancestor::button')).click();

      const toggleButton = element(by.css('#toggle-user-details-lock'));
      const toggleButtonParent = toggleButton.element(by.xpath('..'));

      // button labels and text
      const notLocked = getTranslation('USERS.IS_NOT_LOCKED');
      const isLocked = getTranslation('USERS.IS_LOCKED');

      let buttonValue = await toggleButton.getAttribute('ng-reflect-value');
      expect(buttonValue).toBeFalsy(`but the value is ${buttonValue} instead`);

      expect(toggleButtonParent.element(by.cssContainingText('label.modal-radio-input', notLocked)).isPresent()).toBeTruthy();

      await toggleButton.element(by.css('.e-switch-wrapper')).click();

      buttonValue = await toggleButton.getAttribute('ng-reflect-value');
      expect(buttonValue).toBeTruthy(`but the value is ${buttonValue} instead`);
      expect(await toggleButtonParent.element(by.cssContainingText('label.modal-radio-input', isLocked)).isPresent()).toBeTruthy();

      // toggle it back
      await toggleButton.element(by.css('.e-switch-wrapper')).click();
    });

    // TODO [Baumgarten] currently broken
    it('should change password of other user only after the correct supervisor password has been entered', async () => {
      // print to logger for CI
      logger.info(
        '    users/editing users: it should change password of other user only after the correct supervisor password has been entered',
      );

      const currentUser = await getTestUser(true);
      const tr = element(by.cssContainingText('.e-row', currentUser));
      await tr.element(by.css(ICONCLASS_EDIT)).element(by.xpath('ancestor::button')).click();

      const newPassword = `${VALID_PASSWORD}!`;

      const saveBtn = element(by.css('#btn-user-details-modal-save'));
      const retypePasswordField = '#input-user-details-password-retype';

      // Set a valid new password
      await setInputFieldValue('#input-user-details-password', newPassword);
      await setInputFieldValue(retypePasswordField, newPassword);

      // Save it
      await clickButton(saveBtn);

      // it will show a popup asking for the user's password
      const popup = element(by.cssContainingText('.ng-trigger-dialogContainer', getTranslation('USERS.VERIFY_PASSWORD_MESSAGE')));

      await browser.wait(condition.visibilityOf(popup), BROWSER_WAIT_INTERVAL_MEDIUM, 'because there will be a password confirm prompt');

      await setInputFieldValue('#input-confirm-input-dialog', '123');
      await clickButton(element(by.css('#btn-input-dialog-confirm')));

      await browser.wait(condition.invisibilityOf(popup), BROWSER_WAIT_INTERVAL_MEDIUM, 'because we just closed it');

      /*
       * Check that the other user's password was not changed. Can't change for save button visibility here
       */
      expect(element(by.css(retypePasswordField)).isPresent()).toBeTruthy('because the password was not changed');

      await clickButton(saveBtn);

      await browser.wait(condition.visibilityOf(popup), BROWSER_WAIT_INTERVAL_MEDIUM, 'because we clicked the save button again');

      await setInputFieldValue('#input-confirm-input-dialog', 'supervisor');
      await clickButton(element(by.css('#btn-input-dialog-confirm')));

      await browser.wait(condition.invisibilityOf(popup), BROWSER_WAIT_INTERVAL_MEDIUM, 'because we just closed it');

      /*
       * Check that the other user's password was changed: Value of "password" is empty, retype password field is hidden
       */
      await assertInputElementValue('#input-user-details-password', null);
      const retypeField = element(by.css(retypePasswordField));
      browser.wait(
        condition.invisibilityOf(retypeField),
        BROWSER_WAIT_INTERVAL_SHORT,
        'because the password retype field should be hidden if no change was detected',
      );

      try {
        const btns = element.all(by.css('.modal-button'));
        await btns.last().click();
      } catch (e) {
        logger.info('could not close modal after end of test. This is unlikely to cause problems: %o', e);
      }
    });

    it('should auto update the grid on saving edited user info', async () => {
      const currentUser = await getTestUser(true);

      // print to logger for CI
      logger.info(
        '    users/editing users: it should auto update the grid on changing e-mail of %o to %o',
        currentUser,
        `${currentUser}@mail.de`,
      );

      const tr = element(by.cssContainingText('.e-row', currentUser));
      expect(await tr.element(by.cssContainingText('.e-rowcell', `${currentUser}@mail.de`)).isPresent()).toBeFalsy(
        `because the e-mail address is currently '${currentUser}@mail.com'`,
      );

      await tr.element(by.css(ICONCLASS_EDIT)).element(by.xpath('ancestor::button')).click();

      const saveBtn = element(by.css('#btn-user-details-modal-save'));
      // valid change: save button should be enabled
      await setInputFieldValue('#input-user-details-email', `${currentUser}@mail.de`);
      expect(await saveBtn.getAttribute('disabled')).toBeFalsy('because we changed the e-mail');

      // we click the save button. The modal will not close, but the data will update and the save button will disable.
      await clickButton(saveBtn);

      // await waitForCssAttribute(saveBtn, 'disabled', 'true');
      expect(await waitForCssAttribute(saveBtn, 'disabled', 'true')).toBeTruthy('because the data was saved');
      await assertInputElementValue('#input-user-details-email', `${currentUser}@mail.de`);

      await waitForModalAndClose('#modal-user-details', undefined, undefined, CSS_SEL_ANY_CANCELBTN);
      await browser.waitForAngular();

      return waitForElementByString(
        '*',
        `${currentUser}@mail.de`,
        undefined,
        'because the grid should update after we changed the e-mail address',
      );
    });
  });

  //  __  __         _      _
  // |  \/  |___  __| |__ _| |
  // | |\/| / _ \/ _` / _` | |
  // |_|  |_\___/\__,_\__,_|_|

  describe('the modal', () => {
    it('should spawn an edit modal dialog on clicking the edit icon', async () => {
      // print to logger for CI
      logger.info('    users/the modal: it should spawn an edit modal dialog on clicking the edit icon');

      expect(element(by.css('#table-user-list')).isPresent()).toBeTruthy();
      expect(element(by.css('#app-user-details.ng-star-inserted')).isPresent()).toBeFalsy();
      await element.all(by.css('span.icon.icon-edit-01')).first().click();
      expect(element(by.css('#modal-user-details')).isPresent()).toBeTruthy('because edit modal dialog should pop up now');
    });

    it('should close the modal dialog on clicking cancel button on add modal', async () => {
      // print to logger for CI
      logger.info('    it should close the modal dialog on clicking cancel button on add modal');

      expect(element(by.css('#table-user-list')).isPresent()).toBeTruthy();
      await element(by.css('#btn-user-add')).click();
      expect(element(by.css('#modal-user-add')).isPresent()).toBeTruthy();
      await clickButton(element(by.css('#btn-user-add-modal-cancel')));

      const addButton = element(by.css('#modal-user-add'));
      browser.wait(condition.invisibilityOf(addButton), 3000).then(async () => {
        expect(addButton.isPresent()).toBeFalsy('because modal-user-add-dialog should be closed');
      });
    });

    it('should validate for user modal', async () => {
      // print to logger for CI
      logger.info('    users/the modal: it should validate forms errors and show warnings on add user modal');

      const requiredField = getTranslation('USERS.PROFILE_REQUIRED_FIELD');
      const invalidEmail = getTranslation('USERS.INVALID_EMAIL_TEXT');
      const insecurePassword = getTranslation('USERS.INSECURE_PASSWORD_TEXT');
      const pwNotEqual = getTranslation('USERS.PASSWORDS_NOT_EQUAL');

      const testCases = [
        { id: 'input-user-add-mail', value: 'abc@def', expected: '' }, // Expect no errors, this is a valid address
        { id: 'input-user-add-firstname', value: '', expected: requiredField }, // Required field
        { id: 'input-user-add-lastname', value: '', expected: requiredField }, // Required field
        { id: 'input-user-add-mail', value: '', expected: requiredField }, // Required field
        { id: 'input-user-add-mail', value: 'abc', expected: invalidEmail },
        { id: 'input-user-add-mail', value: 'abc.com', expected: invalidEmail },
        { id: 'input-user-add-username', value: '', expected: requiredField }, // Required field
        {
          id: 'input-user-add-password',
          value: 'a',
          expected: insecurePassword,
        },
        {
          id: 'input-user-add-password-retype',
          value: 'a',
          expected: pwNotEqual,
        },
      ];

      expect(await element(by.css('#table-user-list')).isPresent()).toBeTruthy();
      await clickButton(element(by.css('#btn-user-add')));

      for (let i = 0; i < testCases.length; i += 1) {
        const current = testCases[i];
        await typeValidUser();
        const fieldName = (current.id.indexOf('#') === 0 ? '' : '#') + current.id;
        expect(await element.all(by.css('.alert.alert-danger')).count()).toEqual(0);
        await setInputFieldValue(fieldName, current.value, true);

        if (0 === current.expected.length) {
          // empty string: No errors should be given
          expect(element.all(by.css('.alert.alert-danger')).count()).toEqual(0, `during ${JSON.stringify(current)}`);
        } else {
          await browser.wait(
            condition.visibilityOf(element(by.cssContainingText('.alert', current.expected))),
            BROWSER_WAIT_INTERVAL_SHORT,
            `no alert found for tests ${JSON.stringify(current)}`,
          );
        }
      }
    });
  });
});
