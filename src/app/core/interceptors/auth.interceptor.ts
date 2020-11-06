/**
 * Auth Interceptor.
 *
 * Injects auth token and other headers into requests.
 */

import { Injectable, Inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse, HttpInterceptor,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { AuthenticationService, NotificationService } from '../services/local-services';

@Injectable({
  providedIn: 'root',
})
export class AuthInterceptor implements HttpInterceptor {
  private offline = false;

  constructor(
    @Inject('AuthService')
    private authService: AuthenticationService,
    private notificationService: NotificationService,
    private router: Router,
    private dialog: MatDialog,
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const authToken = this.authService.getToken();
    const _req = authToken ? req.clone({
      setHeaders: {
        Authorization: `Bearer ${authToken}`,
      },
    }) : req;

    return next.handle(_req).pipe(
      map((res: any) => {
        if (this.offline && res.type !== 0) {
          // we are clearly not offline anymore
          this.offline = false;
          // remove pinned message
          this.notificationService.notify({
            message: _('GLOBAL_ERROR_HANDLER.HTTP_504'),
            operation: 'UNPIN',
          });
        }

        return res;
      }),
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {  // session timeout
          // This endpoint may not be accessible without authentication after the initial update.
          // In this very special case we do not want the usual error handling.
          if (!error.url.endsWith('api/v1/Update/getupdatestatus') && _req.headers.get('Authorization')) {
            this.authService.endSession();
            this.dialog.closeAll();
            this.router.navigate(['login']);
            this.notificationService.notify(_('GLOBAL_ERROR_HANDLER.HTTP_401'));
          }
        } else if (error.status === 0 || error.status === 504) {  // controller not reachable or client offline
          this.notificationService.notify({
            message: _('GLOBAL_ERROR_HANDLER.HTTP_504'),
            operation: 'PIN',
          });
          this.offline = true;
        }

        return throwError(error);
      }),
    );
  }
}
