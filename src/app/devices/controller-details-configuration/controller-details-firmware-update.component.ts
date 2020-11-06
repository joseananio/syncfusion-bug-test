import { Component, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { Observable } from 'rxjs';
import { ControllerUpdateError, ControllerUpdateStatus, UpdateService } from 'src/app/core/services';
import { FeedbackDialogComponent } from 'src/app/shared/components/modal-dialog/feedback-dialog/feedback-dialog.component';
import { FirmwareDialogData, FirmwareUpdateComponent } from '../firmware-update/firmware-update.component';

/**
 * Modal to update a device's firmware (type TWMS controller).
 */
@Component({
  selector: 'app-device-details-firmware-update',
  templateUrl: '../device-details-firmware-update/device-details-firmware-update.component.html',
  styleUrls: ['../device-details-firmware-update/device-details-firmware-update.component.scss'],
})
export class ControllerDetailsFirmwareConfigurationComponent extends FirmwareUpdateComponent {
  constructor(
    dialog: MatDialog,
    private controllerUpdateService: UpdateService,
    protected router: Router,
    dialogRef?: MatDialogRef<FirmwareUpdateComponent>,
    @Inject(MAT_DIALOG_DATA) data?: FirmwareDialogData,
  ) {
    super(dialog, dialogRef, data);
  }

  /**
   * @override
   */
  protected sendUpdateFile(): Observable<any> {
    return this.controllerUpdateService.postUpdateForm(this.selectedFile, 'events', /* reportProgress */ true);
  }

  /**
   * @override
   */
  protected getUpdateStatus(): Observable<any> {
    return this.controllerUpdateService.getUpdateStatus();
  }

  /**
   * @override
   */
  protected updateRunning(updateStatus: ControllerUpdateStatus): boolean {
    return updateStatus.controllerUpdateError === ControllerUpdateError.UpdateRunning
        || updateStatus.controllerUpdateError === ControllerUpdateError.UpdateSuccessfulRebooting;
  }

  /**
   * @override
   */
  public getAcceptedFirmwareFileExtensions(): string[] {
    return ['.raucb'];
  }

  /**
   * @override
   */
  protected getErrorMsg(ex: any): string {
    return _('ACTIVATION.UPDATE_ERROR_MESSAGE');
  }

  /**
   * @override
   */
  protected finalizeUpdate(updateStatus: ControllerUpdateStatus): void {
    // the backend is still online or online again after reboot

    // "UpdateNotStartedYet" means that the controller was restarted and does not know that
    // an update was just performed.
    if (updateStatus.controllerUpdateError === ControllerUpdateError.MockUpdateSuccessfulWindows
        || updateStatus.controllerUpdateError === ControllerUpdateError.UpdateNotStartedYet) {
      // Hard reload - the frontend code has most likely changed.
      // The forceReload parameter is not standardized, but we _really_ want to use it.
      window.location.reload(true);
    } else {  // an error occurred during the update
      const errorMessages = {
        [ControllerUpdateError.UploadFileFailed]: _('ACTIVATION.UPLOAD_FILE_FAILED'),
        [ControllerUpdateError.UpdateFailedUnknownReason]: _('ACTIVATION.UPDATE_FAILED'),
        [ControllerUpdateError.RaucInfoFailed]: _('ACTIVATION.RAUC_INFO_FAILED'),
        [ControllerUpdateError.UpdateFileProductIdWrongFormat]: _('ACTIVATION.UPDATE_FILE_PRODUCT_ID_WRONG_FORMAT'),
        [ControllerUpdateError.CannotReadControllerSerialNumber]: _('ACTIVATION.CANNOT_READ_CONTROLLER_SERIAL_NUMBER'),
        [ControllerUpdateError.ProductIdIsNotMatching]: _('ACTIVATION.PRODUCT_ID_NOT_MATCHING'),
        [ControllerUpdateError.UnableToGetLocalIssuerCertifcate]: _('ACTIVATION.UNABLE_TO_GET_LOCAL_ISSUER_CERTIFICATE'),
        [ControllerUpdateError.UnableToGetIssuerCertificate]: _('ACTIVATION.UNABLE_TO_GET_ISSUER_CERTIFICATE'),
        [ControllerUpdateError.InvalidCertificate]: _('ACTIVATION.INVALID_CERTIFICATE'),
        [ControllerUpdateError.UpdatedAlreadyInstalled]: _('ACTIVATION.UPDATE_ALLREADY_INSTALLED'),
        [ControllerUpdateError.UpdateIsOlderThanCurrentVersion]: _('ACTIVATION.UPDATE_OLDER_THAN_CURRENT'),
        [ControllerUpdateError.DecryptingUpdateFileFailed]: _('ACTIVATION.DECRYPTING_UPDATE_FILE_FAILED'),
      };
      console.error(updateStatus);
      this.dialog.open(FeedbackDialogComponent, {
        data: {
          message: errorMessages[updateStatus.controllerUpdateError] || _('ACTIVATION.UPDATE_FAILED'),
          params: updateStatus,
        },
      }).afterClosed().subscribe(() => {
        this.router.navigate(['devices']);
      });
    }
  }

  /**
   * @override
   */
  protected handleFailedUpdateStatusCheck(error: any): void {
    // Using the endpoint without authorization was turned off by update
    if (error.error && error.error.errorType === 'UNAUTHORIZE') {
      window.location.reload(true);
    }
    // else: server not running again yet - keep polling
  }
}
