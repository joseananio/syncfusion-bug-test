import { Component, Inject, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import {
  DevicesOutputDto,
  DteFunctionTestService,
  ManagementService,
} from 'src/app/core/services';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { DevicesService } from '../../core/services/api/devices.service';
import { AuthenticationService, NotificationService } from '../../core/services/local-services';
import { flattenException } from '../../shared/utils/exception-utils';
import { DialogueNotificationDirective } from '../../shared/components/modal-dialog/dialogue-notification.directive';

// eslint-disable-next-line no-shadow
export enum FunctionTestConstants {
  SUCCESS = 'Success',
  RESTART = 'restart',
  SKIP = 'skip',
  NEXT = 'next',
  CANCEL = 'cancelTest',
  CLOSE = 'close',
  BACK = 'back',
}
@Component({
  selector: 'app-device-details-function-test-hardware',
  templateUrl: './device-details-function-test-hardware.component.html',
  styleUrls: ['./device-details-function-test-hardware.component.scss'],
})
export class DeviceDetailsFunctionTestHardwareComponent extends DialogueNotificationDirective {
  intervalHours = 24;

  message: string = null;

  @Input()
  device: DevicesOutputDto;

  currentTestName: any;

  testFinished: boolean;

  constructor(
    public router: Router,
    public mgmtService: ManagementService,
    public devicesService: DevicesService,
    public dteFunctionTestService: DteFunctionTestService,
    public dialog: MatDialog,
    public notificationService: NotificationService,
    public translate: TranslateService,
    @Inject('AuthService') protected authService: AuthenticationService,
  ) {
    super(dialog, notificationService);
    this.emitChangeOnDialog = true;
    this.btns = [
      {
        name: _('GLOBAL.CANCEL_BUTTON_TEXT'), type: 'cancel', eventName: 'cancelTest', id: 'functiontest-dialog-cancel', class: 'btn-left',
      }, // CANCEL
      {
        name: _('DEVICES.RESTART_CONTROLLER'), type: 'back', eventName: 'restart', id: 'btn-generic-dialog-restart', class: 'btn-left',
      }, // RESTART
      {
        name: _('GLOBAL.NEXT_BUTTON_TEXT'), type: 'primary', eventName: 'next', id: 'functiontest-dialog-next',
      }, // OK
    ];
  }

  protected startTest(): void {
    this.testFinished = false;
    this.devicesService.executeDeviceFunctionTest(this.device.devicePointUUID).subscribe(
      (result) => {
        const msg = this.checkResultAndGetMessage(result);
        if (msg) {
          this.showDialogue('DEVICES.RESULT_TITLE', msg);
        }
      },
      (err) => {
        this.showNotification(this.getErrorMsg(err), { type: this.device.deviceTypeName });
      },
    );
  }

  public onStartTest(): void {
    this.showQuestion(this.device.name, _('DEVICES.FUNCTION_TEST.ALERT'));
  }

  protected onQuestionAnswered(res: boolean) {
    if (res) {
      this.startTest();
    }
  }

  protected finishCurrentTest(): void {
    this.testFinished = true;
    this.closeDialogue();
  }

  protected cancelCurrentTest(): void {
    this.closeDialogue();
  }

  protected restartFunctionTestStep(): void {
    throw new Error('restartFunctionTestStep() not implemented.');
  }

  protected skipCurrentTestCase(): void {
    throw new Error('skipCurrentTestCase() not implemented.');
  }

  protected getNextTextCase(): void {
    throw new Error('getNextTextCase() not implemented.');
  }

  protected checkResultAndGetMessage(result: any): string {
    switch (result) {
      case 'PASSED':
        return _('DEVICES.FUNCTION_TEST.PASSED');
      case 'FAILED':
        return _('DEVICES.FUNCTION_TEST.FAILED');
      case 'DEVICE_UNAVAILABLE':
        return _('DEVICES.DEVICE_UNAVAILABLE');
      case 'DEVICE_NOT_TESTABLE':
        return _('DEVICES.DEVICE_NOT_TESTABLE');
      case FunctionTestConstants.RESTART:
        this.restartFunctionTestStep();
        return null;
      case FunctionTestConstants.SKIP:
        this.skipCurrentTestCase();
        return null;
      case FunctionTestConstants.NEXT:
        this.getNextTextCase();
        return null;
      case FunctionTestConstants.CLOSE:
        this.finishCurrentTest();
        return null;
      case FunctionTestConstants.CANCEL:
        this.cancelCurrentTest();
        return null;
      default:
        return _('DEVICES.FUNCTION_TEST.ERROR');
    }
  }

  protected mergeDefaultParams(params: { [Key: string]: any } = {}): { [Key: string]: any } {
    return { ...params, ...this.device };
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
        return _('DEVICES.FUNCTION_TEST.COULD_NOT_START');
    }
  }
}
