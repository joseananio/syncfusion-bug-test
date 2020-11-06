import {
  CrudOptions, DataResult, DataOptions, Query,
} from '@syncfusion/ej2-data';
import { AuthenticatedODataV4Adaptor } from './authenticated-odatav4-adaptor';

/**
 * AuthenticatedODataV4Adaptor that does not parse the response. This allows downloading CSV data that needs no
 * further processing.
 */
export class AuthenticatedODataV4AdaptorCsv extends AuthenticatedODataV4Adaptor {
  /**
   * Do no parsing.
   *
   * @override
   */
  public processResponse(
    data: DataResult,
    ds?: DataOptions,
    query?: Query,
    xhr?: XMLHttpRequest,
    request?: any,
    changes?: CrudOptions,
  ): Object {
    return data;
  }
}
