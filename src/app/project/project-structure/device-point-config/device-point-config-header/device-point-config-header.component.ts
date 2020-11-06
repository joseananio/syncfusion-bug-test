import { Component, OnInit, Input } from '@angular/core';
import { DevicesOutputDto } from 'src/app/core/services';
import { PointAddressService } from 'src/app/core/services/local-services';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';

interface ExtendedDevicesOutputDto extends DevicesOutputDto {
  firemwareVersion: string;
  location: string;
}
@Component({
  selector: 'app-device-point-config-header',
  templateUrl: './device-point-config-header.component.html',
  styleUrls: ['./device-point-config-header.component.scss'],
})
export class DevicePointConfigHeaderComponent implements OnInit {
  constructor(
     private pointAddressService: PointAddressService,
  ) { }

  baseData = [
    { title: _('GLOBAL.NAME'), key: 'name' },
    { title: -('PROJECT.DEVICE_TYPE'), key: 'deviceTypeName' },
    { title: _('PROJECT.LOCATION'), key: 'location' },
    { title: _('PROJECT.REMARK'), key: 'remark' },
  ];

  @Input()
  device: ExtendedDevicesOutputDto;

  ngOnInit() {
    this.pointAddressService.getPointAddressPath(this.device.devicePointUUID).subscribe(
      (path) => {
        this.device.location = path;
      },
      (error) => {
        // fail silently
        this.device.location = '-';
      },
    );
  }
}
