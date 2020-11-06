import { Inject } from '@angular/core';
import { DataManager, ODataV4Adaptor } from '@syncfusion/ej2-data';
import { AuthenticationService } from '../authentication.service';

/**
 * A version of ODataV4Adaptor that adds an Authorization header.
 */
export class AuthenticatedODataV4Adaptor extends ODataV4Adaptor {
  constructor(@Inject('AuthService') protected authenticationService: AuthenticationService) {
    super();
  }

  /**
   * @override
   */
  public beforeSend(dataManager: DataManager, request: XMLHttpRequest, settings: any): void {
    super.beforeSend(dataManager, request, settings);
    // Do not add the header when not authenticated.
    if (this.authenticationService.getToken()) {
      request.setRequestHeader('Authorization', `Bearer ${this.authenticationService.getToken()}`);
    }
  }
}
