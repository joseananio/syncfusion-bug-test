import {
  Component, EventEmitter, Inject, Input, Output,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { DevicesOutputDto } from 'src/app/core/services';
import { DialogueNotificationDirective } from '../../shared/components/modal-dialog/dialogue-notification.directive';
import {
  DevicesService, DteFunctionTestService, FunctionDto, ManagementService,
} from '../../core/services';
import { AuthenticationService, NotificationService } from '../../core/services/local-services';

@Component({
  selector: 'app-device-details-function-test-software',
  templateUrl: './device-details-function-test-software.component.html',
  styleUrls: ['./device-details-function-test-software.component.scss'],
})
export class DeviceDetailsFunctionTestSoftwareComponent extends DialogueNotificationDirective {
  @Input()
  device: DevicesOutputDto;

  @Output()
  change: EventEmitter<any> = new EventEmitter();

  constructor(
    public mgmtService: ManagementService,
    public devicesService: DevicesService,
    public dteFunctionTestService: DteFunctionTestService,
    public dialog: MatDialog,
    public notificationService: NotificationService,
    @Inject('AuthService') protected authService: AuthenticationService,
  ) {
    super(dialog, notificationService);
  }

  private canStartFunctionTest(): boolean {
    let deviceFunctions: FunctionDto[];
    this.mgmtService.getFunctionsForDevicePoint(this.device.devicePointUUID).subscribe((functions) => { deviceFunctions = functions; });
    return Array.isArray(deviceFunctions);
  }

  private showDeviceFunctionTest(): void {
    if (!this.canStartFunctionTest()) {
      this.showDialogue(_('DEVICES.FUNCTION_TEST.COULD_NOT_START'), _('DEVICES.FUNCTION_TEST.NO_FUNCTIONS_ASSIGNED'));
      return;
    }

    this.devicesService.executeDeviceFunctionTest(this.device.devicePointUUID).subscribe(
      (result) => {
        const msg = null;
        if (msg) {
          this.showDialogue(_('DEVICES.RESULT_TITLE'), msg);
          this.change.emit();
        }
      },
      (err) => {
        this.notificationService.notify('', { type: this.device.deviceTypeName });
      },
    );
  }
}
