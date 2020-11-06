import {
  Component, Input, OnInit, ViewChild, EventEmitter, Output, Inject,
} from '@angular/core';
import {
  DevicesOutputDto,
  ParameterDefinitionDto,
  ParameterService,
  DeviceParameter,
  DeviceTypeName,
  DeviceTypeNameMapping,
  DeviceStatusSimple,
  AuthorityCodes,
  ManagementService,
  FunctionTypes,
  FunctionDto,
  DevicePointService,
  DeviceUpdateStatus,
  DeviceUpdateService,
  DeviceUpdateGeneralStatus,
} from 'src/app/core/services';
import { NgForm } from '@angular/forms';
import { QuestionDialogComponent } from 'src/app/shared/components/modal-dialog/question-dialog/question-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { FeedbackDialogComponent } from 'src/app/shared/components/modal-dialog/feedback-dialog/feedback-dialog.component';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import {
  AuthenticationService,
  NotificationService,
} from 'src/app/core/services/local-services';
import { equalsDeviceType } from 'src/app/shared/utils/device-utils';
import { environment } from 'src/environments/environment';
import { timer, Subscription } from 'rxjs';
import { concatMap, map } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { FirmwareDialogData } from '../firmware-update/firmware-update.component';
import {
  DeviceDetailsFirmwareUpdateComponent,
} from '../device-details-firmware-update/device-details-firmware-update.component';

interface DisplayParams extends ParameterDefinitionDto {
  value: string;
  valueBoolean: boolean;
}

@Component({
  selector: 'app-device-details-configuration',
  templateUrl: './device-details-configuration.component.html',
  styleUrls: ['./device-details-configuration.component.scss'],
})
export class DeviceDetailsConfigurationComponent implements OnInit {
  canFirmwareUpdateFlagEnabled: boolean = environment.includeCanFirmwareUpdate;

  @ViewChild(NgForm) formViewChild;

  // List of available params of this device
  private deviceParameters: ParameterDefinitionDto[];

  private oldDeviceConfig: DeviceParameter[] = [];

  // Actual form data for this template
  displayParameters: DisplayParams[] = [];

  private oldDisplayParameters: DisplayParams[] = [];

  // Device config of service endpoint
  private deviceConfig: DeviceParameter[] = [];

  private parametersChanged = false;

  private circulationFunctionChanged = false;

  private factoryResetableDeviceTypes = new Set([
    DeviceTypeName.WallE,
    DeviceTypeName.BeatE,
    DeviceTypeName.ZirkE,
    DeviceTypeName.DTE,
    DeviceTypeName.Rulantica,
  ]);

  private firmwareUpdatableDeviceTypes = new Set([
    DeviceTypeName.WallE,
    DeviceTypeName.BeatE,
    DeviceTypeName.ZirkE,
    DeviceTypeName.DTE,
    DeviceTypeName.Rulantica,
  ]);

  private flushableDeviceTypes = new Set([
    DeviceTypeName.WallE,
    DeviceTypeName.BeatE,
    DeviceTypeName.Rulantica,
    DeviceTypeName.Hyplus,
  ]);

  private deviceUpdateSubscription: Subscription;

  onDeviceFirmwareUpdated: EventEmitter<string> = new EventEmitter();

  deviceUpdateStatus: string;

  constructor(
    private parameterService: ParameterService,
    private managementService: ManagementService,
    private devicePointService: DevicePointService,
    protected dialog: MatDialog,
    @Inject('AuthService') private authenticationService: AuthenticationService,
    private notificationService: NotificationService,
    private deviceUpdateService: DeviceUpdateService,
    private translate: TranslateService,
  ) { }

  @Input()
  device: DevicesOutputDto;

  @Input()
  authorities: Set<string>;

  AuthorityCodes = AuthorityCodes;

  specialParameters: Object = {
    'Werkseinstellungen wieder herstellen': false,
  };

  public circulationFunctions: FunctionDto[] = [
    { name: '-', remark: undefined, type: undefined },
  ];

  public circulationFunction: string;

  public oldCirculationFunction: string;

  @Output()
  change: EventEmitter<any> = new EventEmitter();

  ngOnInit() {
    this.initializeForm();
    this.onDeviceFirmwareUpdated.subscribe((deviceId) => {
      this.pollForDeviceUpdateStatus(deviceId);
    });
  }

  public isFlushableDevice(): boolean {
    return this.flushableDeviceTypes.has(this.device.deviceTypeName);
  }

  private initializeForm(): void {
    // Get parameter definitions
    this.parameterService.getParameterDefinitionList().subscribe(
      (response) => {
        this.deviceParameters = response;
        // Filter only for this device type
        this.filterParameters();
        this.getParameterValues();
      },
      (error) => {
        this.showInitializationError(error);
      },
    );

    this.managementService.getAllFunctions().subscribe(
      (functions) => {
        this.circulationFunctions = this.circulationFunctions.concat(
          functions.filter((func) => func.type === FunctionTypes.Circulation),
        );
      },
      (error) => {
        this.showInitializationError(error);
      },
    );

    this.devicePointService.getDevicePointByUuid(this.device.devicePointUUID).subscribe(
      (devicePoint) => {
        this.circulationFunction = devicePoint.assignedCirculationFunction || this.circulationFunctions[0].name;
        this.oldCirculationFunction = this.circulationFunction;
      },
      (error) => {
        this.showInitializationError(error);
      },
    );
  }

  private showInitializationError(error) {
    this.notificationService.notify(_('GLOBAL.COULD_NOT_INITIALIZE'));
    console.error(error);
  }

  /**
   * Gets all possible device parameters and filters the ones needed for the
   * current device.
   */
  private filterParameters(): void {
    this.displayParameters = Object.assign(this.displayParameters, this.deviceParameters.filter(
      (parameter) => {
        let result = equalsDeviceType(parameter.deviceType, this.device.deviceTypeName)
          && parameter.accessAuthorization
          && parameter.accessAuthorization[this.authenticationService.getRole(true)]
          && parameter.twmsFeatures
          && parameter.twmsFeatures.parameterize;
        if (this.specialParameters.hasOwnProperty(parameter.name)) {
          // This parameter will be handled manually, so do not list it as usual.
          result = false;
          this.specialParameters[parameter.name] = true;
        }
        return result;
      },
    ));
  }

  private getParameterValues(): void {
    this.parameterService.getParameterValue(this.device.devicePointUUID).subscribe(
      (values) => {
        this.deviceConfig = values.filter(
          (configitem) => this.displayParameters.find(
            (parameter) => configitem.name === parameter.keyName,
          ),
        );
        // deep copy:
        this.oldDeviceConfig = JSON.parse(JSON.stringify(this.deviceConfig));
        this.displayParameters = this.mergeDeviceConfig(values, this.displayParameters);
        this.oldDisplayParameters = JSON.parse(JSON.stringify(this.displayParameters));
      },
      (error) => {
        this.showInitializationError(error);
      },
    );
  }

  public factoryResetParameters(): void {
    this.dialog.open(QuestionDialogComponent, {
      data: { message: _('DEVICES.RESET_PARAM_ALERT') },
      width: '50%',
    }).afterClosed().subscribe(
      (res) => {
        if (res) {
          this.factoryReset();
          this.initializeForm();
          this.change.emit();
        }
      },
    );
  }

  private factoryReset(): void {
    this.parameterService.factoryResetParameters(this.device.devicePointUUID).subscribe(
      (ok) => {
        this.dialog.open(FeedbackDialogComponent, {
          data: { message: _('DEVICES.SUCCESS_MESSAGE') },
          width: '50%',
        });
        this.change.emit();
      },
      (err) => {
        console.error(err);
        this.dialog.open(FeedbackDialogComponent, {
          data: { message: _('PROJECT.COULD_NOT_FACTORY_RESET') },
          width: '50%',
        });
      },
    );
  }

  /**
   * Indicates if the current device type supports factory rests at all.
   */
  public isFactoryResetableDevice(): boolean {
    return this.factoryResetableDeviceTypes.has(this.device.deviceTypeName);
  }

  // checks for firmware updatable devices
  public isFirmwareUpdatableDevice(): boolean {
    return this.firmwareUpdatableDeviceTypes.has(this.device.deviceTypeName);
  }

  /**
   * Indicates if the current (resetable) device is in a state allowing a factory reset.
   */
  public canFactoryResetDevice(): boolean {
    const isOffline = this.device.deviceStatusSimple === DeviceStatusSimple.Offline;
    const isUnlinked = !this.device.devicePointUUID;

    return !isOffline && !isUnlinked;
  }

  private mergeDeviceConfig(source: DeviceParameter [], target: DisplayParams[]): DisplayParams[] {
    return target.map(
      (parameter) => {
        const { value } = source.find(
          (candidate) => candidate.name === parameter.keyName,
        );
        return {
          ...parameter,
          value,
          valueBoolean: value === 'true',
        };
      },
    );
  }

  private extractDeviceConfig(source: DisplayParams[], target: DeviceParameter[]): DeviceParameter[] {
    return target.map(
      (parameter) => {
        const entry: DisplayParams = source.find(
          (candidate) => candidate.keyName === parameter.name,
        );
        let { value } = entry;
        if (entry.dataType === 'boolean') {
          value = (entry.valueBoolean ? 'true' : 'false');
        }
        return {
          value,
          name: parameter.name,
        };
      },
    );
  }

  public onParamChange(): void {
    this.deviceConfig = this.extractDeviceConfig(this.displayParameters, this.deviceConfig);
    this.oldDeviceConfig = this.extractDeviceConfig(this.oldDisplayParameters, this.oldDeviceConfig);
    this.parametersChanged = this.isDeviceConfigDifferent(this.deviceConfig, this.oldDeviceConfig);
  }

  public onCirculationFunctionChanged(event): void {
    if (event.isInteracted) {  // ignore initialization
      this.circulationFunctionChanged = this.circulationFunction !== this.oldCirculationFunction;
    }
  }

  private isDeviceConfigDifferent(object: DeviceParameter[], object2: DeviceParameter[]): boolean {
    return JSON.stringify(object).replace(/"/g, '') !== JSON.stringify(object2).replace(/"/g, '');
  }

  public onSave(): void {
    this.dialog.open(QuestionDialogComponent, {
      data: {
        message: _('DEVICES.SAVE_CHANGES_ALERT'),
      },
      width: '30%',
    }).afterClosed().subscribe(
      (res) => {
        if (res) {
          if (this.parametersChanged) {
            this.parameterService.setParameterValue(this.device.devicePointUUID, this.deviceConfig).subscribe(
              (ok) => {
                this.oldDeviceConfig = JSON.parse(JSON.stringify(this.deviceConfig));
                this.oldDisplayParameters = JSON.parse(JSON.stringify(this.displayParameters));
                this.parametersChanged = this.isDeviceConfigDifferent(this.deviceConfig, this.oldDeviceConfig);
              },
              (err) => {
                this.notificationService.notify(_('DEVICES.COULD_NOT_UPDATE_DEVICE_CONFIG'));
                console.error(err);
              },
            );
          }

          if (this.circulationFunctionChanged) {
            this.devicePointService.assignCirculationFunctionToFlushableDevice({
              // To unassign a function, null is sent.
              circulationFunctionName:
                (this.circulationFunction !== this.circulationFunctions[0].name) ? this.circulationFunction : null,
              flushableDevicePointUuid: this.device.devicePointUUID,
            }).subscribe(
              (ok) => {
                this.circulationFunctionChanged = false;
              },
              (err) => {
                this.notificationService.notify(_('DEVICES.COULD_NOT_UPDATE_DEVICE_CIRCULATION_FUNCTION'));
                console.error(err);
              },
            );
          }

          this.change.emit();
        }
      },
    );
  }

  public onConfigure(): void {
    window.open(this.device['ipAddress'], '_blank');
  }

  public isHyplus(): boolean {
    return this.device['deviceTypeName'] === DeviceTypeName.Hyplus;
  }

  public onClickDeviceFirmwareUpdate(): void {
    let { deviceTypeName } = this.device;
    const deviceTypeNameKey = DeviceTypeNameMapping[deviceTypeName];
    if (deviceTypeNameKey) {
      deviceTypeName = this.translate.instant(deviceTypeNameKey);
    }
    const firmWareUpdateDialogData: FirmwareDialogData = {
      message: _('DEVICES.SELECT_UPDATE_FILE_ALERT'),
      params: { deviceTypeName },
      deviceUuid: this.device.uuid,
      onDeviceUpdated: this.onDeviceFirmwareUpdated,
    };
    this.dialog.open(DeviceDetailsFirmwareUpdateComponent, {
      data: firmWareUpdateDialogData,
      width: '30%',
    });
    this.change.emit();
  }

  private pollForDeviceUpdateStatus(deviceId): void {
    this.deviceUpdateSubscription = timer(0, 5000).pipe(
      concatMap((x) => this.deviceUpdateService.getUpdateStatus(deviceId)),
      map((response: DeviceUpdateStatus) => response),
    ).subscribe(
      (res) => {
        if (res.deviceUpdateGeneralStatus === DeviceUpdateGeneralStatus.UpdateFailed
          || res.deviceUpdateGeneralStatus === DeviceUpdateGeneralStatus.UpdateSuccessful) {
          this.deviceUpdateStatus = res.deviceUpdateGeneralStatus;
          this.deviceUpdateSubscription.unsubscribe();
        }
      },
      (error) => {
        // ignore and keep polling
      },
    );
  }

  saveButtonEnabled(): boolean {
    return this.parametersChanged || this.circulationFunctionChanged;
  }
}
