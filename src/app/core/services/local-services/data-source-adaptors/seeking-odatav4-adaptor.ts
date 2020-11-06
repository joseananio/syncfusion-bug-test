import { Inject } from '@angular/core';
import {
  DataManager, DataOptions, DataResult, Query,
} from '@syncfusion/ej2-data';
import { AuthenticationService } from '../authentication.service';
import { AuthenticatedODataV4Adaptor } from './authenticated-odatav4-adaptor';

/**
 * A version of AuthenticatedODataV4Adaptor that does seek pagination instead of offset pagination.
 * When using this adaptor, make sure to include a unique 'pagerId' parameter in all queries that
 * identifies the pager using the data manager.
 */
export class SeekingODataV4Adaptor extends AuthenticatedODataV4Adaptor {
  /**
   * Map allowing lookup of next links by pagerId.
   */
  nextLinkMap: { [key: string]: string; } = {};

  constructor(@Inject('AuthService') authenticationService: AuthenticationService) {
    super(authenticationService);
  }

  /**
   * @override
   */
  public convertToQueryString(request: Object, query: Query, dm: DataManager): string {
    // We are not modifying the query in processQuery() since we want to switch the whole URL in
    // some cases.
    if (request['$skip'] > 0) {  // go to next page
      // just use the stored next page link
      return this.nextLinkMap[request['pagerId']].match(/\?(.*)/)[0];
    }
    // go to first page
    // Clear offset
    query.queries = query.queries.filter((subQuery) => subQuery.fn !== 'onPage');
    delete request['$skip'];

    // Clear pagerId - not needed for actual query
    delete request['pagerId'];

    return super.convertToQueryString(request, query, dm);
  }

  public processResponse(data: DataResult, ds?: DataOptions, query?: Query): Object {
    const pagerIdParam = query.params.find((parameter) => parameter.key === 'pagerId');
    if (data['@odata.nextLink']) {  // there is a next page
      // save next link for the pager
      if (pagerIdParam) {
        this.nextLinkMap[pagerIdParam.value] = data['@odata.nextLink'];
      } else {
        console.error('Please add a unique "pagerId" parameter to your query to support seek pagination.');
      }
    } else if (pagerIdParam) {  // no next page - last page
      // It's okay not to have a pagerId if no paging is used at all.
      delete this.nextLinkMap[pagerIdParam.value];
    }

    return {
      // Add dummy item count to make the caller happy. If we are on the last page, use the item
      // count as dummy to signal last page state to the pager.
      count: data['@odata.nextLink'] ? 999999999999 : (data.value as any[]).length,
      result: data.value,
    };
  }
}
