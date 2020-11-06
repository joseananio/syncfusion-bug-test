import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { ModalButtonData } from 'src/app/shared/components/modal-dialog/modal-dialog/modal-dialog.component';
import { FeedbackDialogComponent } from 'src/app/shared/components/modal-dialog/feedback-dialog/feedback-dialog.component';
import { FunctionAddComponent } from 'src/app/function-management/function-add/function-add.component';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { forkJoin } from 'rxjs';
import { FunctionDto, ManagementService } from 'src/app/core/services';
import { NotificationService } from 'src/app/core/services/local-services';

export interface DeviceFunctionEditDialogData {
  device: {
    devicePointUUID: string;
  };
}

@Component({
  selector: 'app-device-function-edit',
  templateUrl: './device-function-edit.component.html',
  styleUrls: ['./device-function-edit.component.scss'],
})
export class DeviceFunctionEditComponent implements OnInit {
  modalButtons: ModalButtonData[] = [
    {
      name: _('GLOBAL.SAVE_BUTTON_TEXT'),
      type: 'primary',
      eventName: 'save',
      id: 'device-details-save',
    },
    {
      name: _('GLOBAL.CANCEL_BUTTON_TEXT'),
      type: 'cancel',
      eventName: 'close',
      id: 'device-details-cancel',
    },
  ];

  public stateLoading = false;

  selectedFunction: string;

  constructor(
    private dialogRef: MatDialogRef<DeviceFunctionEditComponent>,
    private managementService: ManagementService,
    private notificationService: NotificationService,
    private dialogue: MatDialog,
    @Inject(MAT_DIALOG_DATA) public dialogData: DeviceFunctionEditDialogData,
  ) {}

  functionNames: string[] = [];

  ngOnInit() {
    this.getCompatibleFunctionsForDevice();
  }

  public onButtonClick(eventName): void {
    if (eventName === 'save') {
      this.save();
    } else {
      this.dialogRef.close(false);
    }
  }

  private getCompatibleFunctionsForDevice(): void {
    let allFunctions: FunctionDto[] = [];
    this.stateLoading = true;
    forkJoin([this.managementService.getCompatibleFunctionsForDevice(this.dialogData.device.devicePointUUID),
      this.managementService.getFunctionsForDevicePoint(this.dialogData.device.devicePointUUID)])
      .subscribe(([allFuncs, assignedFunctions]) => {
        if (assignedFunctions.length) {
          allFunctions = allFuncs.filter((func) => !assignedFunctions.find((fn) => fn.name === func.name));
        }
        this.stateLoading = false;
        this.functionNames = allFunctions.map((func) => func.name);
      }, (error) => {
        console.error(error);
        this.notificationService.notify(_('DEVICES.COULD_NOT_GET_FUNCTIONS'));
        this.stateLoading = false;
        this.functionNames = [];
      });
  }

  public onAddNewFunction(): void {
    // We set the device as both flushable and circulation.
    // One will be deleted during function save
    const functionWithDevicePreSelected: Partial<FunctionDto> = {
      flushableDevicePointUuids: [
        this.dialogData.device.devicePointUUID,
      ],
      circulationValveConfigurationMapping: {
        [this.dialogData.device.devicePointUUID]: {},
      },
    };
    const dialogRef = this.dialogue.open(FunctionAddComponent, {
      width: '90%',
      height: '90%',
      data: functionWithDevicePreSelected,
    });

    dialogRef.componentInstance.onSaveSuccess.subscribe(
      () => {
        this.getCompatibleFunctionsForDevice();
      },
      (error) => console.log(error),
    );
  }

  public save(): void {
    if (this.selectedFunction === null || this.selectedFunction === undefined) {
      this.dialogue.open(FeedbackDialogComponent, {
        data: { message: _('DEVICES.CHOOSE_FUNCTION') },
      });
      return;
    }

    this.managementService
      .assignFlushableDevicePointToFunction({
        devicePointGroupFunctionName: this.selectedFunction,
        devicePointUuid: this.dialogData.device.devicePointUUID,
      })
      .subscribe(
        (res) => {
          this.dialogRef.close(true);
        },
        (error) => {
          this.notificationService.notify(_('DEVICES.COULD_NOT_ADD_TO_FUNCTION'));
          console.error(error);
          this.dialogRef.close(true);
        },
      );
  }

  public onFunctionSelected(selectedFunctions): void {
    this.selectedFunction = selectedFunctions;
  }
}
