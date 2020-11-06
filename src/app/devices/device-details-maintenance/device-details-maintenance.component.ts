import {
  Component, OnInit, Input, AfterViewInit, EventEmitter, Output, ViewChild,
} from '@angular/core';
import { DataManager, Query } from '@syncfusion/ej2-data';
import { SortSettingsModel, ColumnModel, GridComponent } from '@syncfusion/ej2-angular-grids';
import {
  DevicesOutputDto,
  DevicesService,
  SetDeviceMaintenanceIntervalInput,
  EventTypes,
  AuthorityCodes,
} from 'src/app/core/services';
import { MatDialog } from '@angular/material/dialog';
import { QuestionDialogComponent } from 'src/app/shared/components/modal-dialog/question-dialog/question-dialog.component';
import { DataManagerService, NotificationService, MessageToolsService } from 'src/app/core/services/local-services';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';

@Component({
  selector: 'app-device-details-maintenance',
  templateUrl: './device-details-maintenance.component.html',
  styleUrls: ['./device-details-maintenance.component.scss'],
})
export class DeviceDetailsMaintenanceComponent implements OnInit, AfterViewInit {
  constructor(
    private devicesService: DevicesService,
    private dialog: MatDialog,
    private dataManagerService: DataManagerService,
    private notificationService: NotificationService,
    private messageToolsService: MessageToolsService,
  ) { }

  @ViewChild('maintenancegrid')
  maintenanceGrid: GridComponent;

  @Input()
  public device: DevicesOutputDto;

  public nextMaintenanceTimestamp: Date;

  maintenanceHistory: DataManager;

  query: Query = new Query();

  maintenanceInterval: number;

  oldMaintenanceInterval: number;

  activateButton = false;

  AuthorityCodes = AuthorityCodes;

  authorities: Set<string> = new Set();

  authoritiesRequest;

  columns: ColumnModel[] = [
    {
      field: 'createdTime',
      headerText: _('GLOBAL.DATE'),
      format: { type: 'dateTime', skeleton: 'short' },
      width: 60,
      textAlign: 'Left',
    },
    {
      field: 'summary',
      headerText: _('GLOBAL.DESCRIPTION'),
      width: 40,
      textAlign: 'Left',
    },
  ];

  public gridSortSettings: SortSettingsModel = {
    allowUnsort: false,
    columns: [{ field: 'createdTime', direction: 'Descending' }],
  };

  @Output()
  change: EventEmitter<any> = new EventEmitter();

  ngOnInit() {
    this.authoritiesRequest = this.dataManagerService.getUserAuthorityDataManager().ready;
    this.maintenanceInterval = Number(this.device.maintenanceInterval);
    this.oldMaintenanceInterval = this.maintenanceInterval;
    this.maintenanceHistory = this.dataManagerService.getMessagesDataManager();
    this.query
      .addParams('EventTypes', EventTypes.MAINTENANCE)
      .where('CreatedByUuid', 'equal', this.device.devicePointUUID);

    this.nextMaintenanceTimestamp = this.calcNextDate();
  }

  ngAfterViewInit() {
    this.authoritiesRequest.then((authorities: string[]) => {
      this.authorities = new Set(authorities['result'].authorityCodes);
    }).catch(() => {
      this.notificationService.notify(_('GLOBAL.COULD_NOT_LOAD_PRIVILEGES'));
    });
  }

  public maintenanceEnabled(): boolean {
    return this.authorities.has(AuthorityCodes.EXECUTEDEVICEMAINTENANCE) && !!this.maintenanceInterval;
  }

  public onPerformMaintenance(): void {
    this.dialog.open(QuestionDialogComponent, { data: { message: _('DEVICES.IS_NEW_MAINTENANCE_CARRIED_OUT') } })
      .afterClosed().subscribe(
        (response) => {
          if (response) {
            this.devicesService.executeDeviceMaintenanceForm(this.device.devicePointUUID)
              .subscribe(
                (done) => {
                  this.maintenanceGrid.refresh();
                  this.devicesService.getDeviceUUIDMetadata(this.device.uuid)
                    .subscribe(
                      (x) => {
                        this.device.lastMaintenanceTimestamp = x.lastMaintenanceTimestamp;
                      },
                      (error) => {
                        this.reportMaintenanceError(error);
                      },
                    );
                },
                (error) => {
                  this.reportMaintenanceError(error);
                },
              );
          }
          this.change.emit();
        },
      );
  }

  private reportMaintenanceError(error) {
    console.error(error);
    this.notificationService.notify(_('DEVICES.COULD_NOT_RECORD_MAINTENANCE'));
  }

  public onValueChange(event): void {
    this.activateButton = this.oldMaintenanceInterval !== this.maintenanceInterval;
  }

  public onSetInterval(): void {
    if (Number.isNaN(Number(this.device.maintenanceInterval))) {
      return;
    }
    const maintIntervalInput: SetDeviceMaintenanceIntervalInput = { maintenanceIntervalDays: this.maintenanceInterval };
    this.devicesService.setDeviceMaintenanceInterval(this.device.devicePointUUID, maintIntervalInput)
      .subscribe(
        (done) => {
          this.nextMaintenanceTimestamp = this.calcNextDate();

          this.activateButton = false;
          this.change.emit();
        },
        (error) => {
          console.info(error);
          this.notificationService.notify(_('DEVICES.COULD_NOT_SET_INTERVAL'));
        },
      );
  }

  private calcNextDate(): Date {
    return new Date(new Date(this.device.lastMaintenanceTimestamp).getTime() + this.maintenanceInterval * 86400000);
  }

  public getMessageParameters(jsonString: string): Object {
    return this.messageToolsService.getMessageParameters(jsonString);
  }
}
