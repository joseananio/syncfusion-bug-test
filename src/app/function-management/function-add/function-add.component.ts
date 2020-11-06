import {
  Component, EventEmitter, Inject, OnInit, OnDestroy,
} from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import {
  AuthorityCodes,
  DevicePointOutputDto,
  DevicePointService,
  FlushService,
  FunctionDto,
  FunctionsInput,
  FunctionTypes, ManagementService,
  ParameterService,
  TemperatureLevelObject,
} from 'src/app/core/services';
import { DataManagerService, DateTimeService, NotificationService } from 'src/app/core/services/local-services';
import { ModalButtonData } from 'src/app/shared/components/modal-dialog/modal-dialog/modal-dialog.component';
import { FormGroup } from '@angular/forms';
import { interval, Observable, Subscription } from 'rxjs';
import { FunctionsInputModel } from '../abstractions/functions-input-model';
import {
  noDeviceMale, LocalFunctionType,
} from '../functions-types';
import { flattenException } from '../../shared/utils/exception-utils';
import { FunctionHelperFactory } from '../abstractions/function-helper-factory';

const pollingInterval = 5000;
@Component({
  selector: 'app-function-add',
  templateUrl: './function-add.component.html',
  styleUrls: ['./function-add.component.scss'],
})
export class FunctionAddComponent implements OnInit, OnDestroy {
  /**
   * Event emitters.
   */
  onSaveSuccess = new EventEmitter();

  onSaveFail = new EventEmitter();

  onDataChange = new EventEmitter();

  /**
   * Data model to display in all sub forms.
   */
  public model: FunctionsInputModel;

  public formStepOne: FormGroup = new FormGroup({});

  public formStepTwo: FormGroup = new FormGroup({});

  public formStepThree: FormGroup = new FormGroup({});

  /**
   * List of function types to pass to radios.
   */
  public functionTypes: LocalFunctionType[] = Array.from(localFunctionTypes);

  public deviceList: DevicePointOutputDto[] = [];

  public flushableDeviceList: DevicePointOutputDto[] = [];

  // Mus not be declared here to prevent ill-binding with child component!
  public selectedDTEDevice: DevicePointOutputDto;

  public selectedTemperatureDevice: DevicePointOutputDto = noDeviceMale;

  public selectedKeySwitchDevice: DevicePointOutputDto = noDeviceMale;

  /**
   * List of function types to pass to devices.
   */
  public functionList: FunctionDto[] = [];

  public allFunctionsList: FunctionDto[] = [];

  /**
   * Indicates the index of the current step. Used to decide which form to show per step.
   */
  public activeStepIndex = 0;

  /**
   * Zero-based count of all steps.
   */
  public stepsCount = 2;

  /**
   * Information from the individual forms.
   */
  public forms = [];

  public authorities: Set<AuthorityCodes> = new Set();

  public temperatureLevels: TemperatureLevelObject[] = [];

  public modalTitle: string = _('FUNCTIONS.NEW_FUNCTION_MODAL_TITLE');

  functionStepHeader = _('FUNCTIONS.FUNCTION_STEP');

  devicesStepHeader = _('FUNCTIONS.DEVICES_STEP');

  detailsStepHeader = _('FUNCTIONS.DETAILS_STEP');

  /**
   * Buttons to handle stepper navigation.
   */
  public modalButtons: ModalButtonData[] = [
    {
      name: _('GLOBAL.BACK_BUTTON_TEXT'),
      type: 'back',
      eventName: 'back',
      id: 'back',
      isDisabled: true,
    },
    {
      name: _('GLOBAL.NEXT_BUTTON_TEXT'),
      type: 'primary',
      eventName: 'next',
      id: 'next',
      isDisabled: true,
    },
    {
      name: _('GLOBAL.CREATE_BUTTON_TEXT'),
      type: 'primary',
      eventName: 'save',
      id: 'save',
      isDisabled: true,
    },
  ];

  /**
   * The selected local function type, passed to other form sections.
   */
  public selectedFunctionType: LocalFunctionType;

  private isUpdate = false;

  public stateLoading = false;

  public stateLoadingFunc = false;

  currentFunctionType?: FunctionTypes;

  private pollingSubscription: Subscription;

  constructor(
    @Inject(MAT_DIALOG_DATA) public functionData: FunctionDto = {
      name: null,
      remark: 'remark',
      type: null,
    },
    public dialogRef: MatDialogRef<FunctionAddComponent>,
    private mgmtService: ManagementService,
    public dateSvc: DateTimeService,
    public devicePointService: DevicePointService,
    public notificationService: NotificationService,
    protected flushService: FlushService,
    protected parameterService: ParameterService,
    protected dataManagerService: DataManagerService,
  ) {
    this.dataManagerService.getUserAuthorityDataManager().ready.then(
      (authorities) => {
        const tmp: Set<AuthorityCodes> = new Set(authorities['result'].authorityCodes);
        tmp.forEach((element) => {
          this.authorities.add(element);
        });
      },
    ).catch(() => {
      this.notificationService.notify(_('GLOBAL.COULD_NOT_LOAD_PRIVILEGES'));
    });
  }

  ngOnInit() {
    // pass injector to helper factory
    FunctionHelperFactory.setDateService(this.dateSvc);

    this.setSelectedType();

    // Needs initialization once
    this.initializeModel();
    this.loadFunctions();
    this.loadFunctionDevices(true);

    this.devicePointService.getDevicePoints().subscribe(
      (pointList) => {
        this.model.devicePointList = pointList;
      },
      (err) => {
        this.notificationService.notify(_('FUNCTIONS.COULD_NOT_INITIALIZE_DIALOG'));
        console.error(err);
        this.dialogRef.close();
      },
    );
    this.subscribeUfcState();
  }

  ngOnDestroy() {
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
    }
  }

  /**
   * This function will keep polling for UFC availability - will be destroyed together with dialogue.
   */
  private subscribeUfcState() {
    this.pollingSubscription = interval(pollingInterval).subscribe(() => {
      this.updateUfcAvailability().subscribe((result) => {
        if (!this.model) {
          return;
        }
        if (this.model.authorities.size === 0) {
          this.model.authorities = this.authorities;
        }
        const useUfc = this.authorities.has(AuthorityCodes.SHOWCIRCULATIONUFCAVAILABLEFIELD);
        if (useUfc !== this.model.canSetUfc || this.model.isUfcAvailable !== result) {
          this.onDataChange.emit('ufcState');
        }
        this.model.isUfcAvailable = result;
      }, (err) => {
        this.notificationService.notify(_('DEVICES.COULD_NOT_RETRIEVE_UFC_STATUS'));
        console.error(err);
      });
    });
  }

  public updateUfcAvailability(): Observable<boolean> {
    return new Observable((observer) => {
      if (!this.model
          || !this.model.isCirculationFunction()
          || !this.model.dteUuid
          || !this.model.ufcFaultContactUuid
          || !this.parameterService
      ) {
        // Always return false if no DTE is set at all
        observer.next(this.model.isUfcAvailable);
      } else {
        // If a DTE is selected, gather the Parameter "dteIUC" and return it
        this.parameterService.getParameterValue(this.model.dteUuid).subscribe(
          (params) => {
            // BE devs say params get parsed automatically. Still double checking against undetected changes to that.
            switch (params.find((param) => param.name === 'dteIUC').value.toLowerCase()) {
              case 'false':
                observer.next(false);
                break;
              case 'true':
                observer.next(true);
                break;
              default:
                console.error('Parameter dteIUC did not resolve expected value!');
                throw new Error();
                break;
            }
          },
          (err) => {
            this.notificationService.notify(_('DEVICES.COULD_NOT_RETRIEVE_UFC_STATUS'));
            console.error(err);
          },
        );
      }
    });
  }

  private initializeModel(): void {
    this.isUpdate = !!(this.functionData && this.functionData.name);
    const model: FunctionsInputModel = new FunctionsInputModel(this.functionData);
    model.isUpdate = this.isUpdate;

    if (this.isUpdate) {
      this.modalTitle = _('FUNCTIONS.EDIT_FUNCTION_MODAL_TITLE');
      this.modalButtons[2].name = _('FUNCTIONS.SAVE_BUTTON');
      this.currentFunctionType = model.type;
    }

    this.model = model;
  }

  /**
   * Handle events from the modal buttons.
   */
  public onButtonEvent(eventName: string): void {
    switch (eventName) {
      case 'close': {
        this.dialogRef.close();
        break;
      }
      case 'next': {
        this.handleNextClick();
        break;
      }
      case 'back': {
        this.handlePrevClick();
        break;
      }
      case 'save': {
        this.handleSaveClick();
        break;
      }
      default: {
        console.error('ERROR: Function add component: onButtonEvent triggered with unhandled event name');
      }
    }
  }

  /**
   * When next button is clicked
   * changes form, chooses the new form and class run validation.
   */
  private handleNextClick(): void {
    this.activeStepIndex += 1;

    if (this.activeStepIndex < 2) {
      this.loadFunctionDevices();
    }

    if (this.activeStepIndex === 2 && this.model.isCirculationFunction()) {
      this.loadTemperatureLevelsForCirculation();
    }
    this.runValidationAction();
  }

  /**
   * When the back button is pressed
   * changes form, chooses the new form and calss run validation.
   */
  private handlePrevClick(): void {
    this.activeStepIndex -= 1;
    this.runValidationAction();
  }

  private notifyUserOnError(error: any, isSaveFail = false) {
    const err = flattenException(error);
    let errorMessage: string = _('FUNCTIONS.ERROR_MESSAGES.FUNCTION_CREATION_FAILED');
    if (this.isUpdate) {
      errorMessage = _('FUNCTIONS.ERROR_MESSAGES.FUNCTION_UPDATE_FAILED');
    }

    if (err.errorCode === 'CIRCLUATION_VALVE_CAN_ONLY_BE_ASSIGNED_ONCE') {
      errorMessage = _('FUNCTIONS.ERROR_MESSAGES.CIRCLUATION_VALVE_CAN_ONLY_BE_ASSIGNED_ONCE');
    }
    if (err.errorCode === 'UFC_FAULT_CONTACT_IS_NOT_OK') {
      errorMessage = _('FUNCTIONS.ERROR_MESSAGES.UFC_STATUS_INVALID');
    }
    this.notificationService.notify(errorMessage);
    console.error(err);

    if (isSaveFail) {
      this.onSaveFail.emit(err);
    }
  }

  /**
   * When the save button is clicked.
   */
  private handleSaveClick(): void {
    /**
     * Format the model in helpers to make sure the data is valid for saving.
     */
    const data: FunctionsInput = this.model.toFunctionsInput();

    if (this.isUpdate) {
      this.mgmtService.updateFunction(data, this.functionData.name).subscribe(
        () => {
          this.onSaveSuccess.emit(data);
          this.dialogRef.close();
        },
        (error) => this.notifyUserOnError(error, true),
      );
    } else {
      this.mgmtService.createFunction(data).subscribe(
        () => {
          this.onSaveSuccess.emit(data);
          this.dialogRef.close();
        },
        (error) => this.notifyUserOnError(error, true),
      );
    }
  }

  /**
   * Validates the form and set buttons statuses.
   */
  private runValidationAction(): void {
    const form = this.forms[this.activeStepIndex];
    // this.filterFunctionList();

    const formValid = form && form.valid
      && this.model.isValid({ activeStepIndex: this.activeStepIndex, controls: { ...form.controls } });

    let hasNextStep = this.activeStepIndex < this.stepsCount;

    // in case of circulation function without DTE: Do not show third dialogue page
    if (this.model.type === FunctionTypes.Circulation && !this.model.dteUuid) {
      hasNextStep = this.activeStepIndex < this.stepsCount - 1;
    }
    const hasPrevStep = this.activeStepIndex > 0;

    this.changeBtnStatus('next', formValid && hasNextStep);
    this.changeBtnStatus('save', formValid && !hasNextStep);
    this.changeBtnStatus('back', hasPrevStep);
  }

  /**
   * Toggles the disabled status of a button.
   *
   * @param button Button id.
   * @param enable Either enabled or not.
   */
  private changeBtnStatus(button: string, enable: boolean): void {
    this.modalButtons.forEach((btn) => {
      if (btn.id === button) {
        btn.isDisabled = !enable;
      }
    });
  }

  // handle form events

  public onChildFormChange(form, formIdx) {
    this.forms[formIdx] = form;
    switch (formIdx) {
      case 0:
        this.setSelectedType();
        break;
      case 1:
        // this.onDataChange.emit('flushableDevices');
        break;
      default:
        break;
    }

    this.runValidationAction();
  }

  private setSelectedType(): void {
    let selectedTypeId = '';
    if (this.model) {
      selectedTypeId = (this.model.type || '').replace(/__.+/, '');
      this.selectedFunctionType = localFunctionTypes.find((type) => this.model.type === type.id) || this.selectedFunctionType;
    }
    this.functionTypes = this.functionTypes.map((type) => {
      type.disabled = this.isUpdate && selectedTypeId !== '' && type.id.replace(/__.+/, '') !== selectedTypeId;
      return type;
    });
  }

  getPrivileges(): Set<AuthorityCodes> {
    if (this.authorities.size === 0) {
      this.dataManagerService.getUserAuthorityDataManager().ready.then(
        (authorities) => {
          const tmp: Set<AuthorityCodes> = new Set(authorities['result'].authorityCodes);
          tmp.forEach((element) => {
            this.authorities.add(element);
          });
          this.model.authorities = this.authorities;
        },
      ).catch(() => {
        this.notificationService.notify(_('GLOBAL.COULD_NOT_LOAD_PRIVILEGES'));
      });
    }
    return this.authorities;
  }

  private loadTemperatureLevelsForCirculation(): void {
    if (!this.model.dteUuid) {
      return;
    }
    this.mgmtService.getTemperatureLevelsForCirculation(this.model.dteUuid).subscribe(
      (response) => {
        this.temperatureLevels = response;
        this.onDataChange.emit('temperatureLevels');
      },
      (error) => {
        this.notificationService.notify(_('FUNCTIONS.COULD_NOT_GET_CIRCULATION_TEMPERATURES'));
        console.error(error);
      },
    );
  }

  private loadFunctionDevices(loadAll = false): void {
    this.stateLoading = true;

    if (loadAll || !this.model.type || this.model.type.length === 0) {
      this.devicePointService.getDevicePoints().subscribe(
        (response) => {
          this.model.allDevices = response;
          this.stateLoading = false;
        },
        (error: any) => {
          this.notificationService.notify(_('FUNCTIONS.COUL_NOT_GET_COMPATIBLE_DEVICE_POINTS'));
          console.error(flattenException(error));
        },
      );
      return;
    }
    /*
    * Editing a function, or after setting function type in form step 1
    */
    this.mgmtService.getAllCompatibleDevicePointsForTargetFunction(this.model.type.replace(/__.*$/, '') as FunctionTypes).subscribe(
      (response) => {
        this.model.allDevices = response;
        this.stateLoading = false;
      },
      (error: any) => {
        this.notificationService.notify(_('FUNCTIONS.COUL_NOT_GET_COMPATIBLE_DEVICE_POINTS'));
        console.error(flattenException(error));
      },
    );
  }

  /*
  private setDevices(response) {
    this.stateLoading = false;
    this.deviceList = response.filter((devicePoint) => devicePoint.disabledTimestamp === null);
    // && !devicePoint.isDeleted
    // && (devicePoint.nodeId || 0) > 0);
    // this.model.devices = response;
    // const devices : DeviceGroups = defaultDevices;

    // eslint-disable-next-line no-restricted-syntax
    // for (const key of Object.keys(deviceFilters)) {
    //   const dList = this.deviceList.filter((device) => deviceFilters[key].includes(device.deviceTypeName.toLocaleLowerCase()));
    //   devices[key] = noEmpty.includes(key) ? dList : [noDeviceNeutrum, ...dList];
    // }

    // this.model.devices = devices;

    // this.onDataChange.emit('devices');
  }
 */

  private loadFunctions(): void {
    this.stateLoadingFunc = true;
    this.mgmtService.getAllFunctions().subscribe(
      (response) => {
        this.stateLoadingFunc = false;
        this.model.allFunctionsList = response;
      },
      (error) => {
        this.notificationService.notify(_('FUNCTIONS.COUL_NOT_GET_FUNCTIONS'));
        console.error(error);
      },
    );
  }
}

const localFunctionTypes: LocalFunctionType[] = [
  {
    name: _('FUNCTIONS.FUNCTION_NAMES.HYGIENE_FLUSH_INTERVAL'),
    id: `${FunctionTypes.HygieneFlush}__interval`,
    details: ['interval', 'temperature'],
    message: _('FUNCTIONS.FUNCTION_DESCRIPTIONS.HYGIENE_FLUSH_INTERVAL'),
    disabled: false,
  },
  {
    name: _('FUNCTIONS.FUNCTION_NAMES.HYGIENE_FLUSH_CALENDAR'),
    id: `${FunctionTypes.HygieneFlush}__calendar`,
    details: ['calendar', 'temperature'],
    message: _('FUNCTIONS.FUNCTION_DESCRIPTIONS.HYGIENE_FLUSH_CALENDAR'),
    disabled: false,
  },
  {
    name: _('FUNCTIONS.FUNCTION_NAMES.HYGIENE_FLUSH_USAGE'),
    id: `${FunctionTypes.HygieneFlush}__nutzung`,
    details: ['nutzung'],
    message: _('FUNCTIONS.FUNCTION_DESCRIPTIONS.HYGIENE_FLUSH_USAGE'),
    disabled: false,
  },
  {
    name: _('FUNCTIONS.FUNCTION_NAMES.CIRCULATION'),
    id: FunctionTypes.Circulation,
    details: ['circulation', 'dte', 'noflushing'],
    message: _('FUNCTIONS.FUNCTION_DESCRIPTIONS.CIRCULATION'),
    disabled: false,
  },
  {
    name: _('FUNCTIONS.FUNCTION_NAMES.THERMAL_DISINFECTION'),
    id: FunctionTypes.ThermalDisinfection,
    details: ['thermal', 'circulationDevice', 'dte', 'keySwitch', 'temperature', 'noflushing'],
    message: _('FUNCTIONS.FUNCTION_DESCRIPTIONS.THERMAL_DISINFECTION'),
    disabled: false,
  },
];
