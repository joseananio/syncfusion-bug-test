import {
  Component, EventEmitter, HostBinding, OnInit, Output,
} from '@angular/core';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { DevicePointService } from 'src/app/core/services';
import { NotificationService } from 'src/app/core/services/local-services';
import { Device } from '../dashboard/dashboard-overview/dashboard-overview.component';

@Component({
  selector: 'app-device-list',
  templateUrl: './device-list.component.html',
  styleUrls: ['./device-list.component.scss'],
})
export class DeviceListComponent implements OnInit {
  @Output() deviceSelectedEvent: EventEmitter<Device> = new EventEmitter();

  @HostBinding('hidden')
  public hide: boolean;

  public devices: Device[];

  public dropDownFields = {
    value: 'uuid',
    text: 'name',
    groupBy: '',
  };

  constructor(
    private devicePointService: DevicePointService,
    private notificationService: NotificationService,
  ) { }

  ngOnInit() {
    this.loadDevice();
  }

  public onDeviceSelected(selectedValueId): void {
    const selectedValue = this.devices.find((device) => device.uuid === selectedValueId);
    this.deviceSelectedEvent.emit(selectedValue);
    this.devices = this.devices.filter((x) => x.uuid !== selectedValueId);
    this.hide = true;
    console.log(this.hide, selectedValue, selectedValueId, 'sssss');
  }

  private loadDevice(): void {
    this.devicePointService.getDevicePoints().subscribe(
      (devicePointList) => {
        // Filter only devicePoints that have a real device connected
        const connectedDevicePointList = devicePointList.filter(
          // Empty devicePoints have device_UUID = "". Empty strings are caught here:
          (devicePoint) => devicePoint.device_UUID,
        );
        this.devices = connectedDevicePointList.map((devicePoint) => ({
          name: devicePoint.name, uuid: devicePoint.device_UUID, position: { x: 0, y: 0 }, isExpanded: false,
        }));
      },
      (error) => {
        this.notificationService.notify(_('DASHBOARD.COULD_NOT_GET_DEVICES'));
        console.error(error);
      },
    );
  }
}
