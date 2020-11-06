import { Component, Input } from '@angular/core';
import { DeviceTypeName } from 'src/app/core/services';

@Component({
  selector: 'app-device-icon',
  templateUrl: './device-icon.component.html',
  styleUrls: ['./device-icon.component.scss'],
})
export class DeviceIconComponent {
  private static iconMap = {
    [DeviceTypeName.BeatE]: 'assets/img/icon-beat-e.png',
    Controller: 'assets/img/icon-controller.png',
    [DeviceTypeName.DTE]: 'assets/img/icon-dte.png',
    [DeviceTypeName.KeySwitch]: 'assets/img/icon-key-switch.png',
    [DeviceTypeName.Rulantica]: 'assets/img/icon-rulantica.png',
    [DeviceTypeName.WallE]: 'assets/img/icon-wall-e.png',
    [DeviceTypeName.PressureSensor]: 'assets/img/icon-wire-sens-p.png',
    [DeviceTypeName.TemperatureSensor]: 'assets/img/icon-wire-sens-t.png',
    [DeviceTypeName.FlowAndTemperatureSensor]: 'assets/img/icon-wire-sens-vt.png',
    [DeviceTypeName.ZirkE]: 'assets/img/icon-zirk-e.png',
    [DeviceTypeName.Hyplus]: 'assets/img/icon-hyplus.png',
  };

  @Input()
  deviceType: string;

  @Input()
  size: number;

  public getIcon() {
    const foundIcon = DeviceIconComponent.iconMap[this.deviceType];

    return foundIcon || 'assets/img/icon-blank.png';
  }
}
