import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { MessageOutputDto, MessagesService } from 'src/app/core/services';
import { MessageToolsService, NotificationService } from 'src/app/core/services/local-services';
import { ModalButtonData } from 'src/app/shared/components/modal-dialog/modal-dialog/modal-dialog.component';
import { ButtonType } from 'src/app/shared/lib/viega-common/lib/button';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-notification-details',
  templateUrl: './notification-details.component.html',
  styleUrls: ['./notification-details.component.scss'],
})
export class NotificationDetailsComponent implements OnInit {
  buttons: ModalButtonData[];

  hideViewedTime: boolean = environment.hideViewedTime;

  constructor(
    public dialogRef: MatDialogRef<NotificationDetailsComponent>,
    @Inject(MAT_DIALOG_DATA) public notificationDetails: MessageOutputDto,
    public notificationsService: MessagesService,
    private messageToolsService: MessageToolsService,
    private notificationService: NotificationService,
  ) {
    // TODO (Reger): MessageOutputDto enthält nicht mehr deviceName. Woher bekommen wir die Info nun?
  }

  ngOnInit() {
    this.initializeButtons();
  }

  public onButtonEvent(eventName: string): void {
    switch (eventName) {
      case 'close': {
        this.closeDialog();
        break;
      }
      case 'acknowledgement': {
        this.onAcknowledge(this.notificationDetails.rowId);
        break;
      }
      case 'fixed': {
        this.onFix(this.notificationDetails.rowId);
        break;
      }
      default: {
        console.error('ERROR: User add component: onButtonEvent triggered with unhandled event name');
      }
    }
  }

  private onAcknowledge(msgUuid: number): void {
    this.notificationsService.setMessageAcknowledged(msgUuid).subscribe(
      (ok) => {
        this.dialogRef.close();
        this.notificationService.notify(_('NOTIFICATIONS.ACKNOWLEDGE_SUCCESS'));
      },
      (err) => {
        this.notificationService.notify(_('NOTIFICATIONS.COULD_NOT_ACKNOWLEDGE'));
        console.error(err);
      },
    );
  }

  private onFix(msgUuid: number): void {
    this.notificationsService.setMessageFixed(msgUuid).subscribe(
      (ok) => {
        this.dialogRef.close();
        this.notificationService.notify(_('NOTIFICATIONS.RESOLVE_SUCCESS'));
      },
      (err) => {
        this.notificationService.notify(_('NOTIFICATIONS.COULD_NOT_FIX'));
        console.error(err);
      },
    );
  }

  private closeDialog(): void {
    this.dialogRef.close();
  }

  public getMessageParameters(jsonString: string): Object {
    return this.messageToolsService.getMessageParameters(jsonString);
  }

  private initializeButtons(): void {
    this.buttons = [];
    if (!this.notificationDetails.fixedTime) {
      const nextStateButton = !this.notificationDetails.acknowledgedTime ? {
        name: _('NOTIFICATIONS.CONFIRM'),
        type: 'primary' as ButtonType,
        eventName: 'acknowledgement',
        id: 'btn-user-details-modal-ack',
      } : {
        name: _('NOTIFICATIONS.RESOLVE'),
        type: 'primary' as ButtonType,
        eventName: 'fixed',
        id: 'btn-user-details-modal-fix',
      };
      this.buttons.push(nextStateButton);
    }
    this.buttons.push(
      {
        name: _('NOTIFICATIONS.CANCEL'), type: 'cancel', eventName: 'close', id: 'btn-user-details-modal-cancel',
      },
    );
  }
}
