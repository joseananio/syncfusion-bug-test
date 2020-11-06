import { Component, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { BackendConstStrongPassword, UsersService, UserUpdatePasswordInput } from 'src/app/core/services';
import { AuthenticationService, NotificationService } from 'src/app/core/services/local-services';

@Component({
  selector: 'app-set-password-form',
  templateUrl: './set-password-form.component.html',
  styleUrls: ['../login-form/login-form.component.scss'],
})
export class SetPasswordFormComponent {
  constructor(
    private usersService: UsersService,
    private router: Router,
    private notificationService: NotificationService,
    @Inject('AuthService') private authenticationService: AuthenticationService,
  ) { }

  public passwordPattern = BackendConstStrongPassword.AZ1D1W1S61000;

  public model: UserUpdatePasswordInput = {
    oldPassword: '',
    newPassword: '',
    newPasswordConfirmation: '',
  };

  private static parseUpdatePasswordError(error): string {
    if (error.error) {
      if (error.error.errorCode === 'WRONG_ORIGINAL_PASSWORD') {
        return _('LOGIN.OLD_PASSWORD_IS_INCORRECT');
      }
      if (error.error.errorCode === 'INVALID_NEW_PASSWORD') {
        return _('LOGIN.INVALID_NEW_PASSWORD');
      }
      if (error.error.error) {
        if (error.error.error.NewPasswordConfirmation) {
          if (error.error.error.NewPasswordConfirmation[0].startsWith('NON_IDENTICAL')) {
            // Should never be shown.
            return _('LOGIN.PASSWORDS_DO_NOT_MATCH');
          }
        } else if (error.error.error.NewPassword) {
          if (error.error.error.NewPassword[0] === 'REGEX_NOT_MATCH STRONG_PASSWORD') {
            // Should never be shown.
            return _('LOGIN.PASSWORD_INSECURE');
          }
        }
      }
    }

    return _('LOGIN.UNKNOWN_ERROR');
  }

  public onPasswordFormSubmit(): void {
    this.usersService.updatePassword(this.model).subscribe(
      (result) => {
        // end session manually to avoid session end notification when returning to login page
        this.authenticationService.endSession();
        this.router.navigate(['home']);
        this.notificationService.notify(_('LOGIN.PASSWORD_CHANGED'));
      },
      (error) => {
        const message = SetPasswordFormComponent.parseUpdatePasswordError(error);
        this.notificationService.notify(message);
      },
    );
  }
}
