import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AuthorityCodes } from 'src/app/core/services';
import { AuthenticationService, AuthRequestType } from 'src/app/core/services/local-services';
import { UserProfileComponent } from '../user-profile/user-profile.component';

@Component({
  selector: 'viega-login-status',
  templateUrl: './login-status.component.html',
  styleUrls: ['./login-status.component.scss'],
})
export class LoginStatusComponent implements OnInit {
  AuthorityCodes = AuthorityCodes;

  authorities: Set<string> = new Set();

  authenticated = false;

  currentUserName = null;

  constructor(@Inject('AuthService') private authService: AuthenticationService,
              private dialog: MatDialog,
              private router: Router) { }

  ngOnInit() {
    this.currentUserName = this.authService.getUserName();
    this.authenticated = this.authService.isLoggedIn();

    this.authService.loginChanged.subscribe((name) => {
      this.authenticated = this.authService.isLoggedIn();
      this.currentUserName = name;
    });
  }

  openUserDetails() {
    this.dialog.open(
      UserProfileComponent,
      {
        data: {
          userLoginName: this.currentUserName,
        },
      },
    );
  }

  onLogoutClick() {
    this.authService.logout().subscribe((response) => {
      if (response.requestType === AuthRequestType.LOGOUT) {
        this.handleSuccessLogout();
      }
    });
  }

  handleSuccessLogout() {
    this.router.navigate(['login']);
    this.currentUserName = null;
    this.authenticated = null;
  }
}
