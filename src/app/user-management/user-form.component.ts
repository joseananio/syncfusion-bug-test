import { Component, ViewChild } from '@angular/core';
import { NgForm, ValidationErrors } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { AuthorityTemplateNames, BackendConstStrongPassword } from '../core/services';
import { FeedbackDialogComponent } from '../shared/components/modal-dialog/feedback-dialog/feedback-dialog.component';
import { ModalButtonData } from '../shared/components/modal-dialog/modal-dialog/modal-dialog.component';

@Component({
  template: '',
})
export abstract class UserFormComponent {
  @ViewChild('form') form: NgForm;

  passwordPattern: string = BackendConstStrongPassword.AZ1D1W1S61000;

  buttons: ModalButtonData[];

  userRoles = [
    { id: AuthorityTemplateNames.GUESTS, description: _('USERS.GUEST_ROLE') },
    { id: AuthorityTemplateNames.USERS, description: _('USERS.USER_ROLE') },
    { id: AuthorityTemplateNames.ADMINISTRATORS, description: _('USERS.ADMIN_ROLE') },
  ];

  constructor(protected dialog: MatDialog, public dialogRef: MatDialogRef<UserFormComponent>) {
    this.buttons = [
      {
        name: _('GLOBAL.CANCEL_BUTTON_TEXT'), type: 'cancel', eventName: 'close', id: 'btn-user-add-modal-cancel',
      },
      {
        name: _('GLOBAL.CREATE_BUTTON_TEXT'), type: 'primary', eventName: 'action', id: 'btn-user-add-modal-save', isDisabled: true,
      },
    ];
  }

  protected openFeedbackDialog<R = any>(feedBackMessage: string, params: Object): MatDialogRef<FeedbackDialogComponent, R> {
    return this.dialog.open(
      FeedbackDialogComponent,
      {
        data: {
          params,
          message: feedBackMessage,
        },
      },
    );
  }

  public getUsernameError(error: ValidationErrors = {}): string {
    if (error.required) {
      return _('GLOBAL.REQUIRED_FIELD_TEXT');
    }
    if (error.pattern) {
      return _('USERS.INVALID_FIELD_NO_SPACES');
    }
    if (error.minlength) {
      return _('GLOBAL.MIN_LENGTH');
    }
    return '';
  }

  protected closeDialog(): void {
    this.dialogRef.close();
  }

  public onButtonEvent(eventName: string): void {
    switch (eventName) {
      case 'close': {
        this.closeDialog();
        break;
      }
      case 'action': {
        this.saveChanges();
        break;
      }
      default: {
        console.error('ERROR: User add component: onButtonEvent triggered with unhandled event name');
      }
    }
  }

  protected reValidatePasswords() {
    const passwordControl = this.form.controls['password'];
    const passwordConfirmationControl = this.form.controls['passwordConfirmation'];

    if (passwordConfirmationControl && !passwordConfirmationControl.pristine && !passwordControl.pristine) {
      passwordConfirmationControl.updateValueAndValidity();
    }
  }

  protected abstract saveChanges(): void;
}
