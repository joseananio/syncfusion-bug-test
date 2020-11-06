import { Injectable, Inject, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthenticationService } from './authentication.service';
import { ActivationService } from '..';
import { ActivationStatusSlim } from '../model/models';

@Injectable({
  providedIn: 'root',
})
export class ActivationManagerService implements OnDestroy {
  constructor(
    private activationService: ActivationService,
     @Inject('AuthService') private authenticationService: AuthenticationService,
  ) {
    this.loginStateSubscription = this.authenticationService.getLoggedInObservable().subscribe(
      (loggedIn) => {
        // clear activationStatus on logout
        if (!loggedIn) {
          this.activationStatus = null;
        }
      },
    );
  }

  ngOnDestroy() {
    if (this.loginStateSubscription) {
      this.loginStateSubscription.unsubscribe();
    }
  }

  private activationStatus;

  private loginStateSubscription;

  getActivationStatus(checkLocally = false): Observable<ActivationStatusSlim> {
    return new Observable((observer) => {
      // Use cached version if desired. Never cache if product not activated - this can change quickly.
      if (checkLocally && this.activationStatus && this.activationStatus.isActivated) {
        observer.next(this.activationStatus);
      } else {
        this.activationService.getActivationStatus().subscribe(
          (response: ActivationStatusSlim) => {
            this.activationStatus = response;
            observer.next(response);
          },
          (error) => {
            observer.error(error);
          },
        );
      }
    });
  }
}
