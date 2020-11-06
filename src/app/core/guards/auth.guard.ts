import { Inject, Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { AuthenticationService } from '../services/local-services';

/**
 * Checks if the application has been activated and, if this is the case, if the user is authenticated.
 */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    @Inject('AuthService')
    private authService: AuthenticationService,
    private router: Router,
  ) {
  }

  canActivate(): boolean | UrlTree {
    return this.authService.isLoggedIn() ? true : this.router.parseUrl('login');
  }
}
