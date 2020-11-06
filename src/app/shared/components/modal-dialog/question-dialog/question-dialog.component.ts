import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { ModalButtonData, ModalDialogComponent, ModalDialogData } from '../modal-dialog/modal-dialog.component';

export interface DialogData extends ModalDialogData {
  title?: string;
  message: string;
  params?: Object;
}

@Component({
  selector: 'app-question-dialog',
  templateUrl: './question-dialog.component.html',
  styleUrls: ['./question-dialog.component.scss'],
})

/**
 * Usage: this.dialog.open(QuestionDialogComponent,{data: {message: 'Example Message'}});
 * Returns result event (true, false).
 */
export class QuestionDialogComponent extends ModalDialogComponent {
  buttons: ModalButtonData[] = [
    {
      name: _('GLOBAL.YES_BUTTON_TEXT'), type: 'primary', eventName: 'confirm', id: 'btn-question-dialog-confirm',
    },
    {
      name: _('GLOBAL.NO_BUTTON_TEXT'), type: 'cancel', eventName: 'close', id: 'btn-question-dialog-close',
    },
  ];

  constructor(public dialogRef: MatDialogRef<QuestionDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: DialogData) {
    super(dialogRef, data);
  }
}
