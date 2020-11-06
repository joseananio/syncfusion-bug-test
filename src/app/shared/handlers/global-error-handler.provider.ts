import {
  ErrorHandler, Injectable, Injector, Type,
} from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { NotificationService, ErrorMessage } from 'src/app/core/services/local-services';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';

/**
 * Global fallback error handler.
 *
 * Any uncaught exception will end up here. All errors are printed to the console. If a network
 * error was not already handled in AuthInterceptor, a very general notification is shown.
 */
@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  /**
   * Standard error messages for all HTTP codes used by the REST API.
   */
  private static STANDARD_MESSAGES = {
    400: _('GLOBAL_ERROR_HANDLER.HTTP_400'),  // incorrect request
    403: _('GLOBAL_ERROR_HANDLER.HTTP_403'),  // access not allowed
    404: _('GLOBAL_ERROR_HANDLER.HTTP_404'),  // not found
  };

  /**
   * List of HTTP errors already handled in AuthInterceptor.
   */
  private static IGNORED_ERRORS = new Set([
    0,  // offline
    200,  // ok
    401,  // session timeout
    504,  // not reachable
  ]);

  constructor(private injector: Injector) { }

  handleError(error: Error | HttpErrorResponse) {
    const globalErrorService = this.injector.get<NotificationService>(
      NotificationService as Type<NotificationService>,
    );

    let errorItem: ErrorMessage;
    if (error instanceof HttpErrorResponse) {
      errorItem = GlobalErrorHandler.IGNORED_ERRORS.has(error.status) ? null : {
        message: this.getStandardMessage(error.status),
        statusCode: error.status,
      };
    }

    if (errorItem) {
      globalErrorService.notify(errorItem);
    }

    // Always log to console
    console.error(error);
  }

  private getStandardMessage(statusCode: number): string {
    return GlobalErrorHandler.STANDARD_MESSAGES[statusCode] || _('GLOBAL_ERROR_HANDLER.UNKNOWN_ERROR');
  }
}
