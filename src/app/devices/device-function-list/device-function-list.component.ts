import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import {
  FunctionDto,
  ManagementService,
} from 'src/app/core/services';
import { ModalButtonData } from 'src/app/shared/components/modal-dialog/modal-dialog/modal-dialog.component';

@Component({
  selector: 'app-device-functions',
  templateUrl: './device-function-list.component.html',
  styleUrls: ['./device-function-list.component.scss'],
})
export class DeviceFunctionListComponent implements OnInit {
  constructor(
    private dialogRef: MatDialogRef<DeviceFunctionListComponent>,
    private managementService: ManagementService,
    @Inject(MAT_DIALOG_DATA) public devicePointUUID: string,
  ) {}

  public stateLoading = false;

  buttons: ModalButtonData[] = [
    {
      name: _('GLOBAL.CANCEL_BUTTON_TEXT'),
      type: 'cancel',
      eventName: 'close',
      id: 'device-details-cancel',
    },
  ];

  deviceFunctions: FunctionDto[] = [];

  ngOnInit() {
    this.stateLoading = true;
    this.managementService
      .getFunctionsForDevicePoint(this.devicePointUUID)
      .subscribe((deviceFunctions) => {
        this.stateLoading = false;
        this.deviceFunctions = deviceFunctions;
      });
  }

  public onModalCancel(): void {
    this.dialogRef.close(false);
  }
}
