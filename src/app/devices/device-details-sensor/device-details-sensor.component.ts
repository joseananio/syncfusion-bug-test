import { DevicesOutputDto, Port } from 'src/app/core/services';
import {
  Component, OnInit, ChangeDetectionStrategy, Input, ChangeDetectorRef,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { Observable } from 'rxjs';
import { NotificationService } from 'src/app/core/services/local-services';
import { DeviceSensorStructureComponent, SensorDialogData } from '../device-sensor-structure/device-sensor-structure.component';

import { DevicesService } from '../../core/services/api/devices.service';

interface SensorPort {
  name: string;
  port: Port;
  loading?: boolean;
}

@Component({
  selector: 'app-device-details-sensor',
  templateUrl: './device-details-sensor.component.html',
  styleUrls: ['./device-details-sensor.component.scss'],
  // This is suggested by my cli, needs discussion:
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeviceDetailsSensorComponent implements OnInit {
  public availableSensorPorts: SensorPort[];

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private dialog: MatDialog,
    private devicesService: DevicesService,
    private notificationService: NotificationService,
  ) { }

  @Input() device: DevicesOutputDto;

  ngOnInit() {
    this.availableSensorPorts = this.device.availablePorts.map((port: Port) => ({
      port,
      name: this.getPortName(port),
    }));
  }

  public onSensorLinkClick(port: Port): void {
    const sensorData: SensorDialogData = {
      title: _('DEVICES.CREATE_SENSOR'),
      message: _('DEVICES.CREATE_SENSOR_HINT'),
      device: this.device,
      // TODO: There might be sensors that require multiple ports
      sensorPorts: [{
        ancestorDevice_PortTypeName: port.portType.typeName,
        ancestorDevice_PortIndex: port.index,
      }],
    };
    this.dialog.open(DeviceSensorStructureComponent, {
      data: sensorData,
      width: '50%',
    }).afterClosed().subscribe(
      (request?: Observable<void>) => {
        if (request) {
          const portItem: SensorPort = this.availableSensorPorts.find(
            (sensorPort: SensorPort) => sensorPort.name === this.getPortName(port),
          );
          if (portItem) {
            portItem.loading = true;
            // The change detection needs to be triggered manually for some unknown reason.
            this.changeDetectorRef.detectChanges();
          }

          request.subscribe(
            () => {
              this.updateAvailableSensors();
            },
            (error) => {
              console.error(error);
              let message;
              if (error.error.errorCode === 'DEVICE_IDENTITY_OBJECT_ALREADY_EXISTS') {
                message = _('DEVICES.NAME_ALREADY_ASSIGNED');
              } else if (error.error.errorCode === 'DEVICE_PORT_ALREADY_LINKED') {
                message = _('DEVICES.PORT_TAKEN');
              } else {
                message = _('DEVICES.ERROR_OCCURED');
              }

              this.notificationService.notify(message);
              this.updateAvailableSensors();
            },
          );
        }
      },
    );
  }

  private updateAvailableSensors(): void {
    this.devicesService.getDeviceUUIDMetadata(this.device.uuid).subscribe(
      (res) => {
        const oldPorts = this.availableSensorPorts;
        this.availableSensorPorts = res.availablePorts.map((port: Port) => {
          const oldPort = oldPorts.find((currentOldPort) => currentOldPort.name === this.getPortName(port));

          return {
            port,
            name: this.getPortName(port),
            loading: oldPort && oldPort.loading,
          };
        });
        // The change detection needs to be triggered manually for some unknown reason.
        this.changeDetectorRef.detectChanges();
      },
      (err) => {
        this.notificationService.notify(_('DEVICES.COULD_NOT_GET_AVAILABLE_SENSORS'));
        console.error(err);
      },
    );
  }

  private getPortName(port: Port): string {
    return `${port.portType.typeName} ${port.index}`;
  }

  public customChangeDetection(index: number, item: any) {
    return item;
  }
}
