import { HttpEventType } from '@angular/common/http';
import {
  OnInit, OnDestroy, ElementRef, EventEmitter, Inject, ViewChild, Component,
} from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { interval, Observable, Subscription } from 'rxjs';
import { FeedbackDialogComponent } from 'src/app/shared/components/modal-dialog/feedback-dialog/feedback-dialog.component';
import { ModalButtonData } from 'src/app/shared/components/modal-dialog/modal-dialog/modal-dialog.component';
import { flattenException } from '../../shared/utils/exception-utils';

// TODO (Reger) add vars needed e.g. uuid
export interface FirmwareDialogData {
  message: string;
  params?: Object;
  deviceUuid: string;
  onDeviceUpdated?: EventEmitter<string>;
}

/**
 * Shared base class for device and controller updates.
 */
@Component({
  template: '',
})
export abstract class FirmwareUpdateComponent implements OnInit, OnDestroy {
  protected static POLLING_INTERVAL = 3000;

  @ViewChild('fileInput') fileInput: ElementRef;

  public fileOutput: string;

  public uploadProgress = undefined;

  public isLocked = false;

  public isWaitingForUpdateEnd = false;

  public buttons: ModalButtonData[] = [
    {
      name: _('DEVICES.UPLOAD'),
      type: 'primary',
      eventName: 'confirm',
      id: 'btn-input-dialog-confirm',
      isDisabled: true,
    },
    {
      name: _('GLOBAL.CLOSE_BUTTON_TEXT'),
      type: 'cancel',
      eventName: 'close',
      id: 'btn-input-dialog-close',
    },
  ];

  protected selectedFile: File;

  private intervalSubscription: Subscription;

  private uploadSubscription: Subscription;

  constructor(
    protected dialog: MatDialog,
    private dialogRef?: MatDialogRef<FirmwareUpdateComponent>,
    @Inject(MAT_DIALOG_DATA) public data?: FirmwareDialogData,
  ) {
    if (dialogRef) {
      // Disable native backdrop close and return null
      this.dialogRef.disableClose = true;
      this.dialogRef.backdropClick().subscribe(() => {
        // Only allow backdrop close if not uploading
        if (!this.isLocked) {
          this.dialogRef.close(null);
        }
      });
    }
  }

  /**
   * Make sure to call this in subclass implemnentations of the function.
   */
  public ngOnInit(): void {
    this.getUpdateStatus().subscribe((updateStatus: any) => {
      if (this.updateRunning(updateStatus)) {
        // looks like the site has been reloaded during a running update
        this.waitForUpdateEnd();
      }
    }, (error) => {
      // ignore this and assume that update not started yet
    });
  }

  public ngOnDestroy(): void {
    // stop polling when closing
    if (this.intervalSubscription) {
      this.intervalSubscription.unsubscribe();
    }

    // cancel upload when closing
    if (this.uploadSubscription) {
      this.uploadSubscription.unsubscribe();
    }
  }

  protected abstract sendUpdateFile(): Observable<any>;

  protected abstract getUpdateStatus(): Observable<any>;

  protected abstract updateRunning(updateStatus: any): boolean;

  protected abstract finalizeUpdate(updateStatus: any);

  protected abstract handleFailedUpdateStatusCheck(error: any): void;

  protected abstract getErrorMsg(error): string;

  public abstract getAcceptedFirmwareFileExtensions(): string[];

  private waitForUpdateEnd(): void {
    this.isWaitingForUpdateEnd = true;
    this.intervalSubscription = interval(FirmwareUpdateComponent.POLLING_INTERVAL).subscribe(() => {
      this.getUpdateStatus().subscribe(
        (updateStatus: any) => {
          if (!this.updateRunning(updateStatus)) {
            // now the update is finished
            this.intervalSubscription.unsubscribe();
            this.isWaitingForUpdateEnd = false;
            this.isLocked = false;
            this.finalizeUpdate(updateStatus);
          }
        },
        (error) => {
          this.handleFailedUpdateStatusCheck(error);
        },
      );
    });
  }

  public onStartDeviceFirmwareUpdate(): void {
    this.uploadProgress = 0;
    this.buttons[0].isDisabled = true;
    this.isLocked = true;
    if (this.data) {
      this.data.onDeviceUpdated.emit(this.data.deviceUuid);
    }
    this.uploadSubscription = this.sendUpdateFile().subscribe(
      (result) => {
        switch (result.type) {
          case HttpEventType.UploadProgress: {
            this.uploadProgress = Math.floor((100 * result.loaded) / result.total);
            break;
          }
          case HttpEventType.Response: {
            this.uploadProgress = undefined;
            this.waitForUpdateEnd();
            break;
          }
          default: {
            // do nothing
            break;
          }
        }
      },
      (error) => {
        const ex = flattenException(error, true);
        console.error(error);

        this.uploadProgress = undefined;
        this.isLocked = false;
        this.dialog.open(FeedbackDialogComponent, {
          data: {
            title: _('DEVICES.FIRMWARE_UPDATE.FAILED'),
            message: this.getErrorMsg(ex),
            params: {
              title: _('DEVICES.FIRMWARE_UPDATE.FAILED'),
              firmwareFileName: this.selectedFile.name,
            },
          },
        });
      },
    );
  }

  public onButtonEvent(eventName: string): void {
    switch (eventName) {
      case 'confirm': {
        this.onStartDeviceFirmwareUpdate();
        break;
      }
      case 'close': {
        if (this.dialogRef) {
          this.dialogRef.close(null);
        }
        break;
      }
      default: {
        console.error('ERROR: User add component: onButtonEvent triggered with unhandled event name');
      }
    }
  }

  public onBrowseClick(event: MouseEvent): void {
    event.preventDefault();
    this.fileInput.nativeElement.click();
  }

  public onFileSelect(event): void {
    const fileSelected = !!event.target.files.length;

    this.selectedFile = fileSelected ? event.target.files[0] : undefined;
    this.fileOutput = fileSelected ? this.selectedFile.name : undefined;
    this.buttons[0].isDisabled = !fileSelected;
  }
}
