import {
  Component, EventEmitter, Inject, OnInit, Output, ViewChild,
} from '@angular/core';
import { NgForm } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { TranslateService } from '@ngx-translate/core';
import { FieldSettingsModel } from '@syncfusion/ej2-angular-dropdowns';
import { Observable } from 'rxjs';
import {
  BackendConstIpAddress, ControllerOutputDto, ControllerPointCreateInput,
  ControllerPointOutputDto, ControllerPointService, DevicePointCreateInput, DevicePointService,
  DevicesOutputDto,
  DeviceTypeName, UpdateMainMetadataCompnentInput,
} from 'src/app/core/services';
import { environment } from 'src/environments/environment';

export interface InputDialogData {
  selectedItem: string;
  mode: string;
  device: DevicesOutputDto | ControllerOutputDto;
}

@Component({
  selector: 'app-device-point-basic-info',
  templateUrl: './device-point-basic-info.component.html',
  styleUrls: ['./device-point-basic-info.component.scss'],
})
export class DevicePointBasicInfoComponent implements OnInit {
  public ipPattern = BackendConstIpAddress._2505204090109093250520409010909;

  @ViewChild(NgForm) formView;

  public formData: {
    id: string;
    name: string;
    remark: string;
    ip: string;
    serial: number;
    revision: number;
  };

  public stateLoading = false;

  public uuid = '';

  public deviceTypes: FieldSettingsModel[] = [
    { text: _('API.DEVICE_TYPE_NAME.WallE'), value: DeviceTypeName.WallE },
    { text: _('API.DEVICE_TYPE_NAME.BeatE'), value: DeviceTypeName.BeatE },
    { text: _('API.DEVICE_TYPE_NAME.DTE'), value: DeviceTypeName.DTE },
    { text: _('API.DEVICE_TYPE_NAME.ZirkE'), value: DeviceTypeName.ZirkE },
    { text: _('API.DEVICE_TYPE_NAME.Rulantica'), value: DeviceTypeName.Rulantica },
    { text: _('API.DEVICE_TYPE_NAME.KeySwitch'), value: DeviceTypeName.KeySwitch },
    { text: _('API.DEVICE_TYPE_NAME.Hyplus'), value: DeviceTypeName.Hyplus },
    { text: _('API.DEVICE_TYPE_NAME.MagneticValve'), value: DeviceTypeName.MagneticValve },
    { text: _('API.DEVICE_TYPE_NAME.TemperatureSensor'), value: DeviceTypeName.TemperatureSensor },
    { text: _('API.DEVICE_TYPE_NAME.FlowSensor'), value: DeviceTypeName.FlowSensor },
    { text: _('API.DEVICE_TYPE_NAME.PressureSensor'), value: DeviceTypeName.PressureSensor },
    { text: _('API.DEVICE_TYPE_NAME.PulseSensor'), value: DeviceTypeName.PulseSensor },
    { text: _('API.DEVICE_TYPE_NAME.FlowAndTemperatureSensor'), value: DeviceTypeName.FlowAndTemperatureSensor },
    { text: _('API.DEVICE_TYPE_NAME.Controller'), value: 'Controller' },
    ...(
      environment.includeWireSensDevicePoints
        ? [{ text: _('API.DEVICE_TYPE_NAME.WireSens'), value: DeviceTypeName.WireSens }]
        : []
    ),
  ];

  public selectedDeviceType: string;

  /**
   * Notification about form changes.
   */
  @Output()
  public formChange = new EventEmitter<{ valid: boolean; changed: boolean; }>();

  constructor(@Inject(MAT_DIALOG_DATA) public data: InputDialogData,
              private translateService: TranslateService,
              private devicePointService: DevicePointService,
              private controllerPointService: ControllerPointService) {
  }

  ngOnInit() {
    // Translate the device type names. Due to Syncfusion issues it is not possible to do this using
    // the translate pipe.
    const texts = this.deviceTypes.map((deviceType) => deviceType.text);
    this.translateService.get(texts).subscribe(
      (translations) => {
        this.deviceTypes.forEach((deviceType) => { deviceType.text = translations[deviceType.text]; });
      },
    );

    this.formData = {
      id: '',
      name: '',
      remark: '',
      ip: undefined,
      revision: undefined,
      serial: undefined,
    };
    if (this.data.mode === 'edit') {
      this.stateLoading = true;
      this.uuid = this.data.selectedItem;
      if (this.data.device['deviceTypeName'] === undefined) {
        this.stateLoading = false;

        const controller = this.data.device as ControllerPointOutputDto;
        this.uuid = controller.uuid;
        this.selectedDeviceType = 'Controller';

        this.formData.name = controller.name;
        this.formData.remark = controller.remark;
      } else {
        this.stateLoading = false;

        const device = this.data.device as DevicesOutputDto;
        this.formData.name = device.name;
        this.formData.remark = device.remark;
        this.selectedDeviceType = device.deviceTypeName;
      }
    } else {
      const parentUUID = this.data.selectedItem;
      this.uuid = parentUUID;
    }
  }

  public isHyplus() {
    return this.selectedDeviceType === DeviceTypeName.Hyplus;
  }

  public isController() {
    return this.data.device['deviceTypeName'] === undefined;
  }

  public save(): Observable<string | ControllerPointOutputDto> {
    if (this.data.mode === 'new') {
      if (this.selectedDeviceType === 'Controller') {
        const cp: ControllerPointCreateInput = {
          name: this.formData.name,
          remark: this.formData.remark,
          pointAddressUUID: this.uuid,
        };
        return this.controllerPointService.createControllerPoint(cp);
      }

      const post: DevicePointCreateInput = {
        name: this.formData.name,
        ipAddress: this.formData.ip,
        remark: this.formData.remark,
        pointAddressUUID: this.uuid,
        deviceTypeName: this.selectedDeviceType,
        serialNumber: this.formData.serial,
        revisionNumber: this.formData.revision,
        reloadConfig: true,
      };
      return this.devicePointService.createDevicePoint(post);
    }
    if (this.data.mode === 'edit') {
      if (this.data.device['deviceTypeName'] === undefined) {
        const cp: UpdateMainMetadataCompnentInput = {
          name: this.formData.name,
          remark: this.formData.remark,
        };
        return this.controllerPointService.setControllerPointMainMetaData(this.uuid, cp);
      }

      const dp: UpdateMainMetadataCompnentInput = {
        name: this.formData.name,
        remark: this.formData.remark,
      };
      return this.devicePointService.setDevicePointMainMetaData(this.uuid, dp);
    }

    return undefined;
  }

  onChange(): void {
    this.formChange.emit({
      valid: this.isFormValid(),
      changed: true,  // can be updated to detect unchanged state later
    });
  }

  onDeviceTypeChange(event) {
    this.selectedDeviceType = event.itemData.value;
    this.onChange();
  }

  private isFormValid() {
    return this.formView.valid && !!this.selectedDeviceType;
  }

  getTranslatedDeviceTypeName(deviceTypeName: string): string {
    return this.deviceTypes.find((deviceType) => deviceType.value === deviceTypeName).text;
  }
}
