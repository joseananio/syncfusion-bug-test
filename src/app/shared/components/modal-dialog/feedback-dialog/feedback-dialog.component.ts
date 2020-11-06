import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { ModalButtonData, ModalDialogComponent, ModalDialogData } from '../modal-dialog/modal-dialog.component';

export interface DialogData extends ModalDialogData {
  message: string;
  params?: Object;
  title?: string;
}

@Component({
  selector: 'app-feedback-dialog',
  templateUrl: './feedback-dialog.component.html',
  styleUrls: ['./feedback-dialog.component.scss'],
})

/**
 * @example this.dialog.open(FeedbackDialogComponent, {data: {message: 'Example Message'}});
 */
export class FeedbackDialogComponent extends ModalDialogComponent {
  buttons: ModalButtonData[] = [
    {
      name: _('GLOBAL.CLOSE_BUTTON_TEXT'), type: 'cancel', eventName: 'close', id: 'btn-feedback-dialog-close',
    },
  ];

  constructor(
    public dialogRef: MatDialogRef<FeedbackDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
  ) {
    super(dialogRef, data);
  }

  onButtonEvent(eventName: string): void {
    if (eventName === 'close') {
      this.closeDialog();
    } else {
      console.log('ERROR: User add component: onButtonEvent triggered with unhandled event name');
    }
  }
}
