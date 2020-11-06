import { Inject } from '@angular/core';
import {
  DataManager, DataResult, ODataV4Adaptor, Query,
} from '@syncfusion/ej2-data';
import { AuthenticationService } from '../authentication.service';

/**
 * AuthenticatedODataV4Adaptor that does not parse the response and passed the authentication token over the URL.
 * This allows downloading CSV data that needs no further processing.
 */
export class UrlAuthenticatedODataV4AdaptorCsv extends ODataV4Adaptor {
  constructor(@Inject('AuthService') private authenticationService: AuthenticationService) {
    super();
  }

  /**
   * Do no parsing.
   *
   * @override
   */
  public processResponse(data: DataResult): Object {
    return data;
  }

  /**
   * @override
   */
  public processQuery(dataManager: DataManager, query: Query): Object {
    // add auth token to URL
    query.addParams('sid', this.authenticationService.getSessionId());
    return super.processQuery(dataManager, query);
  }
}
