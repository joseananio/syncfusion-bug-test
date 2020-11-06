import { FormGroup } from '@angular/forms';
import {
  Component, OnInit, Input, EventEmitter, ViewChild, Output, AfterViewInit,
} from '@angular/core';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import {
  DevicePointOutputDto,
  TemperatureLevelObject,
  WeekDays,
} from 'src/app/core/services';
import { DropdownFields } from 'src/app/shared/lib/viega-common/lib/dropdown/dropdown.component';
import {
  SpulCalendarModel,
  WeekPlanDay,
  WeekPlanEntry,
} from 'src/app/shared/lib/viega-common/lib/week-time-planner';
import { TemperatureLevelCirculation } from '../../../core/services/model/temperatureLevelCirculation';

import {
  SpulOption,
} from '../../../shared/lib/viega-common/lib/week-time-planner/week-time-planner-control/week-time-planner-control.component';
import { WeekTimePlannerComponent } from '../../../shared/lib/viega-common/lib/week-time-planner/week-time-planner.component';
import { AbstractFormFunctionStepComponent } from '../abstract-form-function-step/abstract-form-function-step.component';

@Component({
  selector: 'app-form-function-step-three',
  templateUrl: 'form-function-step-three.component.html',
  styleUrls: ['form-function-step-three.component.scss'],
})
export class FormFunctionStepThree extends AbstractFormFunctionStepComponent implements OnInit, AfterViewInit {
  @Input() public parentChanged: EventEmitter<string>;

  @Input() public temperatureLevels: TemperatureLevelObject[] = [];

  /**
   * Used to pass changed data back to the parent
   */
  @Output() formChanged = new EventEmitter();

  @ViewChild('weekTimePlanner') public weekTimePlanner: WeekTimePlannerComponent;

  ufcActivated = false;

  initiallySelectedDTEDeviceId: string = undefined;

  private devicePointList: DevicePointOutputDto[];

  /**
   * Validation patterns.
   */
  public patterns = {
    time: /^[0-9]{1,2}:[0-5]{0,1}[0-9]{0,1}$/,
    date: /^([0-2][0-9]|(3)[0-1])(.)((([0]{0,1})[0-9])|((1)[0-2]))(.)\d{4} [0-9]{1,2}:[0-5]{0,1}[0-9]{0,1}$/,
  };

  /**
   * Device list based on this.model.circulationValveConfigurationMapping.
   */
  public circulationDeviceList: DevicePointOutputDto[] = [];

  /**
   * Selected active circulation device.
   */
  public activeCirculationDeviceUuid: string;

  /**
   * Week-planner data.
   */
  public spulCalendarModel: SpulCalendarModel = {
    entries: [],
    isActive: true,
    spulStop: {
      option: SpulOption.VOLUME,
      value: null,
      unit: null,
    },
  };

  /**
   * Which circulation pwh number is selected.
   */
  public temperatureLevel = TemperatureLevelCirculation.DefaultNoUfc;

  public pwhCTemperatureCelsiusUfcManual: number;

  public pwhTemperatureCelsiusUfcManual: number;

  public pwhCTemperatureCelsiusUfcLowest: number;

  public pwhTemperatureCelsiusUfcLowest: number;

  public pwhCTemperatureCelsiusUfcLower: number;

  public pwhTemperatureCelsiusUfcLower: number;

  /**
   * Device list based on this.model.flushableDevicePointUuids.
   */
  // public thermalFlushDevices: DevicePointOutputDto[];

  public keySwitchFields: DropdownFields = {
    text: 'name',
    value: 'uuid',
    groupBy: null,
  };

  hourText = _('FUNCTIONS.DETAILS_HOUR_PLACEHOLDER');

  activateTemperatureText = _('FUNCTIONS.ACTIVATE_TEMPERATURE');

  ufcAvailableText = _('FUNCTIONS.LABEL_USE_CONNECTED_UFC');

  weekDay = WeekPlanDay;

  temperatureLevelSet = false;

  hasFired = false;

  ngOnInit() {
    setTimeout(() => {
      this.devicePointsService.getDevicePoints().subscribe(
        (devicePoints) => {
          this.devicePointList = devicePoints;
        },
        () => {
          this.notificationService.notify(_('GLOBAL_ERROR_HANDLER.HTTP_400'));
        },
      );

      // this.setTemperatureLevelStates();

      // run through validations if data is set initially, ensures that continue button is activated

      this.loadCalenderEntries();

      this.parentChanged.subscribe((x) => this.handleChangesFromParent(x));

      // TODO (Simon): Load Levels correctly:
      if (this.model && this.model.circulationInput && this.model.circulationInput.temperatureLevelObject.temperatureLevel) {
        this.temperatureLevel = this.model.circulationInput.temperatureLevelObject.temperatureLevel;
      }
    });
  }

  ngAfterViewInit() {
    // this.setTemperatureLevelStates();
    this.onFormChange();
    /*
    * removing the timeout or the arrows will break the lifecycle
    * However, it is only necessary to call this for an update and after
    * model initialisation. This will remove the annoying flicker.
    * TODO [refactoring]: Get rid of this on occasion
    */
  }

  /**
   * Validates optional html templates.
   */
  canSetTemperatureLevel(idx = 1): boolean {
    // can always set first level
    if (idx === 1) {
      return true;
    }

    if (!this.model) {
      return false;
    }

    const numMappings = Object.keys(this.model.circulationValveConfigurationMapping).length;
    const isTemperatureLevelSet = this.model.isTemperatureLevelSetInCircE(idx);

    if (this.model.useUFC) {
      return numMappings === 0 || (numMappings > 0 && isTemperatureLevelSet && this.model.isUfcAvailable);
    }
    return isTemperatureLevelSet;
  }

  /*
  * Circulation function: If no UFC is used, all temperature levels can be selected.
  * If temperature level with PWH/PWH-C < 60°C/55°C is selected, warning needs to be displayed.
  * For individual temperature: Only show warning if temperature is too low.
  */
  public shouldShowTemperatureWarning() {
    if (!this.model || (this.model.useUFC && this.model.isUfcAvailable)) {
      return false;
    }

    const currentMapping = this.model.circulationInput.temperatureLevelObject;

    if (0 === Object.keys(currentMapping).length) {
      return false;
    }

    if (currentMapping.temperatureLevel === TemperatureLevelCirculation.UfcManualConfig) {
      return !currentMapping.pwhTemperatureCelsius || currentMapping.pwhTemperatureCelsius < 60
      || !currentMapping.pwhcTemperatureCelsius || currentMapping.pwhcTemperatureCelsius < 55;
    }

    return this.model.circulationInput.temperatureLevelObject.temperatureLevel !== TemperatureLevelCirculation.DefaultNoUfc;
  }

  public getTemperatureLevelString(key: string) {
    switch (key) {
      default:
      case '1': return TemperatureLevelCirculation.DefaultNoUfc;
      case '2': return TemperatureLevelCirculation.UfcLower;
      case '3': return TemperatureLevelCirculation.UfcLowest;
      case '4': return TemperatureLevelCirculation.UfcManualConfig;
    }
  }

  public isTemperatureLevelEqual(idx: string) {
    if (!this.model.circulationInput || !this.model.circulationInput.temperatureLevelObject) {
      return this.model.isUfcAvailable && this.model.useUFC;
    }
    switch (idx) {
      default:
      case '1': return this.model.circulationInput.temperatureLevelObject.temperatureLevel === TemperatureLevelCirculation.DefaultNoUfc;
      case '2': return this.model.circulationInput.temperatureLevelObject.temperatureLevel === TemperatureLevelCirculation.UfcLower;
      case '3': return this.model.circulationInput.temperatureLevelObject.temperatureLevel === TemperatureLevelCirculation.UfcLowest;
      case '4': return this.model.circulationInput.temperatureLevelObject.temperatureLevel === TemperatureLevelCirculation.UfcManualConfig;
    }
  }

  private handleChangesFromParent(message: string): void {
    // TODO(Reger): FIX: This is executed twice on changes in the GUI. Double triggers with differenct selectedDTEDevice each time!
    switch (message) {
      case 'flushableDevices':
        if (this.viewIncludes('circulationDevice')) {
          this.loadCirculationDevicesForActiveSelection();
        }
        break;

      case 'temperatureLevels':
        if (this.viewIncludes('circulation')) {
          // TODO: This reads the temperature levels from the DTE
        }
        break;
      case 'calendarFunctionCopied':
        this.loadCalenderEntries();
        break;
      default:
        break;
    }
  }

  /**
   * Determines whether the selected DTE has been changed at least one time in this lifecycle.
   * Important flag if function is edited: UFC Checkbox shall not auto-toggle in edit mode.
   */
  hasUserChangedDTE(): boolean {
    if (!this.initiallySelectedDTEDeviceId) {
      return !!this.model.dteUuid;
    }

    if (!this.model.dteUuid) {
      return !!this.initiallySelectedDTEDeviceId;
    }

    // Using deep comparison via JSON string
    return this.initiallySelectedDTEDeviceId === JSON.stringify(this.model.selectedDTEDevice);
  }

  private loadCalenderEntries(): void {
    if (!this.model.isHygieneFlushFunction() || !this.form) {
      return;
    }

    const calendarEntries = [];
    const { weekDays } = this.model.flushSchedule.weeklyFlushPlan;
    Object.keys(weekDays).forEach((day) => {
      const times: string[] = weekDays[day];
      const entry: WeekPlanEntry = { day, startTime: times[0] };
      if (times.length > 0) {
        entry.endTime = times[1];
      }
      calendarEntries.push(entry);
    });
    this.spulCalendarModel.entries = calendarEntries;

    if (!this.getForm().contains('weekTimePlanner')) {
      this.getForm().addControl('weekTimePlanner', new FormGroup({}));
    }

    if (this.weekTimePlanner) {
      this.weekTimePlanner.generateCalendar();
    }
  }

  private loadCirculationDevicesForActiveSelection(): void {
    if (!this.model.circulationValveConfigurationMapping) {
      return;
    }
    this.circulationDeviceList = this.model.devices.circulationDevices.filter(
      (device) => !!this.model.circulationValveConfigurationMapping[device.uuid],
    );
  }

  public onFormFieldChange(field: string, event: any): void {
    // TODO: pwhx and pwhcx fields are not handled
    switch (field) {
      case 'activated':
        // TODO: (anane) check date format with backend
        this.model.disabledTimestamp = event.newState ? null : new Date().toISOString();
        break;

      case 'keySwitchUuid':
        this.model.keySwitchUuid = event.value;
        break;

      case 'temperature_Active':
        this.model.flushSchedule.dependOnTemperatureFlushPlan.activated = event.newState;
        break;

      default:
        break;
    }
    this.onFormChange();
  }

  /**
   * Handles form changes. Further validation occurs in the parent after we emit the form.
   */
  public onFormChange(): void {
    this.formChanged.emit(this.form);
  }

  public onCalendarChange(calendarData: SpulCalendarModel): void {
    if (calendarData.entries.find((entry) => !!(entry.endTime || entry.startTime))) {
      const weekDays: WeekDays = calendarData.entries.reduce(
        (accumulator, entry) => {
          accumulator[entry.day] = [...(entry.startTime ? [entry.startTime] : []), ...(entry.endTime ? [entry.endTime] : [])];
          return accumulator;
        },
        {} as WeekDays, // all the required day keys are added during the reduce
      );
      this.model.flushSchedule.weeklyFlushPlan.weekDays = weekDays;
      this.onFormChange();
    }
  }

  public handleSpulInputChange() { /* TODO not sure who */ }

  public onDropThermalFlushDevice(event: CdkDragDrop<string[]>): void {
    this.model.moveFlushableDeviceInArray(event.previousIndex, event.currentIndex);
    this.onFormChange();
  }

  public viewIncludes(key: string) {
    return this.model.helper.shouldViewInclude(this.model, key);
  }

  public hasDTE(): boolean {
    return !!this.model.dteUuid;
  }
}
