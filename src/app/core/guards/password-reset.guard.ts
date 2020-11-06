import { Injectable, Inject } from '@angular/core';
import { Router, CanActivate, UrlTree } from '@angular/router';
import { AuthenticationService } from '../services/local-services';

/**
 * Guard that checks if the user has to change her password.
 */
@Injectable()
export class PasswordResetGuard implements CanActivate {
  constructor(
    @Inject('AuthService')
    private authService: AuthenticationService,
    private router: Router,
  ) {
  }

  canActivate(): boolean | UrlTree {
    return this.authService.isPasswordChangeRequired() ? this.router.parseUrl('setpassword') : true;
  }
}
