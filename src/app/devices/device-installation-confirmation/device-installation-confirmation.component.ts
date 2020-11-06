import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { DeviceTypeName } from 'src/app/core/services';
import { PointAddressService } from 'src/app/core/services/local-services';
import { ModalButtonData } from 'src/app/shared/components/modal-dialog/modal-dialog/modal-dialog.component';

interface InstallationConfirmationInput {
  deviceTypeName: DeviceTypeName;
  controllerPointName: string;
  devicePointUuid: string;
  deviceName: string;
}

@Component({
  selector: 'app-device-installation-confirmation',
  templateUrl: './device-installation-confirmation.component.html',
  styleUrls: ['./device-installation-confirmation.component.scss'],
})
export class DeviceInstallationConfirmationComponent implements OnInit {
  public buttons: ModalButtonData[] = [
    {
      name: _('GLOBAL.CLOSE_BUTTON_TEXT'), type: 'primary', eventName: 'close', id: 'btn-question-dialog-confirm',
    },
  ];

  public devicePointPath = '-';

  constructor(
    public dialogRef: MatDialogRef<DeviceInstallationConfirmationComponent>,
    @Inject(MAT_DIALOG_DATA) public data: InstallationConfirmationInput,
    private pointAddressService: PointAddressService,
  ) {
  }

  ngOnInit() {
    this.pointAddressService.getPointAddressPath(this.data.devicePointUuid).subscribe(
      (path) => {
        this.devicePointPath = path;
      },
      () => {
        // do nothing
      },
    );
  }

  public onButtonEvent(eventName: string): void {
    this.dialogRef.close();
  }
}
