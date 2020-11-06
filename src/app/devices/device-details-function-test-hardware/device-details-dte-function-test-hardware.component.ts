import {
  Component, EventEmitter, Input, Output,
} from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { ETestCaseStatus, TestSeriesResult } from 'src/app/core/services';
import { DteFunctionTestReportMessage, DteReportMessageIDs } from 'src/app/dte-function-test-report/dte-function-test-report.component';
import { FeedbackDialogComponent } from 'src/app/shared/components/modal-dialog/feedback-dialog/feedback-dialog.component';
import { QuestionDialogComponent } from 'src/app/shared/components/modal-dialog/question-dialog/question-dialog.component';
import { DevicesOutputDto } from '../../core/services/model/devicesOutputDto';
import { TestSetInput } from '../../core/services/model/testSetInput';
import { TestStartInput } from '../../core/services/model/testStartInput';
import {
  GeneratedDynamicDialogComponent,
} from '../../shared/components/modal-dialog/generated-dynamic-dialog/generated-dynamic-dialog.component';
import { ModalButtonData, ModalDialogComponent } from '../../shared/components/modal-dialog/modal-dialog/modal-dialog.component';
import { flattenException } from '../../shared/utils/exception-utils';
import { DeviceDetailsFunctionTestHardwareComponent, FunctionTestConstants } from './device-details-function-test-hardware.component';

@Component({
  selector: 'app-device-details-dte-function-test-hardware',
  templateUrl: './device-details-function-test-hardware.component.html',
  styleUrls: ['./device-details-function-test-hardware.component.scss'],
})
export class DeviceDetailsDteFunctionTestHardwareComponent extends DeviceDetailsFunctionTestHardwareComponent {
  eTestCaseStatus = ETestCaseStatus;

  intervalHours = 24;

  message: string = null;

  btns: ModalButtonData[] = [
    {
      name: _('GLOBAL.CANCEL_BUTTON_TEXT'), type: 'cancel', eventName: 'cancelTest', id: 'btn-generic-dialog-cancel', class: 'btn-left',
    }, // CANCEL
    {
      name: _('DEVICES.RESTART_CONTROLLER'), type: 'back', eventName: 'restart', id: 'btn-generic-dialog-restart', class: 'btn-left',
    }, // RESTART
    {
      name: _('GLOBAL.SKIP_BUTTON_TEXT'), type: 'secondary', eventName: 'skip', id: 'btn-generic-dialog-skip',
    }, // SKIP
    {
      name: _('GLOBAL.NEXT_BUTTON_TEXT'), type: 'primary', eventName: 'next', id: 'btn-generic-dialog-next',
    }, // NEXT
    {
      name: _('FUNCTIONS.LABEL_GO_BACK'), type: 'back', eventName: 'back', id: 'btn-generic-dialog-back',
    }, // BACK
    {
      name: _('GLOBAL.QUIT_BUTTON_TEXT'), type: 'cancel', eventName: 'close', id: 'btn-generic-dialog-close',
    }, // CLOSE
  ];

  @Input()
  device: DevicesOutputDto;

  @Output()
  change: EventEmitter<any> = new EventEmitter();

  dialogRef: MatDialogRef<ModalDialogComponent>;

  currentTestData: { [Key: string]: any };

  recentTestId: string;

  protected startTest(): void {
    this.showDteFunctionTest();
  }

  /*
   *
   */
  updateDialogueData(data: { [Key: string]: any }, skipPersistence = false): void {
    if (!data) {
      this.finishCurrentTest(this.recentTestId);
      return;
    }

    if (!skipPersistence) {
      this.currentTestData = data;
      this.recentTestId = this.currentTestData ? this.currentTestData.testId : this.recentTestId;
    }

    if (!data.displayElements || data.displayElements.length === 0) {
      if ('Aborted' === data.status) {
        this.cancelCurrentTest();
        return;
      }
      if ('Success' === data.status) {
        this.getNextTextCase();
        return;
      }
    }
    this.dialogRef.componentInstance.data = data;

    this.dialogRef.componentInstance.setButtonAttribute('skip', 'isHidden', !data.canSkip || this.testFinished);
    this.dialogRef.componentInstance.setButtonAttribute('restart', 'isHidden', !data.canRestart || this.testFinished);
    this.dialogRef.componentInstance.setButtonAttribute('next', 'isHidden', this.testFinished);
    this.dialogRef.componentInstance.setButtonAttribute('cancelTest', 'isHidden', this.testFinished);

    this.dialogRef.componentInstance.setButtonAttribute('back', 'isHidden', !this.testFinished);
    this.dialogRef.componentInstance.setButtonAttribute('close', 'isHidden', !this.testFinished);

    this.dialogRef.componentInstance.setButtonAttribute('cancelTest', 'isDisabled', !data.canCancel);
    this.dialogRef.componentInstance.setButtonAttribute('next', 'isDisabled', data.status !== 'Success');
  }

  private openDynamicDialog(currentData: { [Key: string]: any }, dialogueWidth = '80%'): void {
    try {
      this.currentTestData = currentData;
      this.dialogRef = this.dialog.open(GeneratedDynamicDialogComponent, {
        data: {},
        width: dialogueWidth,
      });
      this.btns.forEach((btn) => {
        this.dialogRef.componentInstance.addButton(btn);
      });

      this.subscribeToDialogueUpdate();
      this.updateDialogueData(currentData);
    } catch (err) {
      this.dialogRef = undefined;
      console.error('couldn\'t open dialogue ref: %o', err);
    }
  }

  private subscribeToDialogueUpdate(): void {
    if (!this.dialogRef) {
      // console.log('subscribeToDialogUpdate: ref is not set');
      return;
    }
    const onInputUpdateSub = this.dialogRef.componentInstance.onUpdate.subscribe(
      (inputData: any) => {
        // If no input data is given at all: The test isn't running anymore
        if (!inputData) {
          return this.finishCurrentTest();
        }

        // If a string is returned instead of an array: It's from one of the dynamically generated buttons
        if (typeof inputData === 'string') {
          return this.checkResultAndGetMessage(inputData);
        }

        const input: TestSetInput = {
          name: inputData.key,
          value: inputData.value,
          testId: this.currentTestData.testId,
        };

        this.dteFunctionTestService.setTestCaseInput(input).subscribe(
          (newData) => {
            // If the status of new data has changed to "SUCCESS": Poll next test case from backend
            if (newData && newData.status === FunctionTestConstants.SUCCESS && (newData.displayElements || []).length === 0) {
              this.getNextTextCase();
              return;
            }

            // Otherwise: Update currently displayed data
            this.updateDialogueData(newData);
          },
          (err) => {
            console.error(err);
            this.showNotification(this.getErrorMsg(err));
          },
        );

        return undefined;
      },
      (err: any) => {
        console.error('error in this.dialogRef.componentInstance.onUpdate: %o', err); // notification is displayed in calling method
      },
    );

    if (onInputUpdateSub) {
      this.dialogRef.afterClosed().subscribe(() => { onInputUpdateSub.unsubscribe(); });
    }
  }

  protected mergeDefaultParams(params: { [Key: string]: any } = {}): { [Key: string]: any } {
    return { ...params, ...this.currentTestData };
  }

  /*
   * Starts the DTE Function Test. If the test will be detected as already running,
   * it will query the user whether they want to restart it.
   */
  private showDteFunctionTest(reuseExistingDialogue = false, currentData?: any): void {
    // for faster debugging
    // reuseExistingDialogue = true;
    const data = currentData || this.currentTestData || {};
    if ('Aborted' === data.status) {
      this.cancelCurrentTest();
    }

    this.testFinished = false;
    if (reuseExistingDialogue && currentData) {
      if (this.dialogRef) {
        this.updateDialogueData(currentData);
      } else {
        this.openDynamicDialog(currentData);
      }
      return;
    }

    let testData = {};
    testData = <TestStartInput>{
      deviceUuid: this.device.devicePointUUID,
      name: this.authService.getUserName(),
    };

    this.dteFunctionTestService.startTest(testData).subscribe(
      (newData) => {
        if (newData) {
          if (reuseExistingDialogue && this.dialogRef) {
            this.updateDialogueData(newData);
          } else {
            this.openDynamicDialog(newData);
          }
        }
      },
      (err) => {
        // Exeption "TestSeriesActive": Will be thrown if a different user has already started a test series.
        const error = flattenException(err);
        if (error.errorType === 'TestSeriesActive') {
          if (error.testerName === this.authService.getUserName() || 'supervisor' === this.authService.getUserName()) {
            this.restartFunctionTest(error.testId, error.testerName);
            return;
          }
          this.showDialogue(error.message, this.getErrorMsg(error, 'COULD_NOT_RESTART'), { startedBy: error.testerName });
          return;
        }
        console.error(error);
        this.showNotification(_('DEVICES.FUNCTION_TEST.COULD_NOT_START'));
      },
    );
  }

  private restartFunctionTest(testId?: string, testerName?: string): void {
    const isOtherUser = testerName && testerName !== this.authService.getUserName();
    this.dialog.open(QuestionDialogComponent, {
      data: {
        title: this.device.name,
        message: this.getErrorMsg({ testerName }, 'RESTART_ALERT'),
        params: { startedBy: isOtherUser ? testerName : undefined },
      },
      width: '50%',
    }).afterClosed().subscribe((res) => {
      if (!res) {
        return;
      }
      this.dteFunctionTestService.finishTest({ testId }).subscribe(
        this.showDteFunctionTest,
        (error) => {
          this.showNotification(this.getErrorMsg(error, 'COULD_NOT_RESTART'));
        },
      );
    });
  }

  private resetTestStep(testId: string = this.recentTestId): void {
    this.testFinished = false;
    this.dteFunctionTestService.restartCurrentTestCase({ testId }).subscribe(
      (data) => this.updateDialogueData(data),
      (error) => {
        console.error(error);
        this.notificationService.notify(_('DEVICES.FUNCTION_TEST.COULD_NOT_RESTART_STEP'), this.currentTestData);
      },
    );
  }

  /**
   * Restarts a test step.
   */
  protected restartFunctionTestStep(testId: string = this.recentTestId): void {
    this.dialog.open(QuestionDialogComponent, {
      data: {
        title: this.device.name,
        message: _('DEVICES.FUNCTION_TEST.STEP_RESTART_ALERT'),
        params: this.currentTestData,
      },
      width: '50%',
    }).afterClosed().subscribe((res) => {
      if (!res) {
        return;
      }
      this.resetTestStep(testId);
    });
  }

  protected skipCurrentTestCase(): void {
    this.dteFunctionTestService.skipTestCase({
      testId: this.recentTestId,
      reason: 'user input',
    }).subscribe(
      (data) => this.updateDialogueData(data),
      (error) => {
        console.error(error);
        this.showNotification(_('DEVICES.FUNCTION_TEST.COULD_NOT_SKIP_STEP'), this.currentTestData);
      },
    );
  }

  protected getNextTextCase(testId: string = this.recentTestId): void {
    this.dteFunctionTestService.nextTestCase({ testId }).subscribe(
      (data) => this.updateDialogueData(data),
      (error) => {
        console.error(error);
        this.notificationService.notify(_('DEVICES.FUNCTION_TEST.COULD_NOT_CONTINUE_STEP'));
      },
    );
  }

  protected cancelCurrentTest(testId: string = this.recentTestId): void {
    const isAborted = 'Aborted' !== this.currentTestData.status;
    if (!isAborted && !this.currentTestData.canCancel) {
      this.updateDialogueData(null);
      return;
    }

    // TODO [Baumgarten] the injected variable and its pointer will be nuked by the call to functionTestService.cancel - why?
    const { dialog } = this;
    const { dialogRef } = this;

    this.dteFunctionTestService.cancel({ testId }).subscribe(
      (data) => {
        this.dialog = this.dialog || dialog;
        this.dialogRef = this.dialogRef || dialogRef;
        this.updateDialogueData(data);
      },
      (err) => {
        console.error(err);
        this.notificationService.notify(_('DEVICES.FUNCTION_TEST.COULD_NOT_CANCEL'));
      },
    );
  }

  private showReport(testId: string = this.recentTestId) {
    this.dteFunctionTestService.getTestResult(testId).subscribe(
      (newData: TestSeriesResult) => {
        const success: boolean = newData.testCaseResults.every(
          (item) => item.testCaseResultStatus === this.eTestCaseStatus.Success,
        );
        if (success) {
          this.testFinished = true;
          const feedback = this.dialog.open(
            FeedbackDialogComponent, { data: { message: this.translate.instant(_('DEVICES.FUNCTION_TEST.SUCESS_DIALOG')) } },
          );
          feedback.afterClosed().subscribe(() => {
            this.openDteFunctionTestReportTab(newData);
            this.closeDialogue();
          });
        } else {
          this.testFinished = true;
          const feedback = this.dialog.open(
            FeedbackDialogComponent, { data: { message: this.translate.instant(_('DEVICES.FUNCTION_TEST.FAIL_DIALOG')) } },
          );
          feedback.afterClosed().subscribe(() => {
            this.openDteFunctionTestReportTab(newData);
            this.closeDialogue();
          });
        }
      },
      (err) => {
        console.error('error in finishTest (getTestResult): %o', flattenException(err));
        this.showNotification(_('ERROR_MESSAGES.FUNCTION_TEST.COULDNT_DISPLAY_PROTOCOL'));
      },
    );
  }

  /**
   * Opens another browser tab containing dteFunctionTestReport.component.ts
   * and handles communication. Child tab receives data argument to display a report.
   * Data is passed via postMessage, hence unique message identifiers are created via SHA-1.
   */
  private openDteFunctionTestReportTab(newData: TestSeriesResult) {
    const url = this.router.serializeUrl(
      this.router.createUrlTree(['/dte-function-test-report']),
    );
    const windowRef = window.open(url, '_blank');
    /**
     * Waits for the tab's component to initialize by waiting for specific message.
     * Declared in this scope to avoid global vars.
     */
    function eventListener(message: MessageEvent) {
      // Checking against unique message
      if (message.data === DteReportMessageIDs.dteFunctionTestReportInit) {
        const sendMessage: DteFunctionTestReportMessage = {
          messageType: DteReportMessageIDs.dteFunctionTestReportData,
          data: newData,
        };
        windowRef.postMessage(
          sendMessage,
          // Post message to correct url of tab
          windowRef.location.toString(),
        );
        // Remove the messageListener after being done
        windowRef.removeEventListener('message', eventListener);
      }
    }
    windowRef.addEventListener('message', eventListener);
  }

  // Will persist this in a boolean so the user can reconsider if the report isn't sufficient yet.
  protected finishCurrentTest(testId: string = this.recentTestId, skipReport = false): void {
    if (!this.testFinished && !skipReport) {
      this.showReport(testId);
      return;
    }

    this.dteFunctionTestService.finishTest({ testId }).subscribe(
      console.log,
      console.error,
    );
    this.currentTestData = null;
    this.closeDialogue();
    this.testFinished = false;
  }

  protected getErrorMsg(err: any, _key?: string): string {
    const error = flattenException(err);
    console.error(error);
    const isOtherUser = error.testerName && error.testerName !== this.authService.getUserName();
    switch (_key || error.errorCode) {
      case 'RESTART_ALERT':
        return isOtherUser ? _('DEVICES.FUNCTION_TEST.RESTART_ALERT_WITH_NAME') : _('DEVICES.FUNCTION_TEST.RESTART_ALERT');
      case 'COULD_NOT_RESTART':
        return isOtherUser ? _('DEVICES.FUNCTION_TEST.COULD_NOT_RESTART_WITH_NAME') : _('DEVICES.FUNCTION_TEST.COULD_NOT_RESTART');
      case 'DEVICE_TYPE_NOT_SUPPORTED':
        return _('DEVICES.FUNCTION_TEST.DEVICE_TYPE_NOT_SUPPORTED');
      default:
        return 'DEVICES.FUNCTION_TEST.COULD_NOT_START';
    }
  }

  protected checkResultAndGetMessage(result: any): string {
    switch (result) {
      case FunctionTestConstants.CANCEL:
        if (this.testFinished) {
          this.cancelCurrentTest();
        } else {
          this.showReport();
        }
        return null;
      case FunctionTestConstants.BACK:
        this.resetTestStep();
        return null;
      case FunctionTestConstants.CLOSE:
        this.cancelCurrentTest();
        return null;
      default:
        return super.checkResultAndGetMessage(result);
    }
  }
}
