import { Observable } from 'rxjs';
import {
  Component, OnInit, ViewChild, Input, Output, EventEmitter, Inject,
} from '@angular/core';
import { NgForm } from '@angular/forms';
import {
  ParameterDefinitionDto,
  DeviceParameter,
  ParameterService,
  DevicesOutputDto,
  AuthorityCodes,
  DeviceParameterFailed,
} from 'src/app/core/services';
import { MatDialog } from '@angular/material/dialog';
import { QuestionDialogComponent } from 'src/app/shared/components/modal-dialog/question-dialog/question-dialog.component';
import { FeedbackDialogComponent } from 'src/app/shared/components/modal-dialog/feedback-dialog/feedback-dialog.component';
import { AuthenticationService, NotificationService } from 'src/app/core/services/local-services';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';

interface DisplayParams extends ParameterDefinitionDto {
  value: string;
  valueBoolean: boolean;
}

@Component({
  selector: 'app-device-point-config-tab',
  templateUrl: './device-point-config-tab.component.html',
  styleUrls: ['./device-point-config-tab.component.scss'],
})
export class DevicePointConfigTabComponent implements OnInit {
  @ViewChild(NgForm) formViewChild;

  deviceParameters: ParameterDefinitionDto[];

  oldDeviceConfig: DeviceParameter[] = [];

  displayParameters: DisplayParams[] = [];

  deviceConfig: DeviceParameter[] = [];

  constructor(
    private parameterService: ParameterService,
    private dialog: MatDialog,
    @Inject('AuthService') private authenticationService: AuthenticationService,
    private notificationService: NotificationService,
  ) { }

  @Input()
  devicePoint: DevicesOutputDto;

  @Input()
  authorities: Set<string>;

  /**
   * Notification about form changes.
   */
  @Output()
  public formChange = new EventEmitter<{ valid: boolean; changed: boolean; }>();

  AuthorityCodes = AuthorityCodes;

  specialParameters: Object = {
    'Werkseinstellungen wieder herstellen': false,
  };

  ngOnInit() {
    this.initializeForm();
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
        this.notificationService.notify(_('PROJECT.COULD_NOT_GET_DEVICE_VALUES'));
        console.error(error);
      },
    );
  }

  /**
   * Gets all possible device parameters and filters the ones needed for the
   * current device.
   */
  private filterParameters(): void {
    this.displayParameters = Object.assign(this.displayParameters, this.deviceParameters.filter(
      (parameter) => {
        let result = (parameter.deviceType === this.devicePoint.deviceTypeName)
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
    this.parameterService.getParameterValue(this.devicePoint.uuid).subscribe(
      (values) => {
        this.deviceConfig = values.filter(
          (configitem) => this.displayParameters.find(
            (parameter) => configitem.name === parameter.keyName,
          ),
        );
        this.oldDeviceConfig = JSON.parse(JSON.stringify(this.deviceConfig));
        this.displayParameters = this.mergeDeviceConfig(values, this.displayParameters);
      },
      (err) => {
        this.notificationService.notify(_('PROJECT.COULD_NOT_GET_DEVICE_VALUES'));
        console.error(err);
      },
    );
  }

  factoryResetParameters() {
    this.dialog.open(QuestionDialogComponent, {
      data: { message: _('PROJECT.RESET_PARAMS_ALERT') },
      width: '50%',
    }).afterClosed().subscribe(
      (res) => {
        if (res) {
          this.factoryReset();
          this.initializeForm();
        }
      },
    );
  }

  private factoryReset() {
    this.parameterService.factoryResetParameters(this.devicePoint.uuid).subscribe(
      (ok) => {
        this.dialog.open(FeedbackDialogComponent, {
          data: { message: _('PROJECT.RESET_PARAMS_SUCCESSFUL') },
          width: '50%',
        });
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

  private mergeDeviceConfig(source: DeviceParameter[], target: DisplayParams[]): DisplayParams[] {
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

  onParamChange(): void {
    this.deviceConfig = this.extractDeviceConfig(this.displayParameters, this.deviceConfig);
    this.formChange.emit({
      valid: true,  // currently there are no invalid form states
      changed: this.isDeviceConfigDifferent(this.deviceConfig, this.oldDeviceConfig),
    });
  }

  /**
   * Compares deviceParameter objects.
   *
   * Precondition: name entry has to be unique.
   */
  private isDeviceConfigDifferent(object: DeviceParameter[], object2: DeviceParameter[]): boolean {
    if (object.length !== object2.length) {
      return true;
    }
    return !!object.filter(
      (item) => {
        const founditem2: DeviceParameter = object2.find(
          (item2) => item.name === item2.name,
        );
        return item.value !== founditem2.value;
      },
    ).length;
  }

  public save(): Observable<DeviceParameterFailed[]> {
    return this.parameterService.setParameterValue(this.devicePoint.uuid, this.deviceConfig);
  }
}
