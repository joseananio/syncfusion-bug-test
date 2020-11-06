import {
  Component, ElementRef, ViewChild, Inject, OnInit,
} from '@angular/core';
import { Router } from '@angular/router';
import { SessionLoginInput, ActivationStatusSlim } from 'src/app/core/services';
import {
  AuthenticationService,
  AuthRequestType,
  ActivationManagerService,
  NotificationService,
} from 'src/app/core/services/local-services';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';

@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.scss'],
})
export class LoginFormComponent implements OnInit {
  public model: SessionLoginInput;

  @ViewChild('form')
  public form: ElementRef;

  constructor(
    @Inject('AuthService')
    private authService: AuthenticationService,
    private router: Router,
    private activationManager: ActivationManagerService,
    private notificationService: NotificationService,
  ) {
    this.model = {
      username: '',
      password: '',
    };
  }

  public error = '';

  ngOnInit(): void {
    this.getActivationData();
  }

  private getActivationData(): void {
    // Use cached data. It was just refreshed when evaluating the login page guard.
    this.activationManager.getActivationStatus(true).subscribe(
      (status: ActivationStatusSlim) => {
        if (status.isClientSideCertificateValid) {
          this.notificationService.notify(_('LOGIN.CLIENT_CERTIFICATE_STATUS'));
        }
      },
      (err) => {
        // fail silently
        console.log(err);
      },
    );
  }

  public onLoginFormSubmit(): void {
    this.error = '';
    this.authService.login(this.model).subscribe(
      (response) => {
        if (response.requestType === AuthRequestType.LOGIN) {
          this.handleSuccessfulLogin();
        }
      },
      (error) => {
        if (error.errorType === 'USER_LOCKED') {
          this.notificationService.notify(_('LOGIN.USER_LOCKED'));
        } else {
          this.handleError(error);
        }
      },
    );
  }

  private handleSuccessfulLogin() {
    this.router.navigate(['']);
  }

  private handleError(err) {
    this.error = 'error';
    this.notificationService.notify(_('LOGIN.ERROR_MESSAGE'));
  }
}
