import {
  DevicesOutputDto, DevicesService, DeviceCreateSensorFromAncestorInput, CreatePortInput,
} from 'src/app/core/services';
import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NotificationService } from 'src/app/core/services/local-services';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { ModalButtonData } from 'src/app/shared/components/modal-dialog/modal-dialog/modal-dialog.component';
import { Observable } from 'rxjs';

export interface SensorDialogData {
  title: string;
  message: string;
  device: DevicesOutputDto;
  sensorPorts: CreatePortInput[];
}

@Component({
  selector: 'app-device-sensor-structure',
  templateUrl: './device-sensor-structure.component.html',
  styleUrls: ['./device-sensor-structure.component.scss',
  ],
})
export class DeviceSensorStructureComponent implements OnInit {
  buttons: ModalButtonData[] = [
    {
      name: _('GLOBAL.CANCEL_BUTTON_TEXT'), type: 'cancel', eventName: 'close', id: 'btn-question-dialog-close',
    },
    {
      name: _('GLOBAL.CREATE_BUTTON_TEXT'),
      type: 'primary',
      eventName: 'save',
      id: 'btn-question-dialog-confirm',
      isDisabled: true,
    },
  ];

  sensorTypeNames: string[];

  selectedType: string;

  newSensorName: string;

  remark: string;

  constructor(
    public dialogRef: MatDialogRef<DeviceSensorStructureComponent>,
    @Inject(MAT_DIALOG_DATA) public data: SensorDialogData,
    private devicesService: DevicesService,
    private notificationService: NotificationService,
  ) { }

  ngOnInit() {
    this.devicesService.getSensorsOnPort(this.data.device.deviceTypeName, this.data.sensorPorts[0]).subscribe(
      (sensorTypes) => {
        this.sensorTypeNames = sensorTypes;
        this.selectedType = this.sensorTypeNames[0];
      },
      (err) => {
        this.notificationService.notify(_('GLOBAL.COULD_NOT_INITIALIZE'));
        console.error(err);
        this.closeDialog();
      },
    );
  }

  private closeDialog(result?: Observable<DevicesOutputDto>): void {
    this.dialogRef.close(result);
  }

  private createSensor(): void {
    const newSensor: DeviceCreateSensorFromAncestorInput = {
      name: this.newSensorName,
      deviceTypeName: this.selectedType,
      remark: this.remark,
      ancestorDevice_Ports: this.data.sensorPorts,
      ancestorDevice_UUID: this.data.device.uuid,
      reloadConfig: true,
    };

    this.closeDialog(this.devicesService.createSensorFromAncestor(newSensor));
  }

  public onNameChange(event): void {
    this.buttons[1].isDisabled = !event.data;
  }

  public onButtonEvent(eventName: string): void {
    switch (eventName) {
      case 'close': {
        this.closeDialog();
        break;
      }
      case 'save': {
        this.createSensor();
        break;
      }
      default: {
        console.error('ERROR: Device sensor structure: onButtonEvent triggered with unhandled event name');
      }
    }
  }
}
