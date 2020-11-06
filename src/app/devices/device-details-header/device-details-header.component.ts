import {
  Component, EventEmitter, Input, OnInit, Output,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { TranslateService } from '@ngx-translate/core';
import {
  AuthorityCodes,
  BackendConstIpAddress, ControllerOutputDto, ControllerPointService,
  DeviceTypeNameMapping,
  DeviceParameter, DevicePointService, DevicesOutputDto, DevicesService,
  DeviceStatusSimple, DeviceTypeName, LocateDeviceInput, ParameterService,
  SetIPAddressInput,
} from 'src/app/core/services';
import { DataManagerService, NotificationService, PointAddressService } from 'src/app/core/services/local-services';
import { FeedbackDialogComponent } from 'src/app/shared/components/modal-dialog/feedback-dialog/feedback-dialog.component';
import { InputDialogComponent, InputDialogData } from 'src/app/shared/components/modal-dialog/input-dialog/input-dialog.component';
import { QuestionDialogComponent } from 'src/app/shared/components/modal-dialog/question-dialog/question-dialog.component';
import { LOCATABLE_DEVICE_TYPES, RESETABLE_DEVICE_TYPES } from 'src/app/shared/utils/device-utils';

interface ExtendedDevicesOutputDto extends DevicesOutputDto {
  firemwareVersion: string;
  location: string;
  interfaceVersion;
}

interface ExtendedControllerOutputDto extends ControllerOutputDto {
  firemwareVersion: string;
  location: string;
  // TODO (Reger): Refactor hacky type circumvention in parent component
  deviceTypeName: 'Controller';
}

interface BaseDataItem {
  title: string;
  key: string;
  value?: string;
  source?: 'deviceList' | 'parameterValue' | 'location' | 'dtevariant' | 'hardcoded';
}

@Component({
  selector: 'app-device-details-header',
  templateUrl: './device-details-header.component.html',
  styleUrls: ['./device-details-header.component.scss'],
})
export class DeviceDetailsHeaderComponent implements OnInit {
  constructor(
    private devicesService: DevicesService,
    private devicePointService: DevicePointService,
    private parameterService: ParameterService,
    private dataManagerService: DataManagerService,
    private controllerPointService: ControllerPointService,
    private pointAddressService: PointAddressService,
    private translateService: TranslateService,
    private notificationService: NotificationService,
    private dialog: MatDialog,
  ) { }

  authorities: Set<string> = new Set();

  AuthorityCodes = AuthorityCodes;

  baseData: BaseDataItem[] = [];

  deviceParameter: DeviceParameter[] = null;

  hypotheticalDevice: ExtendedDevicesOutputDto;

  /**
   * Device info put together as 'gridDataSource' in devices.component.ts.
   */
  @Input()
  device: ExtendedDevicesOutputDto | ExtendedControllerOutputDto;

  @Output()
  change: EventEmitter<any> = new EventEmitter();

  public getDeviceTypeI18nKey(deviceTypeName: DeviceTypeName | 'Controller'): string {
    return DeviceTypeNameMapping[deviceTypeName] || deviceTypeName;
  }

  ngOnInit() {
    this.dataManagerService.getUserAuthorityDataManager().ready.then(
      (authorities) => {
        this.authorities = new Set(authorities['result'].authorityCodes);
      },
    ).catch(() => {
      this.notificationService.notify(_('GLOBAL.COULD_NOT_LOAD_PRIVILEGES'));
    });
    const deviceBaseData: BaseDataItem[] = [
      { title: _('GLOBAL.NAME'), key: 'name', source: 'deviceList' },
      { title: _('DEVICES.DEVICE_TYPE'), key: 'deviceTypeName', source: 'deviceList' },
      { title: _('DEVICES.SERIAL_NUMBER'), key: 'serialNumber', source: 'deviceList' },
      { title: _('DEVICES.LOCATION'), key: 'location', source: 'location' },
      { title: _('GLOBAL.STATUS'), key: 'status', source: 'deviceList' },  // TODO: display as AppStatusComponent
      { title: _('DEVICES.SOFTWARE_VERSION'), key: 'softwareVersion', source: 'deviceList' },
      { title: _('DEVICES.INTERFACE'), key: 'interfaceVersion', source: 'deviceList' },
      { title: _('DEVICES.DTE_VARIANT'), key: 'dteDV', source: 'dtevariant' },
    ];
    const controllerBaseData: BaseDataItem[] = [
      { title: _('GLOBAL.NAME'), key: 'name', source: 'deviceList' },
      {
        title: _('DEVICES.DEVICE_TYPE'), key: 'none', source: 'hardcoded', value: 'Controller',
      },
      { title: _('DEVICES.SERIAL_NUMBER'), key: 'serialNumber', source: 'deviceList' },
      { title: _('DEVICES.CONTROLLER_TYPE'), key: 'controllerType', source: 'deviceList' },
      { title: _('DEVICES.SOFTWARE_VERSION'), key: 'softwareVersion', source: 'deviceList' },
      { title: _('DEVICES.LOCATION'), key: 'location', source: 'location' },
      { title: _('DEVICES.MAC_ADDRESS'), key: 'macAddress', source: 'deviceList' },  // TODO: display as AppStatusComponent
      { title: _('GLOBAL.STATUS'), key: 'status', source: 'deviceList' },  // TODO: display as AppStatusComponent
      { title: _('DEVICES.IP_ADDRESS'), key: 'ipAddress', source: 'deviceList' },
    ];
    this.baseData = this.isController() ? controllerBaseData : deviceBaseData;
    // trigger item refresh initially to avoid items popping
    this.refreshItems();
    if (!this.isController()) {
      this.hypotheticalDevice = this.device as ExtendedDevicesOutputDto;
      if (this.hypotheticalDevice.devicePointUUID) {
        this.pointAddressService.getPointAddressPath(this.hypotheticalDevice.devicePointUUID).subscribe(
          (path) => {
            this.device.location = path;
            this.refreshItems();
          },
          (error) => {
            // fail silently
            this.device.location = '-';
          },
        );
      }
    } else {
      this.pointAddressService.getPointAddressPath((this.device as ExtendedControllerOutputDto).controllerPoint_UUID).subscribe(
        (path) => {
          this.device.location = path;
          this.refreshItems();
        },
        (error) => {
          // fail silently
          this.device.location = '-';
        },
      );
    }

    if (this.hypotheticalDevice && this.hypotheticalDevice.devicePointUUID) {
      this.parameterService.getParameterValue(this.hypotheticalDevice.devicePointUUID).subscribe(
        (values) => {
          this.deviceParameter = values;
          this.refreshItems();
        },
        (err) => {
          this.notificationService.notify(_('DEVICES.COULD_NOT_GET_PARAMETER_VALUES'));
          console.error(err);
        },
      );
    }
  }

  public onReset(): void {
    this.dialog.open(QuestionDialogComponent, {
      data: {
        title: this.device.name,
        message: this.device.deviceTypeName === 'Controller'
          ? _('DEVICES.CONTROLLER_RESET_ALERT')
          : _('DEVICES.DEVICE_RESET_ALERT'),
        params: { name: this.device.name },
      },
      width: '30%',
    }).afterClosed().subscribe(
      (res) => {
        if (res) {
          if (this.device.deviceTypeName === 'Controller') {
            this.controllerPointService.resetControllerByUUID(this.device.uuid).subscribe(
              (response) => {
                this.openFeedbackDialog(_('DEVICES.CONTROLLER_RESTARTED'));
                this.change.emit();
              },
              (err) => {
                this.openFeedbackDialog(_('DEVICES.CONTROLLER_FAILED_RESTART'), null, '50%');
              },
            );
          } else {
            const hypotheticalDevice = this.device;
            this.devicesService.resetDevice({
              devicePointUuid: hypotheticalDevice.devicePointUUID,
            }).subscribe(
              (response) => {
                this.openFeedbackDialog(_('DEVICES.DEVICE_RESTARTED'));
                this.change.emit();
              },
              (err) => {
                this.openFeedbackDialog(_('DEVICES.DEVICE_FAILED_RESTART'), null, '50%');
              },
            );
          }
        }
      },
    );
  }

  public isController(): boolean {
    if (this.device.deviceTypeName === 'Controller') {
      return true;
    }
    return false;
  }

  /**
   * Indicates if the current device type can be reset or restarted at all.
   */
  public isResetableDeviceType(): boolean {
    return RESETABLE_DEVICE_TYPES.has(this.device.deviceTypeName);
  }

  /**
   * Indicates if the current device is in a state allowing resetting or restarting.
   */
  public canResetDevice(): boolean {
    const hypotheticalDevice = this.device as ExtendedDevicesOutputDto;
    const isOffline = hypotheticalDevice.deviceStatusSimple === DeviceStatusSimple.Offline;
    const isUnlinked = !hypotheticalDevice.devicePointUUID && !this.device['controllerPoint_UUID'];

    return !isOffline && !isUnlinked;
  }

  /**
   * Indicates if the current device type can be located at all.
   */
  public isLocateableDeviceType(): boolean {
    return LOCATABLE_DEVICE_TYPES.has(this.device.deviceTypeName);
  }

  private refreshItems(): void {
    this.baseData = this.baseData.map(
      (item) => this.getBaseDataValues(item),
    );
  }

  /**
   * Get basedata of device from multiple sources.
   * Returns item.value = null if item shall not be displayed.
   */
  private getBaseDataValues(item: BaseDataItem): BaseDataItem {
    switch (item.source) {
      case 'deviceList': {
        if (item.key === 'macAddress') {
          item.value = this.device[item.key] ? this.device[item.key].match(/\w{1,2}/g).join(':') : '';
        } else if (item.key === 'deviceTypeName') {
          this.translateService.get(this.getDeviceTypeI18nKey(this.device ? this.device[item.key] : null)).subscribe(
            (string) => {
              item.value = string;
            },
          );
        } else if (item.key === 'status') {
          this.translateService.get(this.device[item.key]).subscribe(
            (string) => {
              item.value = string;
            },
          );
        } else {
          item.value = this.checkNullValue(this.device ? this.device[item.key] : null);
        }
        break;
      }
      case 'parameterValue': {
        // Initialize empty value to already display empty parameter (avoid popping parameters)
        const parameter = (this.deviceParameter || []).find(
          (param) => param.name === item.key,
        );
        item.value = this.checkNullValue(parameter ? parameter.value : '');
        break;
      }
      case 'dtevariant': {
        // don't display parameter since device is no DTE
        let p: any;
        if (this.device.deviceTypeName === DeviceTypeName.DTE) {
          p = (this.deviceParameter || []).find((param) => param.name === item.key);
        }
        item.value = p ? this.checkNullValue(p.value) : null;
        break;
      }
      case 'location': {
        item.value = this.checkNullValue(this.device ? this.device.location : null);
        break;
      }
      case 'hardcoded': {
        // Do nothing, value already exists
        break;
      }
      default: {
        item.value = 'N/A';
        console.error(`Device base data not found: Source "${item.source}" is unhandled.`);
        break;
      }
    }

    return item;
  }

  /**
   * Checks if value is null and returns value or 'N/A'.
   * 'N/A' is the preferred depiction of null values since null will disable displaying a variable.
   */
  private checkNullValue(value: string): string {
    return value || 'N/A';
  }

  /**
   * Indicates if the current device is in a state allowing locating.
   */
  public canLocateDevice(): boolean {
    const hypotheticalDevice = this.device as ExtendedDevicesOutputDto;
    const isOffline = hypotheticalDevice.deviceStatusSimple === DeviceStatusSimple.Offline;
    const isUnlinked = !hypotheticalDevice.devicePointUUID;
    return !isOffline && !isUnlinked;
  }

  public onLocate(): void {
    const locatingTarget: LocateDeviceInput = {
      devicePointUuid: null,
      deviceUuid: this.device.uuid,
    };
    this.devicesService.locateDevice(locatingTarget).subscribe(
      (response) => {
        this.notificationService.notify(_('DEVICES.LOCALIZATION_STARTED'));
      },
      (err) => {
        this.notificationService.notify(_('DEVICES.LOCALIZATION_START_FAILED'));
      },
    );
  }

  public onIpEdit(): void {
    const dialogData: InputDialogData = {
      message: _('DEVICES.ENTER_NEW_IP_ALERT'),
      value: this.device['ipAddress'],
      regexString: BackendConstIpAddress._2505204090109093250520409010909,
    };
    const confirmDialog = this.dialog.open(
      InputDialogComponent,
      {
        data: dialogData,
      },
    );
    const hypetheticalController = this.device as ExtendedControllerOutputDto;
    confirmDialog.afterClosed().subscribe((newIpInput?: string) => {
      if (newIpInput !== null) {
        const newControllerIpConfig: SetIPAddressInput = {
          controllerPointUUID: hypetheticalController.controllerPoint_UUID,
          ipAddress: newIpInput,
        };
        this.controllerPointService.setIPAddress(newControllerIpConfig).subscribe(
          (ok) => {
            const message = _('DEVICES.IP_CHANGE_SUCCESSFUL');
            const params = { newIpInput };
            this.openFeedbackDialog(message, params);
            this.change.emit();
          },
          (err) => {
            this.openFeedbackDialog(_('DEVICES.IP_CHANGE_FAILED'), null, '50%');
          },
        );
      }
    });
  }

  private openFeedbackDialog(message: string, params: object = null, dialogWidth = '30%'): void {
    this.dialog.open(FeedbackDialogComponent, {
      data: {
        message,
        params,
      },
      width: dialogWidth,
    });
  }
}
