import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ActivationManagerService } from 'src/app/core/services/local-services';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss'],
})
export class LoginPageComponent implements OnInit {
  loadingActivation: boolean;

  projectName: string;

  projectStatus: string;

  passwordChangeRequired = false;

  constructor(
    private activationManager: ActivationManagerService,
    router: Router,
  ) {
    this.loadingActivation = true;
    // The page is used for two purposes: logging in and resetting the user password after login.
    this.passwordChangeRequired = router.url === '/setpassword';
  }

  ngOnInit() {
    this.getActivationData();
  }

  private getActivationData(): void {
    this.loadingActivation = true;
    // data already loaded by guard, so get local to reduce backend calls
    this.activationManager.getActivationStatus(true).subscribe(
      (response) => {
        this.projectName = response.projectMetaData.name;
      },
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      (error) => {},  // do nothing
      () => {
        setTimeout(() => {
          this.loadingActivation = false;
        });
      },
    );
  }
}
