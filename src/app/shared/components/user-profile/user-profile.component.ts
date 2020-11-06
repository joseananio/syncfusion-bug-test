import {
  Component, OnInit, Inject, ViewChild, Output, EventEmitter,
} from '@angular/core';
import { ModalButtonData } from 'src/app/shared/components/modal-dialog/modal-dialog/modal-dialog.component';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import {
  UsersService,
  UserUpdatePasswordInput,
  UserOutputDto,
  UserUpdateAnyMetadataInput,
  BackendConstStrongPassword,
} from 'src/app/core/services';
import { NotificationService } from 'src/app/core/services/local-services';
import { NgForm } from '@angular/forms';
import { InputDialogComponent } from 'src/app/shared/components/modal-dialog/input-dialog/input-dialog.component';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';

export interface DialogData {
  userLoginName: string;
}

/**
 * Changes User details using three REST-API endpoints.
 */
@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss'],
})
export class UserProfileComponent implements OnInit {
  // Forms don't need an element identifier, all forms get as follows.
  @ViewChild(NgForm) formViewChild;

  @Output()
  public closeEvent = new EventEmitter <string>();

  userDetails: UserOutputDto;

  olduserDetails: UserOutputDto;

  userPassword: {
    password: string,
    passwordConfirmation: string,
  };

  // Password security requirements for form validation
  passwordPattern: string = BackendConstStrongPassword.AZ1D1W1S61000;

  buttons: ModalButtonData[];

  modalTitle = _('USERS.PROFILE_MODAL_TITLE');

  constructor(
    public dialogRef: MatDialogRef<UserProfileComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private usersService: UsersService,
    private notificationService: NotificationService,
    private dialog: MatDialog,
  ) {
  }

  ngOnInit(): void {
    this.buttons = [
      {
        name: _('USERS.PROFILE_CLOSE'), type: 'cancel', eventName: 'close', id: 'btn-user-profile-modal-cancel',
      },
      {
        name: _('USERS.PROFILE_SAVE_CHANGES'), type: 'primary', eventName: 'save', id: 'btn-user-profile-modal-save', isDisabled: true,
      },
    ];
    // userDetails needs initialization before subscribing to service
    this.userDetails = {} as UserOutputDto;
    // initialize group with guests to avoid null exception
    /* this.userDetails.authorityTemplateName = 'GUESTS'; */
    this.userPassword = {
      password: '',
      passwordConfirmation: '',
    };
    this.getUserMetadata();
  }

  isFormVerified(): boolean {
    return this.formViewChild.valid;
  }

  isFormDifferent(): boolean {
    return (this.isUserInfoDifferent() || this.isUserPasswordNew());
  }

  isUserInfoDifferent(): boolean {
    // get all differences except authorityTemplateName
    const iDDiff = this.userDetails.userId !== this.olduserDetails.userId;
    const loginNameDiff = this.userDetails.loginName !== this.olduserDetails.loginName;
    const lastNameDiff = this.userDetails.lastName !== this.olduserDetails.lastName;
    const firstNameDiff = this.userDetails.firstName !== this.olduserDetails.firstName;
    const emailDiff = this.userDetails.email !== this.olduserDetails.email;
    return (iDDiff || loginNameDiff || lastNameDiff || firstNameDiff || emailDiff);
  }

  isUserPasswordNew(): boolean {
    return (this.userPassword.password !== '');
  }

  removeReadonly(event): void {
    event.target.removeAttribute('readonly');
  }

  onChange(): void {
    const verified = this.isFormVerified();
    const different = this.isFormDifferent();
    if (verified && different) {
      this.buttons[1].isDisabled = false;
    } else {
      this.buttons[1].isDisabled = true;
    }
  }

  onButtonEvent(eventName: string): void {
    switch (eventName) {
      case 'save': {
        this.saveChanges();
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

  public saveChanges(): void {
    if (this.isUserPasswordNew()) {
      this.saveUserPassword();
    }
    // Saves metadata and role/pass as well
    if (this.isUserInfoDifferent()) {
      this.saveUserInfo();
    }
    this.closeEvent.emit('success');
    this.onChange();
  }

  saveUserInfo(): void {
    const userUpdateAnyMetadataInput: UserUpdateAnyMetadataInput = {
      email: this.userDetails.email,
      loginName: this.userDetails.loginName,
      lastName: this.userDetails.lastName,
      firstName: this.userDetails.firstName,
    };
    // Save rest of userInfo, including the chance to modify loginName
    this.usersService.updateUserOwnMetadata(this.data.userLoginName, userUpdateAnyMetadataInput).subscribe(
      (ok) => {
        this.data.userLoginName = this.userDetails.loginName;
        this.getUserInfoAfterSave();
        if (this.isUserPasswordNew()) {
          this.saveUserPassword();
        }
      },
      (error) => {
        this.notificationService.notify(_('USERS.COULD_NOT_SAVE_EDITS'));
        console.error(error);
      },
    );
  }

  saveUserPassword(): void {
    const confirmDialog = this.dialog.open(
      InputDialogComponent,
      {
        data: {
          message: _('USERS.PASSWORD_CONFIRM_MESSAGE'),
          inputType: 'password',
        },
      },
    );
    confirmDialog.afterClosed().subscribe((passwordInput?: string) => {
      if (passwordInput !== null) {
        const userResetPasswordInput: UserUpdatePasswordInput = {
          oldPassword: passwordInput,
          newPassword: this.userPassword.password,
          newPasswordConfirmation: this.userPassword.passwordConfirmation,
        };
        this.usersService.updatePassword(userResetPasswordInput).subscribe(
          (ok) => {
            this.userPassword.password = '';
          },
          (error) => {
            this.notificationService.notify(_('USERS.COULD_NOT_UPDATE_PASSWORD'));
            console.error(error);
          },
        );
      }
    });
  }

  /**
   * Gets complete user Info (including authorityGroup).
   */
  getUserMetadata(): void {
    this.usersService.getUserMetadata(this.data.userLoginName).subscribe(
      (userInfo) => {
        this.userDetails = userInfo;
        // Shallow copy to create independent copy of old vals
        this.olduserDetails = { ...this.userDetails };
        // Retrigger onChange because async subscription is late
        this.onChange();
      },
      (error) => {
        this.notificationService.notify(_('USERS.COULD_NOT_GET_USER_DATA'));
        console.error(error);
      },
    );
  }

  /**
   * Gets only user metadata exluding authorityGroup and updates old values.
   */
  getUserInfoAfterSave(): void {
    this.usersService.getUserMetadata(this.data.userLoginName).subscribe(
      (userInfo) => {
        this.userDetails.email = userInfo.email;
        this.userDetails.firstName = userInfo.firstName;
        this.userDetails.lastName = userInfo.lastName;
        this.userDetails.loginName = userInfo.loginName;
        this.olduserDetails.email = this.userDetails.email;
        this.olduserDetails.firstName = this.userDetails.firstName;
        this.olduserDetails.lastName = this.userDetails.lastName;
        this.olduserDetails.loginName = this.userDetails.loginName;
        // Retrigger onChange because async subscription is late
        this.onChange();
      },
      (error) => {
        this.notificationService.notify(_('USERS.COULD_NOT_GET_USER_DATA'));
        console.error(error);
      },
    );
  }

  public closeDialog() {
    this.dialogRef.close();
  }
}
