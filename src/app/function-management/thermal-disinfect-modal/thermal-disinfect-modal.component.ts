import {
  Component, OnInit, OnDestroy, Inject,
} from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import {
  FunctionDto,
  DevicePointOutputDto,
  FlushService,
  DevicePointService,
  ThermalDisinfectionTaskStatusEnum,
  ProjectsService,
} from 'src/app/core/services';
import { ButtonType } from 'src/app/shared/lib/viega-common/lib/button';
import { NotificationService } from 'src/app/core/services/local-services';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';

type ThermalDisinfectionStages = ThermalDisinfectionTaskStatusEnum | 'IdleWaiting' | 'Uninitialized' | 'Unknown';
const ThermalDisinfectionStages = {
  ...ThermalDisinfectionTaskStatusEnum,
  IdleWaiting: 'IdleWaiting' as ThermalDisinfectionStages,  // waiting for the thermal disinfection to start
  Uninitialized: 'Uninitialized' as ThermalDisinfectionStages,  // before the actual state is known
  Unknown: 'Unknown' as ThermalDisinfectionStages,  // unknown states
};

@Component({
  selector: 'app-thermal-disinfect-modal',
  templateUrl: './thermal-disinfect-modal.component.html',
  styleUrls: ['./thermal-disinfect-modal.component.scss'],
})
export class ThermalDisinfectModalComponent implements OnInit, OnDestroy {
  /**
   * Polling interval how frequently the state of the flushing process shall be requested from the backend in ms.
   */
  private static POLLING_INTERVAL = 3000;

  private static modalButtons = {
    okay: {
      name: _('GLOBAL.OK_BUTTON_TEXT'),
      type: 'secondary' as ButtonType,
      eventName: 'ok',
      id: 'button-ok',
    },
    cancel: {
      name: _('GLOBAL.CANCEL_BUTTON_TEXT'),
      type: 'cancel' as ButtonType,
      eventName: 'cancel',
      id: 'button-cancel',
    },
    yes: {
      name: _('GLOBAL.YES_BUTTON_TEXT'),
      type: 'primary' as ButtonType,
      eventName: 'startConfirmed',
      id: 'button-yes',
    },
    yesDisabled: {
      name: _('GLOBAL.YES_BUTTON_TEXT'),
      type: 'primary' as ButtonType,
      eventName: 'startConfirmed',
      id: 'button-yes',
      isDisabled: true,
    },
    no: {
      name: _('GLOBAL.NO_BUTTON_TEXT'),
      type: 'secondary' as ButtonType,
      eventName: 'startDeclined',
      id: 'button-no',
    },
    noDisabled: {
      name: _('GLOBAL.NO_BUTTON_TEXT'),
      type: 'secondary' as ButtonType,
      eventName: 'startDeclined',
      id: 'button-no',
      isDisabled: true,
    },
  };

  private pollingTimer: number;

  /**
   * Definition of the stages this dialog walks through while performing a thermal disinfection.
   */
  public dialogStages = {
    [ThermalDisinfectionStages.Uninitialized]: {
      message: _('FUNCTIONS.CHECK_IF_THERMAL_DISINFECTION_IS_RUNNING'),
      buttons: [
        ThermalDisinfectModalComponent.modalButtons.cancel,
      ],
      spinnerShown: true,
      enableWarningIcon: false,
      deviceListShown: false,
    },
    [ThermalDisinfectionStages.Idle]: {
      message: _('FUNCTIONS.CONFIRMATION_QUESTION'),
      buttons: [
        ThermalDisinfectModalComponent.modalButtons.yes,
        ThermalDisinfectModalComponent.modalButtons.no,
      ],
      spinnerShown: false,
      enableWarningIcon: true,
      deviceListShown: true,
    },
    [ThermalDisinfectionStages.IdleWaiting]: {
      message: _('FUNCTIONS.CONFIRMATION_QUESTION'),
      buttons: [
        ThermalDisinfectModalComponent.modalButtons.yesDisabled,
        ThermalDisinfectModalComponent.modalButtons.noDisabled,
      ],
      spinnerShown: true,
      enableWarningIcon: false,
      deviceListShown: true,
    },
    [ThermalDisinfectionStages.CheckingBlockedStatus]: {
      message: _('FUNCTIONS.CHECK_AVAILABILITY_OF_DEVICES'),
      buttons: [ThermalDisinfectModalComponent.modalButtons.cancel],
      spinnerShown: true,
      enableWarningIcon: false,
      deviceListShown: false,
    },
    [ThermalDisinfectionStages.CheckingForActivatedKeySwitch]: {
      message: _('FUNCTIONS.CHECKING_KEY_SWITCH'),
      buttons: [ThermalDisinfectModalComponent.modalButtons.cancel],
      spinnerShown: true,
      enableWarningIcon: false,
      deviceListShown: false,
    },
    [ThermalDisinfectionStages.SettingCirculationValves]: {
      message: _('FUNCTIONS.GROUP_IS_BLOCKED_FOR_THERMAL_RINSING'),
      buttons: [ThermalDisinfectModalComponent.modalButtons.cancel],
      spinnerShown: true,
      enableWarningIcon: false,
      deviceListShown: false,
    },
    [ThermalDisinfectionStages.WaitingForDteTemperatureClaimByUser]: {
      message: _('FUNCTIONS.TEMPERATURE_OF_HEATER_INDETERMINATE'),
      buttons: [ThermalDisinfectModalComponent.modalButtons.okay, ThermalDisinfectModalComponent.modalButtons.cancel],
      spinnerShown: true,
      enableWarningIcon: false,
      deviceListShown: false,
    },
    [ThermalDisinfectionStages.SettingDteTemperatureFirstTry]: {
      message: _('FUNCTIONS.WATER_IS_HEATED'),
      buttons: [ThermalDisinfectModalComponent.modalButtons.cancel],
      spinnerShown: true,
      enableWarningIcon: false,
      deviceListShown: false,
    },
    [ThermalDisinfectionStages.SettingDteTemperatureSecondTry]: {
      message: _('FUNCTIONS.WATER_IS_HEATED_SECOND_ATTEMPT'),
      buttons: [ThermalDisinfectModalComponent.modalButtons.cancel],
      spinnerShown: true,
      enableWarningIcon: false,
      deviceListShown: false,
    },
    [ThermalDisinfectionStages.WaitingForKeySwitchToTurnOn]: {
      message: _('FUNCTIONS.PRESS_KEYSWITCH_TO_START_THERMAL_FLUSH'),
      buttons: [ThermalDisinfectModalComponent.modalButtons.cancel],
      spinnerShown: true,
      enableWarningIcon: false,
      deviceListShown: false,
    },
    [ThermalDisinfectionStages.WaitingForKeySwitchToTurnOffTurnOn]: {
      message: _('FUNCTIONS.KEYSWITCH_IS_ALREADY_ACTIVATED'),
      buttons: [ThermalDisinfectModalComponent.modalButtons.cancel],
      spinnerShown: true,
      enableWarningIcon: false,
      deviceListShown: false,
    },
    [ThermalDisinfectionStages.FlushingDevices]: {
      message: _('FUNCTIONS.THERMAL_RINSING_IN_PROGRESS'),
      buttons: [ThermalDisinfectModalComponent.modalButtons.cancel],
      spinnerShown: true,
      enableWarningIcon: false,
      deviceListShown: false,
    },
    [ThermalDisinfectionStages.Successful]: {
      message: _('FUNCTIONS.THERMAL_RINSING_COMPLETED'),
      buttons: [ThermalDisinfectModalComponent.modalButtons.okay],
      spinnerShown: false,
      enableWarningIcon: false,
      deviceListShown: false,
    },
    [ThermalDisinfectionStages.Failed]: {
      message: _('FUNCTIONS.THERMAL_RINSING_COULD_NOT_COMPLETE'),
      buttons: [ThermalDisinfectModalComponent.modalButtons.okay],
      spinnerShown: false,
      enableWarningIcon: true,
      deviceListShown: false,
    },
    [ThermalDisinfectionStages.Unknown]: {
      message: _('FUNCTIONS.THERMAL_RINSING_IN_UNKNOWN_STATE'),
      buttons: [ThermalDisinfectModalComponent.modalButtons.cancel],
      spinnerShown: false,
      enableWarningIcon: true,
      deviceListShown: false,
    },
  };

  /**
   * State of the server-side state machine controlling the flushing process.
   */
  public currentStage: ThermalDisinfectionStages = ThermalDisinfectionStages.Uninitialized;

  public deviceList: DevicePointOutputDto[] = [];

  /**
   * Task-ID of the running thermal disinfection.
   */
  private runningTask: string;

  constructor(
    private dialogRef: MatDialogRef<ThermalDisinfectModalComponent>,
    @Inject(MAT_DIALOG_DATA) private selectedFunction: FunctionDto,
    private flushService: FlushService,
    private devicePointService: DevicePointService,
    private projectServices: ProjectsService,
    private notificationService: NotificationService,
  ) {}

  ngOnInit() {
    // Check if we need to pick up a running thermal disinfection task.
    this.checkForRunningTask();

    // start state polling
    this.checkFunctionStage();

    // populate device list
    this.devicePointService.getDevicePoints().subscribe(
      (devicePoints) => {
        this.deviceList = devicePoints.filter(
          (devicePoint) => this.selectedFunction.flushableDevicePointUuids.find(
            (devicePointUuid) => devicePointUuid === devicePoint.uuid,
          ) !== undefined,
        );
      },
      (error) => {
        this.handleInitializationerror(error);
      },
    );
  }

  ngOnDestroy() {
    if (this.pollingTimer) {
      clearTimeout(this.pollingTimer);
      this.pollingTimer = undefined;
    }
  }

  /**
   * Checks if there already is a running task for this function.
   * If a task is found, the runningTask and currentStage variables are set.
   */
  private checkForRunningTask(): void {
    this.flushService.getThermalDisinfectionTasks().subscribe(
      (tasks) => {
        const taskIdsOfThisFunction = Object.keys(tasks)
          .filter((key) => tasks[key]['function'].name === this.selectedFunction.name);
        if (taskIdsOfThisFunction.length) {
          const latestTaskId = taskIdsOfThisFunction.reduce((accumulator, current) => {
            const newestTaskSoFar = new Date(tasks[accumulator].taskCreationTime);
            const timestamp = new Date(tasks[current].taskCreationTime);
            return timestamp > newestTaskSoFar ? current : accumulator;
          });
          this.flushService.getThermalDisinfectionStatus(latestTaskId).subscribe(
            (status) => {
              if (status.taskStatus !== ThermalDisinfectionStages.Successful
                  && status.taskStatus !== ThermalDisinfectionStages.Failed) {  // task not yet finished
                this.runningTask = latestTaskId;
                this.setCurrentStage(status.taskStatus);
              } else {  // last existing task already finished
                this.currentStage = ThermalDisinfectionStages.Idle;
              }
            },
            (error) => {
              this.handleInitializationerror(error);
            },
          );
        } else {  // no existing tasks
          this.currentStage = ThermalDisinfectionStages.Idle;
        }
      },
      (error) => {
        this.handleInitializationerror(error);
      },
    );
  }

  private handleInitializationerror(error): void {
    this.notificationService.notify(_('FUNCTIONS.COULD_NOT_INITIALIZE_DIALOG'));
    console.error(error);
    this.dialogRef.close();
  }

  private setCurrentStage(stage: string): void {
    this.currentStage = this.dialogStages[stage]
      ? stage as ThermalDisinfectionStages
      : ThermalDisinfectionStages.Unknown;
  }

  private checkFunctionStage(): void {
    if (this.runningTask) {
      this.flushService.getThermalDisinfectionStatus(this.runningTask).subscribe(
        (thermalDisinfectionStatus) => {
          this.setCurrentStage(thermalDisinfectionStatus.taskStatus);
        },
        (error) => {
          console.error(error);
          this.notificationService.notify(_('FUNCTIONS.COULD_NOT_GET_STATE_OF_THERMAL_DISINFECTION'));
        },
      );
    }

    // do polling
    this.pollingTimer = window.setTimeout(
      () => {
        this.checkFunctionStage();
      },
      ThermalDisinfectModalComponent.POLLING_INTERVAL,
    );
  }

  private closeDialog(): void {
    this.runningTask = null;  // stop state polling
    this.dialogRef.close();
  }

  public onButtonEvent(eventName: string): void {
    switch (eventName) {
      case 'cancel': {
        this.flushService.abortThermalDisinfection(this.runningTask).subscribe(
          (response) => {
            // do nothing
          },
          (error) => {
            this.notificationService.notify(_('FUNCTIONS.COULD_NOT_ABORT_THERMAL_DISINFECTION'));
            console.error(error);
          },
        );
        this.closeDialog();
        break;
      }
      case 'ok': {
        if (this.currentStage === ThermalDisinfectionStages.WaitingForDteTemperatureClaimByUser) {
          this.flushService.setThermalDisinfectionDteTargetTemperatureUserClaim(this.runningTask).subscribe(
            () => {
              // do nothing
            },
            (error) => {
              this.notificationService.notify(_('FUNCTIONS.COULD_NOT_CLAIM_DTE_TEMPERATURE'));
              console.error(error);
            },
          );
        } else {
          this.closeDialog();
        }
        break;
      }
      case 'startConfirmed': {
        // disable buttons
        this.currentStage = ThermalDisinfectionStages.IdleWaiting;
        this.flushService.startThermalDisinfection(
          this.deviceList.map((devicePoint) => devicePoint.nodeId),
          this.selectedFunction.name,
        ).subscribe(
          (reply) => {
            this.runningTask = reply.taskId;
          },
          (error) => {
            this.notificationService.notify(_('FUNCTIONS.COULD_NOT_START_THERMAL_DISINFECTION'));
            console.error(error);
            this.closeDialog();
          },
        );
        break;
      }
      case 'startDeclined': {
        this.closeDialog();
        break;
      }
      default: {
        console.error(`Unknown button event ${eventName}`);
        break;
      }
    }
  }
}
