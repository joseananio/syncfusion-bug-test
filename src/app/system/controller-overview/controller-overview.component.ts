import { Component, OnInit } from '@angular/core';
import {
  ControllerService,
  ControllerOutputDto,
  DevicesOutputDto,
  ControllerStatus,
  DeviceStatusSimple,
} from 'src/app/core/services';
import { ColumnModel } from '@syncfusion/ej2-angular-grids';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { LayoutModule } from '../../shared/layout.module';

@Component({
  selector: 'app-controller-overview',
  templateUrl: './controller-overview.component.html',
  styleUrls: ['./controller-overview.component.scss'],
})
export class ControllerOverviewComponent implements OnInit {
  columns: ColumnModel[] = [
    // { field: 'status', headerText: _('SYSTEM.CONTROLLER_OVERVIEW_STATUS') },
    { field: 'name', headerText: _('SYSTEM.CONTROLLER_OVERVIEW_NAME') },
    { field: 'ip', headerText: _('SYSTEM.CONTROLLER_OVERVIEW_IP'), hideAtMedia: LayoutModule.getHideAtMedia('sm') },
    {
      field: 'mac',
      headerText: _('SYSTEM.CONTROLLER_OVERVIEW_MAC'),
      hideAtMedia: LayoutModule.getHideAtMedia('sm'),
      valueAccessor: (field: string, data: Object): string => (data[field] ? data[field].match(/\w{1,2}/g).join(':') : ''),
    },
    {
      field: 'lastNotification',
      headerText: _('SYSTEM.CONTROLLER_OVERVIEW_LAST_NOTIFICATION'),
      hideAtMedia: LayoutModule.getHideAtMedia('sm'),
    },
  ];

  statusHeaderText = _('SYSTEM.CONTROLLER_OVERVIEW_STATUS');

  controllerList: ControllerOutputDto[] = [];

  constructor(private controllerService: ControllerService) {}

  ngOnInit() {
    this.controllerService.getControllerMetadataList().subscribe(
      (devices) => {
        this.controllerList = this.controllerList.concat(
          devices.map((device) => ({
            // TODO: Use it when ControllerStatusEnum contains offline state
            status: this.getStatusLabel(this.getStatus(device)),
            color: this.getStatus(device),
            name: device.name,
            ip: device.ipAddress ? device.ipAddress : '0.0.0.0',
            mac: device.macAddress ? device.macAddress : '000000000000',
            // TODO(schuster): get last message from service when endpoint available
            lastNotification: '',
          })),
        );
      },
    );
  }

  private getStatus(controllerOrDevice: ControllerOutputDto | DevicesOutputDto): string {
    if (this.isInFatalPersistentSystemFailure(controllerOrDevice)) {
      return _('SYSTEM.ERROR');
    }
    if (this.isOffline(controllerOrDevice)) {
      return _('SYSTEM.OFFLINE');
    }
    return _('SYSTEM.ONLINE');
  }

  private isInFatalPersistentSystemFailure(controllerOrDevice: ControllerOutputDto | DevicesOutputDto): boolean {
    return (controllerOrDevice as ControllerOutputDto).controllerStatus
      === ControllerStatus.FATALPERSISTANTSYSTEMFAILURE;
  }

  private isOffline(controllerOrDevice: ControllerOutputDto | DevicesOutputDto): boolean {
    return (
      (controllerOrDevice as ControllerOutputDto).controllerStatus === ControllerStatus.OFFLINE
      || (controllerOrDevice as DevicesOutputDto).deviceStatusSimple === DeviceStatusSimple.Offline
    );
  }

  private getStatusLabel(status: string): string {
    const label = status.substring(status.search('-') + 1).toUpperCase();
    return label;
  }
}
