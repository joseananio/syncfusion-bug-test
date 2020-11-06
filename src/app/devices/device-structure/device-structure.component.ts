import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { ModalButtonData } from 'src/app/shared/components/modal-dialog/modal-dialog/modal-dialog.component';
import {
  DevicePointService,
  DevicesService,
  DevicePointOutputDto,
  DevicesOutputDto,
  DeviceTypeName,
  DeviceTypeNameMapping,
  LocateDeviceInput,
} from 'src/app/core/services';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { LOCATABLE_DEVICE_TYPES, WALL_OUTLET_DEVICE_TYPES } from 'src/app/shared/utils/device-utils';
import { NotificationService } from 'src/app/core/services/local-services';
import { DeviceInstallationConfirmationComponent } from '../device-installation-confirmation/device-installation-confirmation.component';

interface DevicePointDeviceList extends DevicePointOutputDto {
  device?: DevicesOutputDto[];
}

type DialogState = 'initial' | 'loadingStructure' | 'loaded' | 'noData' | 'reloadingConfig' | 'configReloaded';

@Component({
  selector: 'app-device-structure',
  templateUrl: './device-structure.component.html',
  styleUrls: ['./device-structure.component.scss'],
})
export class DeviceStructureComponent implements OnInit {
  public treeData: DevicePointDeviceList[] = [];

  public modalButtons: ModalButtonData[];

  selectedDevicePointId: string;

  public dialogState: DialogState = 'initial';

  private safetyConfirmationChecked = false;

  constructor(
    public dialogRef: MatDialogRef<DeviceStructureComponent>,
    private dialog: MatDialog,
    public devicePointService: DevicePointService,
    private devicesService: DevicesService,
    private notificationService: NotificationService,
    @Inject(MAT_DIALOG_DATA) public device: any,
  ) {
    this.modalButtons = [
      {
        name: _('GLOBAL.SAVE_BUTTON_TEXT'),
        type: 'primary',
        eventName: 'save',
        isDisabled: true,
      },
      {
        name: _('DEVICES.LOCATE_DEVICE'),
        type: 'secondary',
        eventName: 'locate',
        isDisabled: !LOCATABLE_DEVICE_TYPES.has(this.device.device.deviceTypeName),
      },
      {
        name: _('GLOBAL.CANCEL_BUTTON_TEXT'),
        type: 'cancel',
        eventName: 'close',
      },
    ];
  }

  ngOnInit() {
    // TODO: (anane) this process requires a dedicated endpoint that returns devicepoints with attached devices,
    // instead of making multiple calls
    this.loadDevicePoints();
  }

  private loadDevicePoints(): void {
    this.dialogState = 'loadingStructure';
    this.devicePointService.getDevicePoints().subscribe(
      (devicePoints) => {
        const _devicePoints = devicePoints.filter(
          (devicePoint) => {
            if (devicePoint.disabledTimestamp) {
              return false;
            }
            return devicePoint.deviceTypeName === this.device.device.deviceTypeName && !devicePoint.device_UUID;
          },
        );
        this.treeData = _devicePoints as DevicePointDeviceList[];
        this.dialogState = this.treeData.length ? 'loaded' : 'noData';
      },
      (error) => {
        this.notificationService.notify(_('GLOBAL.COULD_NOT_INITIALIZE'));
        console.error(error);
      },
    );
  }

  public isWallOutlet(): boolean {
    return WALL_OUTLET_DEVICE_TYPES.has(this.device.device.deviceTypeName);
  }

  public onButtonEvent(eventName: string): void {
    switch (eventName) {
      case 'close': {
        this.dialogRef.close(false);
        break;
      }
      case 'save': {
        this.linkDeviceToDevicePoint({
          deviceId: this.device.device.uuid,
          devicePointId: this.selectedDevicePointId,
        });
        break;
      }
      case 'locate': {
        this.onLocate();
        break;
      }
      default: {
        console.error(
          'ERROR: Function add component: onButtonEvent triggered with unhandled event name',
        );
      }
    }
  }

  public onNodeSelect(event): void {
    this.selectedDevicePointId = event.nodeData.id;
    this.modalButtons[0].isDisabled = !this.formValid();
  }

  public onCheckboxChange(value): void {
    this.safetyConfirmationChecked = value.newState;
    this.modalButtons[0].isDisabled = !this.formValid();
  }

  private onLocate(): void {
    const locatingTarget: LocateDeviceInput = {
      deviceUuid: this.device.device.uuid,
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

  private formValid(): boolean {
    return !!this.selectedDevicePointId
        && (this.safetyConfirmationChecked || !this.isWallOutlet());
  }

  public getDeviceTypeNameI18nKey(deviceTypeName: DeviceTypeName): string {
    return DeviceTypeNameMapping[deviceTypeName] || deviceTypeName;
  }

  private linkDeviceToDevicePoint(input: {
    deviceId: string;
    devicePointId: string;
  }): void {
    this.dialogState = 'reloadingConfig';
    this.modalButtons.forEach((button) => {
      button.isDisabled = true;
    });
    this.devicePointService
      .installDeviceToDevicePoint({
        devicePointUUID: input.devicePointId,
        deviceUUID: input.deviceId,
        reloadConfig: true,
      })
      .subscribe(
        (data) => {
          this.dialogState = 'configReloaded';
          this.shouldControllerBeReset();
        },
        (err) => {
          console.error(err);
          this.notificationService.notify(_('DEVICES.COULD_NOT_ASSIGN_TO_DEVICE_POINT'));
          this.dialogRef.close();
        },
      );
  }

  private shouldControllerBeReset(): void {
    this.dialog.open(DeviceInstallationConfirmationComponent, {
      data: {
        deviceTypeName: this.device.device.deviceTypeName,
        controllerPointName: this.device.controllerPoint.name,
        deviceName: this.device.device.name,
        devicePointUuid: this.selectedDevicePointId,
      },
      width: '50%',
    });
    this.dialogRef.close(true);
  }
}
