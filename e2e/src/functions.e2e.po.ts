import { browser, by, element } from 'protractor';

export class FunctionsManagement {
  async createFunction(): Promise<string> {
    const testFunction = this.generateFunctionName();
    const nextButton = element(by.id('next'));
    const saveButton = element(by.id('save'));

    element(by.css('#btn-function-add')).click();
    element(by.css('#input-func-name')).click();
    element(by.css('#input-func-name')).clear();
    element(by.css('#input-func-name')).sendKeys(testFunction);
    element(by.id('funct-type-radio')).all(by.tagName('label')).get(0).click();
    nextButton.click();
    nextButton.click();
    await saveButton.click();
    return testFunction;
  }

  generateFunctionName(): string {
    const randomString = (Math.random() + 1).toString(36).substr(2, 5);
    return `Test function  ${randomString}`;
  }

  async deleteFunction(functionName: string) {
    const functionRow = element(by.cssContainingText('.e-row', functionName));
    await functionRow.all(by.deepCss('.icon-cross-01')).get(0).click();
    element(by.css('#btn-question-dialog-confirm')).click();
    await browser.waitForAngular();
  }
}
