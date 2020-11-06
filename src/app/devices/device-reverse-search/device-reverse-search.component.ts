import { DevicesService } from 'src/app/core/services';
import {
  Component, OnInit, Inject, ViewChild, OnDestroy, NgZone,
} from '@angular/core';
import { ModalButtonData } from 'src/app/shared/components/modal-dialog/modal-dialog/modal-dialog.component';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { QuestionDialogComponent } from 'src/app/shared/components/modal-dialog/question-dialog/question-dialog.component';
import { NotificationService } from 'src/app/core/services/local-services';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { ListBoxComponent } from '@syncfusion/ej2-angular-dropdowns';
import { interval, Observable, Subscription } from 'rxjs';

export interface DialogData {
  title?: string;
  message: string;
  params?: Object;
}
@Component({
  selector: 'app-device-reverse-search',
  templateUrl: './device-reverse-search.component.html',
  styleUrls: ['./device-reverse-search.component.scss'],
})
export class DeviceReverseSearchComponent implements OnInit, OnDestroy {
  @ViewChild('listboxReference') listBoxReference: ListBoxComponent;

  private pollIntervalSource: Observable<number>;

  private pollInterval = 1000;

  private subscription: Subscription;

  buttons: ModalButtonData[] = [
    {
      name: _('GLOBAL.QUIT_BUTTON_TEXT'), type: 'cancel', eventName: 'close', id: 'btn-question-dialog-close',
    },
  ];

  foundDevices: string[];

  constructor(
    public dialogRef: MatDialogRef<QuestionDialogComponent>,
    private deviceService: DevicesService,
    private notificationService: NotificationService,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private ngZone: NgZone,
  ) { }

  ngOnInit() {
    this.startReverseSearch();
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    this.pollIntervalSource = null;
  }

  private startReverseSearch(): void {
    this.deviceService.startLocateDeviceReverse().subscribe(
      (ok) => {
        this.pollIntervalSource = interval(this.pollInterval);
        // Polling done outside angular zone to make e2e tests work.
        this.ngZone.runOutsideAngular(() => {
          this.subscription = this.pollIntervalSource.subscribe((x) => {
            // Return to angular zone.
            this.ngZone.run(() => {
              this.pollReverseSearch();
            });
          });
        });
      },
      (err) => {
        this.notificationService.notify(_('DEVICES.COULD_NOT_START_DEVICE_SEARCH'));
        console.error(err);
      },
    );
  }

  private pollReverseSearch(): void {
    this.deviceService.locateDeviceReverse().subscribe(
      (found) => {
        this.foundDevices = found;
      },
      (err) => {
        // fail silently and hope for next request to succeed
        console.error(err);
      },
    );
  }

  // API-response not testable. This probably is needed to handle updates in future versions.
  private refreshDropdownList(): void {
    this.listBoxReference.dataSource = null;
    this.listBoxReference.dataSource = this.foundDevices;
  }

  public closeDialog(result?: boolean): void {
    this.dialogRef.close(result);
  }

  public onButtonEvent(eventName: string): void {
    switch (eventName) {
      case 'close': {
        this.closeDialog(false);
        break;
      }
      case 'confirm': {
        this.closeDialog(true);
        break;
      }
      default: {
        console.error('ERROR: User add component: onButtonEvent triggered with unhandled event name');
      }
    }
  }
}
