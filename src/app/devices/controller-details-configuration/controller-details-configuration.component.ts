import {
  Component, OnInit, Input, Output, EventEmitter,
} from '@angular/core';
import { ControllerOutputDto, UpdateService } from 'src/app/core/services';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { MatDialog } from '@angular/material/dialog';
import { Subscription, throwError, timer } from 'rxjs';
import { concatMap } from 'rxjs/operators';
import { FirmwareDialogData } from '../firmware-update/firmware-update.component';
import {
  ControllerDetailsFirmwareConfigurationComponent,
} from '../controller-details-configuration/controller-details-firmware-update.component';
import { QuestionDialogComponent } from '../../shared/components/modal-dialog/question-dialog/question-dialog.component';

@Component({
  selector: 'app-controller-details-configuration',
  templateUrl: './controller-details-configuration.component.html',
})
export class ControllerDetailsConfigurationComponent implements OnInit {
  private deviceUpdateSubscription: Subscription;

  onDeviceFirmwareUpdated: EventEmitter<string> = new EventEmitter();

  constructor(
      protected dialog: MatDialog,
      private deviceUpdateService: UpdateService,
  ) { }

  @Input()
  public deviceController: ControllerOutputDto;

  @Output()
  change: EventEmitter<any> = new EventEmitter();

  public onClickDeviceFirmwareUpdate(): void {
    if (this.deviceController.isRemoteController && this.deviceController.ipAddress) {
      this.dialog.open(QuestionDialogComponent, {
        data: {
          title: _('DEVICES.FIRMWARE_UPDATE.REMOTE_DEVICE_ALERT'),
          message: _('DEVICES.FIRMWARE_UPDATE.REMOTE_DEVICE_ALERT_MSG'),
          params: { address: this.deviceController.ipAddress },
        },
        width: '30%',
      }).afterClosed().subscribe(
        (res) => {
          if (res) {
            window.open(this.deviceController.ipAddress, '_blank');
            this.change.emit();
          }
        },
      );
      return;
    }

    const deviceTypeName = 'Controller';
    const firmWareUpdateDialogData: FirmwareDialogData = {
      message: _('DEVICES.SELECT_UPDATE_FILE_ALERT'),
      params: { deviceTypeName },
      deviceUuid: this.deviceController.uuid,
      onDeviceUpdated: this.onDeviceFirmwareUpdated,
    };

    this.dialog.open(ControllerDetailsFirmwareConfigurationComponent, {
      data: firmWareUpdateDialogData,
      width: '30%',
    });
    this.change.emit();
  }

  ngOnInit() {
    this.onDeviceFirmwareUpdated.subscribe(() => {
      this.deviceUpdateSubscription = timer(0, 5000).pipe(
        concatMap(() => this.deviceUpdateService.getUpdateStatus()),
      ).subscribe((res) => {
        if (!res.controllerUpdateError) {
          this.deviceUpdateSubscription.unsubscribe();
        } else {
          return throwError(`received an error when trying to update device firmware: ${res}`);
        }

        return undefined;
      });
    });
  }
}
