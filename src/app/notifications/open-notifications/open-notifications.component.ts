import {
  AfterViewInit, Component, EventEmitter, OnInit, Output, ViewChild,
} from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import {
  CellSelectEventArgs,
  ColumnModel, FilterSettingsModel,
  GridComponent, SelectionSettingsModel,
  SortSettingsModel,
} from '@syncfusion/ej2-angular-grids';
import { DataManager, Query } from '@syncfusion/ej2-data';
import {
  AuthorityCodes, EventTypes, MessageOutputDto, MessagesService,
} from 'src/app/core/services';
import { DataManagerService, MessageToolsService, NotificationService } from 'src/app/core/services/local-services';
import { LayoutModule } from 'src/app/shared/layout.module';
import { environment } from 'src/environments/environment';
import { NotificationDetailsComponent } from './notification-details/notification-details.component';

@Component({
  selector: 'app-open-notifications',
  templateUrl: './open-notifications.component.html',
  styleUrls: ['./open-notifications.component.scss'],
})
export class OpenNotificationsComponent implements OnInit, AfterViewInit {
  public notificationSource: DataManager;

  public query: Query = new Query();

  public notificationGridSelectionsOptions: SelectionSettingsModel;

  public pageSettings: Object;

  public filterSettings: FilterSettingsModel = {
    type: 'CheckBox',
    enableCaseSensitivity: true,  // TODO(schuster): remove when tolower() supported by backend
  };

  public gridSortSettings: SortSettingsModel = {
    allowUnsort: false,
    columns: [{ field: 'createdTime', direction: 'Descending' }],
  };

  public allowFiltering = environment.allowGridFiltering;

  // TODO: Match hideAtMedia with params given in shared css class for bootstrap-userGrid
  allNotificationsColumnData: ColumnModel[] = [
    {
      headerText: _('GLOBAL.DATE'),
      field: 'createdTime',
      textAlign: 'Left',
      format: { type: 'dateTime', skeleton: 'short' },
      width: 170,
      allowSorting: true,
      allowFiltering: false,
    },
    {
      field: 'createdByName',
      headerText: _('NOTIFICATIONS.MESSAGE_SOURCE'),
      textAlign: 'Left',
      allowSorting: false,
      allowFiltering: true,
    },
    {
      field: 'summary',
      headerText: _('GLOBAL.DESCRIPTION'),
      textAlign: 'Left',
      hideAtMedia: LayoutModule.getHideAtMedia('sm'),
      allowSorting: false,
      allowFiltering: false,
    },
  ];

  AuthorityCodes = AuthorityCodes;

  authorities: Set<string> = new Set();

  authoritiesRequest;

  @ViewChild(GridComponent)
  private notificationGrid: GridComponent;

  private initialnotificationGridLoad = true;

  @Output()
  change: EventEmitter<any> = new EventEmitter();

  constructor(
    protected notificationsService: MessagesService,
    private dataManagerService: DataManagerService,
    private dialog: MatDialog,
    private messageToolsService: MessageToolsService,
    private notificationService: NotificationService,
    private router: Router,
  ) {}

  ngOnInit() {
    // Data notificationGrid settings
    this.notificationGridSelectionsOptions = {
      type: 'Single',
      mode: 'Both',
      enableToggle: false,
    };
    this.pageSettings = { pageSize: 20, pageSizes: [10, 20, 50, 100] };
    // Initialize notification Table
    this.authoritiesRequest = this.dataManagerService.getUserAuthorityDataManager().ready;
    this.notificationSource = this.dataManagerService.getMessagesDataManager();
    this.configureMessageQueryParameters();
  }

  private afterDialogClosed<T, R = any>(dialog: MatDialogRef<T, R>, forceUpdate?: boolean): MatDialogRef<T, R> {
    dialog.afterClosed().subscribe((data) => {
      // if is updated:
      // if (data) {
      if (forceUpdate) {
        this.refresh();
      }
    });
    return dialog;
  }

  ngAfterViewInit() {
    this.authoritiesRequest.then((authorities: string[]) => {
      this.authorities = new Set(authorities['result'].authorityCodes);
      // delay by one frame to wait for update of table column visibility
      setTimeout(() => {
        // fix the header after changing column visibility
        this.notificationGrid.refreshColumns();
      });
    }).catch(() => {
      this.notificationService.notify(_('GLOBAL.COULD_NOT_LOAD_PRIVILEGES'));
    });
  }

  public dataBound() {
    /* this.notificationnotificationGrid.autoFitColumns(); */
    /*    if (this.initialnotificationGridLoad) {
         this.initialnotificationGridLoad = false;
         const pager = document.getElementsByClassName('e-notificationGridpager');
         let topElement;
         if (this.notificationGrid.allowGrouping || this.notificationGrid.toolbar) {
           topElement = this.notificationGrid.allowGrouping ? document.getElementsByClassName('e-groupdroparea') :
             document.getElementsByClassName('e-toolbar');
         } else {
           topElement = document.getElementsByClassName('e-notificationGridheader');
         }
         this.notificationGrid.element.insertBefore(pager[0], topElement[0]);
       } */
  }

  public refresh(): void {
    this.notificationGrid.refresh();
  }

  protected configureMessageQueryParameters(): void {
    this.query
      .where('FixedByUuid', 'equal', null)
      .addParams('EventTypes', [
        EventTypes.ALARM,
        EventTypes.DISRUPTION,
        EventTypes.MAINTENANCE,
      ].join('|'));
  }

  public showAcknowledgementColumn(): boolean {
    return this.authorities.has(AuthorityCodes.ACKNOWLEDGEMESSAGE)
        || this.authorities.has(AuthorityCodes.FIXMESSAGE);
  }

  public onNotificationDetailsEvent(event: CellSelectEventArgs): void {
    const lastRow = Object.keys(this.allNotificationsColumnData).length;
    if (event.cellIndex.cellIndex === 1) {
      this.goToSourceDevice(encodeURI((event.data as MessageOutputDto).createdByName));
    } else if (event.cellIndex.cellIndex !== lastRow) {
      this.openNotificationDetails(event.data);
    }
  }

  public openNotificationDetails(selectedNotification: MessageOutputDto): void {
    this.afterDialogClosed(
      this.dialog.open(NotificationDetailsComponent, {
        data: selectedNotification,
        width: '40%',
      }),
      true,
    );
  }

  private goToSourceDevice(name: string): void {
    const navigationExtras = {
      queryParams: { filter: name },
    };
    this.router.navigate(['/devices'], navigationExtras);
  }

  public onAcknowledge(msgUuid: number): void {
    this.notificationsService.setMessageAcknowledged(msgUuid).subscribe(
      (ok) => {
        this.notificationService.notify(_('NOTIFICATIONS.ACKNOWLEDGE_SUCCESS'));
        this.refresh();
      },
      (err) => {
        this.notificationService.notify(_('NOTIFICATIONS.COULD_NOT_ACKNOWLEDGE'));
        console.error(err);
      },
    );
  }

  public onFixMessage(msgUuid: number): void {
    this.notificationsService.setMessageFixed(msgUuid).subscribe(
      (ok) => {
        this.notificationService.notify(_('NOTIFICATIONS.RESOLVE_SUCCESS'));
        this.refresh();
        // message was moved to other tab, so these need to be updated too
        this.change.emit(null);
      },
      (err) => {
        this.notificationService.notify(_('NOTIFICATIONS.COULD_NOT_FIX'));
        console.error(err);
      },
    );
  }

  public getMessageParameters(jsonString: string): Object {
    return this.messageToolsService.getMessageParameters(jsonString);
  }
}
