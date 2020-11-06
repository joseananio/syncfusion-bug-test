import {
  Component, EventEmitter, Inject, OnInit, Output, ViewChild,
} from '@angular/core';
import { NgForm } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import {
  AuthorityCodes, BackendConstStrongPassword, UserOutputDto,

  UserResetPasswordInput, UserSetAuthorityTemplateInput, UsersService,
  UserUpdateAnyMetadataInput,
} from 'src/app/core/services';
import { AuthenticationService, NotificationService } from 'src/app/core/services/local-services';
import { InputDialogComponent } from 'src/app/shared/components/modal-dialog/input-dialog/input-dialog.component';
import { ModalButtonData } from 'src/app/shared/components/modal-dialog/modal-dialog/modal-dialog.component';
import { UserFormComponent } from '../user-form.component';

export interface DialogData {
  userLoginName: string;
  authorities: Set<string>;
}

/**
 * Changes User details using three REST-API endpoints.
 */
@Component({
  selector: 'app-user-details',
  templateUrl: './user-details.component.html',
  styleUrls: ['./user-details.component.scss'],
})
export class UserDetailsComponent extends UserFormComponent implements OnInit {
  // Forms don't need an element identifier, all forms get as follows.
  @ViewChild(NgForm) formViewChild;

  @Output()
  public closeEvent = new EventEmitter<string>();

  userDetails: UserOutputDto;

  olduserDetails: UserOutputDto;

  userPassword: {
    password: string;
    passwordConfirmation: string;
  };

  currentUserName: string;

  // Password security requirements for form validation
  passwordPattern: string = BackendConstStrongPassword.AZ1D1W1S61000;

  buttons: ModalButtonData[];

  readOnly = false;

  selfEdit = false;

  AuthorityCodes = AuthorityCodes;

  constructor(
    public dialogRef: MatDialogRef<UserDetailsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private usersService: UsersService,
    @Inject('AuthService')
    private authService: AuthenticationService,
    private notificationService: NotificationService,
    protected dialog: MatDialog,
    private router: Router,
  ) {
    super(dialog, dialogRef);
  }

  ngOnInit(): void {
    this.currentUserName = this.authService.getUserName();
    if (this.currentUserName === this.data.userLoginName) {
      this.readOnly = true;
      this.selfEdit = true;
    }
    this.buttons = [
      {
        name: _('GLOBAL.CLOSE_BUTTON_TEXT'), type: 'cancel', eventName: 'close', id: 'btn-user-details-modal-cancel',
      },
      {
        name: _('GLOBAL.SAVE_BUTTON_TEXT'), type: 'primary', eventName: 'action', id: 'btn-user-details-modal-save', isDisabled: true,
      },
    ];
    // userDetails needs initialization before subscribing to service
    this.userDetails = {} as UserOutputDto;
    this.userPassword = {
      password: '',
      passwordConfirmation: '',
    };
    this.getUserMetadata();
  }

  private isFormVerified(): boolean {
    return this.formViewChild.valid;
  }

  private isFormDifferent(): boolean {
    return this.isUserInfoDifferent() || this.isUserRoleDifferent() || this.isUserPasswordNew() || this.isUserLockDifferent();
  }

  private isUserInfoDifferent(): boolean {
    // get all differences except authorityTemplateName
    const iDDiff = this.userDetails.userId !== this.olduserDetails.userId;
    const loginNameDiff = this.userDetails.loginName !== this.olduserDetails.loginName;
    const lastNameDiff = this.userDetails.lastName !== this.olduserDetails.lastName;
    const firstNameDiff = this.userDetails.firstName !== this.olduserDetails.firstName;
    const emailDiff = this.userDetails.email !== this.olduserDetails.email;
    return iDDiff || loginNameDiff || lastNameDiff || firstNameDiff || emailDiff;
  }

  private isUserRoleDifferent(): boolean {
    return this.userDetails.authorityTemplateName !== this.olduserDetails.authorityTemplateName;
  }

  private isUserPasswordNew(): boolean {
    return this.userPassword.password !== '';
  }

  private isUserLockDifferent(): boolean {
    return this.userDetails.isLocked !== this.olduserDetails.isLocked;
  }

  public onUserRoleSelect(role: any): void {
    this.userDetails.authorityTemplateName = role.id;
  }

  public onChange(): void {
    this.reValidatePasswords();

    const verified = this.isFormVerified();
    const different = this.isFormDifferent();
    if (verified && different) {
      this.buttons[1].isDisabled = false;
    } else {
      this.buttons[1].isDisabled = true;
    }
  }

  public saveChanges(): void {
    // Saves metadata and role/pass as well
    this.saveUserInfo();


    this.closeEvent.emit('success');
    this.onChange();
  }

  private saveUserInfo(): void {
    if (this.isUserRoleDifferent() || this.isUserPasswordNew()) {
      const confirmDialog = this.dialog.open(InputDialogComponent, {
        data: {
          message: _('USERS.VERIFY_PASSWORD_MESSAGE'),
          inputType: 'password',
        },
      });
      confirmDialog.afterClosed().subscribe((passwordInput?: string) => {
        if (this.isUserRoleDifferent()) {
          this.saveUserRole(passwordInput);
        }
        if (this.isUserPasswordNew()) {
          this.saveUserPassword(passwordInput);
        }
        this.saveUserInfoAndLockStatus();
      });
    } else {
      this.saveUserInfoAndLockStatus();
    }
  }

  private saveUserInfoAndLockStatus() {
    if (this.isUserLockDifferent()) {
      this.saveUserLockStatus();
    }
    if (this.isUserInfoDifferent()) {
      const userUpdateAnyMetadataInput: UserUpdateAnyMetadataInput = {
        email: this.userDetails.email,
        loginName: this.userDetails.loginName,
        lastName: this.userDetails.lastName,
        firstName: this.userDetails.firstName,
      };
      // Save rest of userInfo, including the chance to modify loginName
      this.usersService.updateUserAnyMetadata(this.data.userLoginName, userUpdateAnyMetadataInput).subscribe(
        (ok) => {
          this.data.userLoginName = this.userDetails.loginName;
          this.getUserInfoAfterSave();
        },
        (err) => {
          this.notificationService.notify(_('USERS.USER_INFO_NOT_UPDATED'));
        },
      );
    }
  }

  private saveUserRole(passwordInput: string): void {
    if (passwordInput !== null && passwordInput !== undefined) {
      const userSetAuthorityTemplateInput: UserSetAuthorityTemplateInput = {
        managerPassword: passwordInput,
        authorityTemplateName: this.userDetails.authorityTemplateName,
      };
      this.usersService.setUserAuthorityTemplate(this.data.userLoginName, userSetAuthorityTemplateInput).subscribe(
        (ok) => {
          this.getUserRoleAfterSave();
        },
        (err) => {
          if (err.error.errorCode === 'WRONG_ORIGINAL_PASSWORD') {
            this.notificationService.notify(_('USERS.WRONG_ORIGINAL_PASSWORD'));
          } else {
            this.notificationService.notify(_('USERS.USER_ROLE_NOT_UPDATED'));
          }
        },
      );
    } else {
      this.notificationService.notify(_('USERS.PASSWORD_CANNOT_BE_EMPTY'));
    }
  }

  private saveUserPassword(passwordInput: string): void {
    if (passwordInput !== null && passwordInput !== undefined) {
      const userResetPasswordInput: UserResetPasswordInput = {
        managerPassword: passwordInput,
        password: this.userPassword.password,
        passwordConfirmation: this.userPassword.passwordConfirmation,
      };
      this.usersService.resetPassword(this.userDetails.loginName, userResetPasswordInput).subscribe(
        (ok) => {
          this.userPassword.password = '';
        },
        (err) => {
          if (err.error && err.error.errorType === 'UNAUTHORIZE') {
            // Since setting a new password ends the session.
            this.router.navigate(['login']);
          } else if (err.error.errorCode === 'INVALID_NEW_PASSWORD') {
            this.notificationService.notify(_('USERS.INVALID_NEW_PASSWORD'));
          } else {
            this.notificationService.notify(_('USERS.PASSWORD_NOT_UPDATED'));
          }
        },
      );
    } else {
      this.notificationService.notify(_('USERS.PASSWORD_CANNOT_BE_EMPTY'));
    }
  }

  public removeReadonly(event): void {
    event.target.removeAttribute('readonly');
  }

  private saveUserLockStatus(): void {
    if (this.userDetails.isLocked) {
      this.deactivateUser();
    } else {
      this.activateUser();
    }
  }

  /**
   * Gets complete user Info (including authorityGroup).
   */
  private getUserMetadata(): void {
    this.usersService.getUserMetadata(this.data.userLoginName).subscribe(
      (userInfo) => {
        this.userDetails = userInfo;
        // Shallow copy to create independent copy of old vals
        this.olduserDetails = { ...this.userDetails };
        // Retrigger onChange because async subscription is late
        this.onChange();
      },
      (err) => {
        this.notificationService.notify(_('USERS.CANNOT_GET_USER_DATA'));
        console.error(err);
      },
    );
  }

  /**
   * Gets only user metadata exluding authorityGroup and updates old values.
   */
  private getUserInfoAfterSave(): void {
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
      (err) => {
        this.notificationService.notify(_('USERS.CANNOT_GET_USER_DATA'));
        console.error(err);
      },
    );
  }

  /**
   * Gets only authorityGroup of user and updates old values.
   */
  private getUserRoleAfterSave(): void {
    this.usersService.getUserMetadata(this.data.userLoginName).subscribe(
      (userInfo) => {
        this.userDetails.authorityTemplateName = userInfo.authorityTemplateName;
        this.olduserDetails.authorityTemplateName = this.userDetails.authorityTemplateName;
        // Retrigger onChange because async subscription is late
        this.onChange();
      },
      (err) => {
        this.notificationService.notify(_('USERS.CANNOT_GET_USER_DATA'));
        console.error(err);
      },
    );
  }

  /**
   * Deactivates the user, meaning to lock it from login.
   */
  private deactivateUser(): void {
    this.usersService.lockUser(this.userDetails.loginName).subscribe(
      (ok) => {
        this.getUserMetadata();
      },
      (err) => {
        this.notificationService.notify(_('USERS.CANNOT_DISABLE_USER'));
        console.error(err);
      },
    );
  }

  /**
   * Activates the user, meaning to allow it again to log in.
   */
  private activateUser(): void {
    this.usersService.unlockUser(this.userDetails.loginName).subscribe(
      (ok) => {
        this.getUserMetadata();
      },
      (err) => {
        this.notificationService.notify(_('USERS.CANNOT_ENABLE_USER'));
        console.error(err);
      },
    );
  }
}
