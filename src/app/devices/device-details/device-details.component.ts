import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ModalButtonData } from 'src/app/shared/components/modal-dialog/modal-dialog/modal-dialog.component';
import {
  DevicesOutputDto,
  ParameterService,
  ParameterDefinitionDto,
  DeviceTypeName,
  SessionProfile,
  SessionsService,
} from 'src/app/core/services';
import { AuthenticationService, NotificationService } from 'src/app/core/services/local-services';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { DeviceDialogData } from '../devices/devices.component';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-device-details',
  templateUrl: './device-details.component.html',
  styleUrls: ['./device-details.component.scss'],
})
export class DeviceDetailsComponent implements OnInit {
  constructor(
    private dialogRef: MatDialogRef<DeviceDetailsComponent>,
    @Inject(MAT_DIALOG_DATA) public dialogData: DeviceDialogData,
    private parameterService: ParameterService,
    private notificationService: NotificationService,
    private authService: AuthenticationService,
    private sessionService: SessionsService,
  ) { }

    maintenanceTabEnabled: boolean = environment.includeDeviceMainenance;

    buttons: ModalButtonData[] = [
      {
        name: _('GLOBAL.CLOSE_BUTTON_TEXT'), type: 'primary', eventName: 'close', id: 'device-details-cancel',
      },
    ];

    deviceParameters: ParameterDefinitionDto[] = [];

    private dataChanged = false;

    isMultipleSessionsOpened = false;

    ngOnInit() {
      this.parameterService.getParameterDefinitionList().subscribe(
        (response) => {
          this.deviceParameters = response;
        },
        (error) => {
          console.error(error);
          this.notificationService.notify(_('GLOBAL.COULD_NOT_INITIALIZE'));
        },
      );

      this.handleMultipleSessions();
    }

    private handleMultipleSessions() {
      if (this.isDte()) {
        const interval = setInterval(() => {
          this.sessionService.getSession(this.authService.getSessionId(), false)
            .subscribe((session: SessionProfile) => {
              if (session.isMoreThanOnePrivilegedSessionOpen) {
                this.isMultipleSessionsOpened = true;
              } else {
                this.isMultipleSessionsOpened = false;
                clearInterval(interval);
              }
            });
        }, 2000);
      }
    }

    public onChanged(): void {
      this.dataChanged = true;
    }

    public onModalCancel() {
      this.dialogRef.close(this.dataChanged);
    }

    public isRulantica(): boolean {
      return this.dialogData.device['deviceTypeName'] === DeviceTypeName.Rulantica;
    }

    public isHyplus(): boolean {
      return this.dialogData.device['deviceTypeName'] === DeviceTypeName.Hyplus;
    }

    public isController(): boolean {
      return this.dialogData.device['deviceTypeName'] === 'Controller';
    }

    public isLinked(): boolean {
      return !!(this.dialogData.device as DevicesOutputDto).devicePointUUID;
    }

    public isDte(): boolean {
      return this.dialogData.device['deviceTypeName'] === DeviceTypeName.DTE;
    }

    /**
     * Check amount of unassigned sensor ports.
     */
    public hasFreeSensorPorts(): boolean {
      return (this.dialogData.device as DevicesOutputDto).availablePortCount > 0;
    }

    /**
     * Checks if device type allows connecting a sensor.
     */
    public isSensorCompatible(): boolean {
      return (
        this.dialogData.device['deviceTypeName'] === DeviceTypeName.WallE
      || this.dialogData.device['deviceTypeName'] === DeviceTypeName.BeatE
      || this.dialogData.device['deviceTypeName'] === DeviceTypeName.WireSens
      || this.dialogData.device['deviceTypeName'] === DeviceTypeName.Hyplus
      // TODO (Reger): Also found 'wiresensP', what is that?
      );
    }
}
