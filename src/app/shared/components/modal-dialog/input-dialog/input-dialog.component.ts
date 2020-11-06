import {
  Component, Inject, OnInit, ViewChild,
} from '@angular/core';
import { NgForm } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { ModalButtonData, ModalDialogComponent } from '../modal-dialog/modal-dialog.component';

export interface InputDialogData {
  message: string;
  params?: Object;
  inputType?: string;
  value?: string;
  regexString?: string;
}

/**
 * Usage: this.dialog.open(InputDialogComponent,{data: {message: 'Example Message'}});
 * Returns input value if user confirms and null if user closes the dialog.
 * Return value can be subscribed with confirmDialog.afterClosed().subscribe().
 */
@Component({
  selector: 'app-input-dialog',
  templateUrl: './input-dialog.component.html',
  styleUrls: ['./input-dialog.component.scss'],
})
export class InputDialogComponent extends ModalDialogComponent implements OnInit {
  @ViewChild(NgForm) formViewChild;

  buttons: ModalButtonData[] = [
    {
      name: _('GLOBAL.OK_BUTTON_TEXT'), type: 'primary', eventName: 'confirm', id: 'btn-input-dialog-confirm', isDisabled: true,
    },
    {
      name: _('GLOBAL.CLOSE_BUTTON_TEXT'), type: 'cancel', eventName: 'close', id: 'btn-input-dialog-close',
    },
  ];

  inputVar = '';

  regexString: string;

  constructor(public dialogRef: MatDialogRef<InputDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: InputDialogData) {
    super(dialogRef, data);
  }

  ngOnInit() {
    // Disable native backdrop close and return null
    this.dialogRef.disableClose = true;
    this.dialogRef.backdropClick().subscribe((result) => {
      this.dialogRef.close(null);
    });
    this.regexString = this.data.regexString;
    this.inputVar = this.data.value || '';
  }

  onButtonEvent(eventName: string) {
    switch (eventName) {
      case 'confirm': {
        this.dialogRef.close(this.inputVar);
        this.inputVar = '';
        break;
      }
      case 'close': {
        this.closeDialog();
        break;
      }
      default: {
        console.error('ERROR: User add component: onButtonEvent triggered with unhandled event name');
      }
    }
  }

  onInputChange() {
    this.buttons[0].isDisabled = !this.formViewChild.valid;
  }
}
