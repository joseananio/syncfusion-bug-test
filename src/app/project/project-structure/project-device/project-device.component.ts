import {
  Component, OnInit, Inject, ViewChild,
} from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ModalButtonData } from 'src/app/shared/components/modal-dialog/modal-dialog/modal-dialog.component';
import {
  DevicePointOutputDto,
  ControllerPointOutputDto,
} from 'src/app/core/services';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { NotificationService } from 'src/app/core/services/local-services';
import { DevicePointBasicInfoComponent } from './device-point-basic-info/device-point-basic-info.component';
import { DevicePointConfigTabComponent } from '../device-point-config/device-point-config-tab/device-point-config-tab.component';

export interface InputDialogData {
  selectedItem: string;
  mode: 'edit' | 'new';
  device: DevicePointOutputDto | ControllerPointOutputDto;
  authorities: Set<string>;
}

interface FormChangeState {
  valid: boolean;
  changed: boolean;
}

const SAVE_BUTTON_INDEX = 0;

@Component({
  selector: 'app-project-device',
  templateUrl: './project-device.component.html',
  styleUrls: ['./project-device.component.scss'],
})
export class ProjectDeviceComponent implements OnInit {
  public modalButtons: ModalButtonData[] = [
    {
      name: (this.data.mode === 'edit') ? _('GLOBAL.SAVE_BUTTON_TEXT') : _('GLOBAL.CREATE_BUTTON_TEXT'),
      type: 'primary',
      eventName: 'save',
      isDisabled: true,
    },
    {
      name: _('GLOBAL.CANCEL_BUTTON_TEXT'),
      type: 'cancel',
      eventName: 'close',
      isDisabled: false,
    },
  ];

  public title = '';

  @ViewChild(DevicePointBasicInfoComponent)
  tab1: DevicePointBasicInfoComponent;

  @ViewChild(DevicePointConfigTabComponent)
  tab2: DevicePointConfigTabComponent;

  private tabChangeStates: FormChangeState[] = [
    {
      valid: true,
      changed: false,
    },
    {
      valid: true,
      changed: false,
    },
  ];

  ngOnInit(): void {
    this.title = _('PROJECT.CREATE_DEVICE_TITLE');
    if (this.data.mode === 'edit') {
      this.title = this.data.device.name;
    }
  }

  constructor(
    private dialogRef: MatDialogRef<ProjectDeviceComponent>,
    private notificationService: NotificationService,
    @Inject(MAT_DIALOG_DATA) public data: InputDialogData,
  ) {
  }

  public onTabChange(tabIndex: number, change: FormChangeState): void {
    this.tabChangeStates[tabIndex] = change;
    this.modalButtons[SAVE_BUTTON_INDEX].isDisabled = (!this.tabChangeStates[0].changed && !this.tabChangeStates[1].changed)
      || !this.tabChangeStates[0].valid
      || !this.tabChangeStates[1].valid;
  }

  public onButtonClick(eventName: string) {
    if (eventName === 'close') {
      this.dialogRef.close();
    } else if (eventName === 'save') {
      const observables: Observable<any>[] = [];
      if (this.tabChangeStates[0].changed) {
        observables.push(this.tab1.save());
      }

      if (this.tabChangeStates[1].changed) {
        observables.push(this.tab2.save());
      }

      // insert internal error handling
      this.dialogRef.close(forkJoin(observables).pipe(
        catchError((error) => {
          let message;
          if (error.error.errorCode === 'DUPLICATED_CONTROLLER_POINT') {
            message = _('PROJECT.CONTROLLER_NAME_TAKEN');
          } else if (error.error.errorCode === 'DUPLICATED_DEVICE_POINT') {
            message = _('PROJECT.DEVICE_NAME_TAKEN');
          } else if (this.data.mode === 'edit') {
            message = this.isController() ? _('PROJECT.EDIT_CONTROLLER_FAILED') : _('PROJECT.EDIT_DEVICE_FAILED');
          } else {
            message = this.isController() ? _('PROJECT.CREATE_CONTROLLER_FAILED') : _('PROJECT.CREATE_DEVICE_FAILED');
          }

          this.notificationService.notify(message);

          return of([]);
        }),
      ));
    }
  }

  isController(): boolean {
    return !!((this.data && this.data.device && !this.data.device['deviceTypeName'])  // edit mode
      || (this.tab1 && this.tab1.selectedDeviceType === 'Controller'));  // creation mode
  }

  inEditMode(): boolean {
    return !!this.data && this.data.mode === 'edit';
  }
}
