import { Component, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { Observable } from 'rxjs';
import { DeviceUpdateGeneralStatus, DeviceUpdateService, DeviceUpdateStatus } from 'src/app/core/services';
import { NotificationService } from 'src/app/core/services/local-services';
import { FeedbackDialogComponent } from 'src/app/shared/components/modal-dialog/feedback-dialog/feedback-dialog.component';
import { environment } from 'src/environments/environment';
import { FirmwareDialogData, FirmwareUpdateComponent } from '../firmware-update/firmware-update.component';

/**
 * Modal to update a device's firmware.
 */
@Component({
  selector: 'app-device-details-firmware-update',
  templateUrl: './device-details-firmware-update.component.html',
  styleUrls: ['./device-details-firmware-update.component.scss'],
})
export class DeviceDetailsFirmwareUpdateComponent extends FirmwareUpdateComponent {
  constructor(
    dialog: MatDialog,
    private deviceUpdateService: DeviceUpdateService,
    private notificationService: NotificationService,
    dialogRef?: MatDialogRef<FirmwareUpdateComponent>,
    @Inject(MAT_DIALOG_DATA) data?: FirmwareDialogData,
  ) {
    super(dialog, dialogRef, data);
  }

  /**
   * @override
   */
  protected sendUpdateFile(): Observable<any> {
    return this.deviceUpdateService.installDeviceFirmwareToDeviceForm(this.data.deviceUuid, this.selectedFile, 'events', true);
  }

  /**
   * @override
   */
  protected getUpdateStatus(): Observable<any> {
    return this.deviceUpdateService.getUpdateStatus(this.data.deviceUuid);
  }

  /**
   * @override
   */
  protected updateRunning(updateStatus: DeviceUpdateStatus): boolean {
    return updateStatus.deviceUpdateGeneralStatus === DeviceUpdateGeneralStatus.UpdateRunning;
  }

  /**
   * @override
   */
  public getAcceptedFirmwareFileExtensions(): string[] {
    const result = ['.tar'];
    if (environment.allowUnsignedDeviceFirmwareFiles) {
      result.push('.bin');
    }
    return result;
  }

  /**
   * @override
   */
  protected getErrorMsg(ex: any): string {
    // super ugly, but not having this will break our l18n-workflow
    switch (ex.errorCode) {
      case 'DEVICE_NOT_FOUND':
        return _('DEVICES.FIRMWARE_UPDATE.DEVICE_NOT_FOUND');
      case 'CANNOT_EXTRACT_FILE':
        return _('DEVICES.FIRMWARE_UPDATE.CANNOT_EXTRACT_FILE');
      case 'FAILED':
        return _('DEVICES.FIRMWARE_UPDATE.FAILED');
      case 'FILE_IS_MISSING':
        return _('DEVICES.FIRMWARE_UPDATE.FILE_IS_MISSING');
      case 'INVALID_FILE':
        return _('DEVICES.FIRMWARE_UPDATE.INVALID_FILE');
      case 'ONLY_TAR_FILES_ALLOWED':
        return _('DEVICES.FIRMWARE_UPDATE.ONLY_TAR_FILES_ALLOWED');
      case 'REMOTE_DEVICE_ALERT':
        return _('DEVICES.FIRMWARE_UPDATE.REMOTE_DEVICE_ALERT');
      case 'REMOTE_DEVICE_ALERT_MSG':
        return _('DEVICES.FIRMWARE_UPDATE.REMOTE_DEVICE_ALERT_MSG');
      case 'SUCCESS':
        return _('DEVICES.FIRMWARE_UPDATE.SUCCESS');
      default:
        if (ex.error && ex.error.error
            && ex.error.error.deviceFirmwareTarFile.some((item) => item === 'REGEX_NOT_MATCH ALLOWED_DEVICE_FIRMWARE_UPDATE_FILE_NAME')
        ) {
          return _('DEVICES.FIRMWARE_UPDATE.INVALID_FILE');
        }

        return _('DEVICES.FIRMWARE_UPDATE.INVALID_FILE');
    }
  }

  /**
   * @override
   */
  protected finalizeUpdate(updateStatus: DeviceUpdateStatus): void {
    const message = (updateStatus.deviceUpdateGeneralStatus === DeviceUpdateGeneralStatus.UpdateSuccessful)
      ? _('DEVICES.FIRMWARE_UPDATE.SUCCESS')
      : _('ACTIVATION.UPDATE_FAILED');

    this.dialog.open(FeedbackDialogComponent, {
      data: {
        message,
      },
    });
  }

  /**
   * @override
   */
  protected handleFailedUpdateStatusCheck(error: any): void {
    // should usually not happen (other than when doing a controller update)
    console.error(error);
    this.notificationService.notify(_('DEVICES.COULD_NOT_GET_UPDATE_STATUS'));
  }
}
