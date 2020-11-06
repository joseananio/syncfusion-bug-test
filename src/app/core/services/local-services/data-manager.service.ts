import { Inject, Injectable } from '@angular/core';
import { DataManager } from '@syncfusion/ej2-data';
import { ItemReportsFilterService, MessagesService } from 'src/app/core/services';
import { AuthenticationService } from './authentication.service';
import {
  AuthenticatedAdaptor,
  AuthenticatedODataV4Adaptor,
  AuthenticatedODataV4AdaptorCsv,
  SeekingODataV4Adaptor,
  UrlAuthenticatedODataV4AdaptorCsv,
} from './data-source-adaptors';

/**
 * A service providing functions providing Syncfusion DataManagers for easy access to OData
 * endpoints.
 * For each endpoint only a single DataManager instance is lazy-created - so caching is built in.
 */
@Injectable({
  providedIn: 'root',
})
export class DataManagerService {
  private lastToken: string;

  private reportsDataManager: DataManager;

  private reportsCsvDataManager: DataManager;

  private reportsPdfDataManager: DataManager;

  private messagesDataManager: DataManager;

  private authorityDataManager: DataManager;

  constructor(
    @Inject('AuthService') private authenticationService: AuthenticationService,
    private itemReportsFilterService: ItemReportsFilterService,
    private messagesService: MessagesService,
  ) {
  }

  /**
   * Lazy-creates a DataManager providing the equivalent of
   * ItemReportsFilterService.getDataQueryOData().
   */
  public getReportsDataManager(): DataManager {
    if (!this.reportsDataManager) {
      this.reportsDataManager = this.createSeekingDataManager(this.itemReportsFilterService.getOdataEndPoint());
    }
    return this.reportsDataManager;
  }

  /**
   * Lazy-creates a DataManager providing the equivalent of
   * ItemReportsFilterService.GetDataQueryODataCsv().
   */
  public getReportsCsvDataManager(): DataManager {
    if (!this.reportsCsvDataManager) {
      const oDataReportsBasePath = this.itemReportsFilterService.getOdataEndPoint();
      this.reportsCsvDataManager = this.createCsvDataManager(`${oDataReportsBasePath}csv`, true);
    }
    return this.reportsCsvDataManager;
  }

  /**
   * Lazy-creates a DataManager providing the equivalent of
   * ItemReportsFilterService.GetDataQueryODataPdf().
   */
  public getReportsPdfDataManager(): DataManager {
    if (!this.reportsPdfDataManager) {
      const oDataReportsBasePath = this.itemReportsFilterService.getOdataEndPoint();
      this.reportsPdfDataManager = this.createCsvDataManager(`${oDataReportsBasePath}pdf`, true);
    }
    return this.reportsPdfDataManager;
  }

  /**
   * Lazy-creates a DataManager providing the equivalent of
   * MessagesService.getDataQueryOData().
   */
  public getMessagesDataManager(): DataManager {
    if (!this.messagesDataManager) {
      this.messagesDataManager = this.createDataManager(this.messagesService.getOdataEndPoint());
    }
    return this.messagesDataManager;
  }

  /**
   * This data manager is always created from scratch. Caching an instance for each file name would not make sense.
   */
  public getMesasgesCsvDataManager(fileName: string): DataManager {
    const oDataMessagesBasePath = this.messagesService.getOdataEndPoint();
    return this.createCsvDataManager(`${oDataMessagesBasePath}csv/${encodeURIComponent(fileName)}`, true);
  }

  /**
   * Lazy-creates a DataManager providing cached access to UsersService.getUserAuthority().
   * When the session token changed, a new DataManager instance is created.
   */
  public getUserAuthorityDataManager(): DataManager {
    // Only use cache if same session
    if (!this.authorityDataManager || this.lastToken !== this.authenticationService.getToken()) {
      this.authorityDataManager = new DataManager({
        // TODO(schuster): generate getter for this URL in code generator
        url: '/api/v1/Users/userauthority',
        adaptor: new AuthenticatedAdaptor(this.authenticationService),
        offline: true,
      });
      this.lastToken = this.authenticationService.getToken();
    }

    return this.authorityDataManager;
  }

  private createDataManager(odataEndpoint: string): DataManager {
    return new DataManager({
      url: odataEndpoint,
      adaptor: new AuthenticatedODataV4Adaptor(this.authenticationService),
    });
  }

  private createSeekingDataManager(odataEndpoint: string): DataManager {
    return new DataManager({
      url: odataEndpoint,
      adaptor: new SeekingODataV4Adaptor(this.authenticationService),
    });
  }

  private createCsvDataManager(odataEndpoint: string, urlAuthentication: boolean): DataManager {
    const dataManager = new DataManager({
      url: odataEndpoint,
      adaptor: urlAuthentication
        ? new UrlAuthenticatedODataV4AdaptorCsv(this.authenticationService)
        : new AuthenticatedODataV4AdaptorCsv(this.authenticationService),
    });
    // avoid parsing of result
    dataManager.dateParse = false;

    return dataManager;
  }
}
