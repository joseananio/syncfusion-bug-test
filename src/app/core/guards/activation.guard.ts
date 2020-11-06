import { Injectable } from '@angular/core';
import { Router, CanActivate, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { ActivationManagerService } from '../services/local-services/activation-manager.service';

@Injectable()
export class ActivationGuard implements CanActivate {
  constructor(
    private activationManager: ActivationManagerService,
    private router: Router,
  ) {}

  canActivate(): Observable<boolean | UrlTree> {
    return new Observable((observer) => {
      this.activationManager.getActivationStatus(true).subscribe(
        (activationStatus) => {
          observer.next(
            activationStatus.isActivated
              ? true
              : this.router.parseUrl('activation'),
          );
        },
        () => {
          // Block access on error
          observer.next(false);
        },
      );
    });
  }
}
