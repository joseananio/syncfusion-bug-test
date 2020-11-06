import { Inject } from '@angular/core';
import { DataManager, Adaptor, Query } from '@syncfusion/ej2-data';
import { Ajax } from '@syncfusion/ej2-base';
import { AuthenticationService } from '../authentication.service';

/**
 * An adaptor that does nothing but to add an Authorization header.
 */
export class AuthenticatedAdaptor extends Adaptor {
  constructor(@Inject('AuthService') protected authenticationService: AuthenticationService) {
    super();
  }

  /**
   * @override
   */
  public beforeSend(dataManager: DataManager, request: XMLHttpRequest, settings: Ajax): void {
    request.setRequestHeader('Authorization', `Bearer ${this.authenticationService.getToken()}`);
  }

  public processQuery(dataManager: DataManager, query: Query): Object {
    return { url: dataManager.dataSource.url };
  }
}
