import {
  Component, OnInit, Output, EventEmitter, Input, ViewChild, ViewChildren, AfterViewInit,
} from '@angular/core';
import {
  TemperatureLevelCirculation,
  DevicePointOutputDto,
} from 'src/app/core/services';
import { TreeViewComponent } from '@syncfusion/ej2-angular-navigations';
import { ICheckboxValueChangeEvent } from 'src/app/shared/lib/viega-common/lib/checkbox';
import { DropdownFields } from 'src/app/shared/lib/viega-common/lib/dropdown/dropdown.component';
import { RadioComponent } from 'src/app/shared/lib/viega-common/lib/radio/radio.component';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { FormGroup } from '@angular/forms';
import {
  DevicePointOutputDtoWithStatus, LocalFunctionType,
} from '../../functions-types';
import { AbstractFormFunctionStepComponent } from '../abstract-form-function-step/abstract-form-function-step.component';
import { FunctionTemperatureLevelComponent, DeviceDto } from './function-temperature-level/function-temperature-level.component';

@Component({
  selector: 'app-form-function-step-two',
  templateUrl: './form-function-step-two.component.html',
  styleUrls: ['./form-function-step-two.component.scss'],
})
export class FormFunctionStepTwo extends AbstractFormFunctionStepComponent implements OnInit, AfterViewInit {
  /**
   * View Children
   */
  @ViewChild('devicesTree') devicesTree: TreeViewComponent;

  @ViewChildren('functionRadio') functionRadioButtons: RadioComponent[];

  /**
   * the local function type object
   */
  @Input() public selectedFunctionType: LocalFunctionType;

  @Input() public parentChanged: EventEmitter<string>;

  /**
   * Used to pass changed data back to the parent, mostly form validation.
   */
  @Output() formChanged = new EventEmitter();

  /**
   * Which function is selected to populate selected devices.
   */
  public selectedFunction = '';

  public deviceSelectFields: DropdownFields = {
    text: 'name',
    value: 'devicePointUUID',
    groupBy: null,
  };

  // syncfusion tree options
  public showCheckBox = true;

  public allowMultiSelection = true;

  /**
   * Holds the tree definition Object for syncfusion treegrid.
   */
  public flushableDevices: DevicePointOutputDtoWithStatus[] = [];

  private selectedDevices: DevicePointOutputDto[] = [];

  public deviceIdWithNameAndMapping: DeviceDto[] = [];

  private parentChangedSubscription;

  parallelFlushLabel = _('FUNCTIONS.LABEL_CHECKBOX_PARALLEL_FLUSH');

  // true if the user clicks on a zirk-e device,
  selectingTemperatureLevel = false;

  // activeDeviceTemperatureMapping: CirculationValveConfigurationTargetTemperatureMapping;

  selectedTempLevelForActiveDevice: TemperatureLevelCirculation;

  temperatureLevelsEnum = TemperatureLevelCirculation;

  activelyMappedDeviceId: string;

  @ViewChild('tempLevel') tempLevel: FunctionTemperatureLevelComponent;

  ngOnInit() {
    setTimeout(() => {
      if (this.model) {
        // read selected devices from model
        this.selectedDevices = this.model.getSelectedFlushableDevices();
        if (!this.model.isCirculationFunction()) {
          return;
        }
        this.selectedDevices.forEach((device) => {
          const targetTemperatureMapping = this.model.circulationValveConfigurationMapping[device.uuid].targetTemperatureMapping;
          this.deviceIdWithNameAndMapping.push({
            targetTemperatureMapping,
            name: device.name,
            uuid: device.uuid,
          });
        });
      }
    });
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.selectingTemperatureLevel = this.model.isCirculationFunction() && this.model.flushableDevicePointUuids.length > 0;
      this.parentChangedSubscription = this.parentChanged.subscribe((x) => this.handleChangesFromParent(x));
      this.getForm().markAllAsTouched();
      this.onFormChange();
    });
  }

  ngOnDestroy() {
    if (this.parentChangedSubscription) {
      this.parentChangedSubscription.unsubscribe();
    }
  }

  private handleChangesFromParent(message: string): void {
    // if (message === 'devices') {
    //   this.buildDevicesTree();
    //   this.onFormChange();
    // } else if (message === 'flushableDevices') {
    //   this.buildDevicesTree();
    // }
  }

  /**
   * Check if the functiontype contains a specific view.
   *
   * @param key
   */
  public viewIncludes(key: string) {
    return this.selectedFunctionType && this.selectedFunctionType.details.find((entry) => entry === key);
  }

  /**
   * Handles form changes. Further validation occurs in the parent after we emit the form.
   */
  public onFormChange(evt?): void {
    this.formChanged.emit(this.form);
  }

  public onChildFormChange(childForm:FormGroup) {
    this.formChanged.emit(childForm);
  }

  /**
   * Aggregated event handler for the different form fields.
   *
   * @param field
   * @param value
   */
  public onFormFieldChange(field: string, value: any): void {
    switch (field) {
      case 'temperatureSensor':
        this.model.temperatureSensorPwcDevicePointUuid = value;
        break;

      case 'dteDevice':
        this.model.dteUuid = value;
        break;

      case 'keySwitchDevice':
        this.model.keySwitchUuid = value;
        break;

      case 'circulationValveUuid':
        this.model.setCirculationMappingValue(value, null, null);
        if (this.model.circulationValveConfigurationMapping[value]) {
          delete this.model.circulationValveConfigurationMapping[value];
        } else {
          // TODO: This should not be an empty object. This was just added as a placeholder when
          //   upgrading to backed 0.1.11.26.
          this.model.circulationValveConfigurationMapping[value] = {};
        }
        break;

      default:
        break;
    }
    this.onFormChange();
  }

  /**
   * When a function checkbox is touched.
   *
   * @param event
   */
  public onExistingFunctionSelect(event: string): void {
    this.selectedFunction = event;
    this.copySelectedFunction(true);
  }

  // TODO [Refactoring] Murder this
  public onParallelFlushCheck(event: ICheckboxValueChangeEvent): void {
    this.model.flushSchedule.flushParallel = event.newState;
  }

  /**
   * When a tree node is checked, {showCheckBox} should be true. This will only be called from view!
   */
  public onDeviceNodeCheck(event): void {
    // Uncheck all function radio items when manually selecting devices.
    this.functionRadioButtons.forEach((radio) => {
      radio.isChecked = false;
    });
    this.model.setDeviceSelection(event.devicePointUuid, event.checked);
    this.selectingTemperatureLevel = this.model.isCirculationFunction() && this.model.flushableDevicePointUuids.length > 0;
    if (!this.selectingTemperatureLevel && this.tempLevel) {
      this.tempLevel.initializeForm();
      this.onFormChange();
    } else {
      setTimeout(() => this.onFormChange());
    }
  }

  private copySelectedFunction(checked: boolean): void {
    const selectedFunction = this.model.getCompatibleFunctions().find((func) => func.name === this.selectedFunction);
    if (selectedFunction) {
      const noCopyFields = ['name', 'type', 'flushableDevicePointUuids', 'circulationValveConfigurationMapping'];

      Object.keys(selectedFunction)
        .filter((key) => !noCopyFields.includes(key))
        .forEach((key) => {
          this.model[key] = selectedFunction[key];
        });

      this.model.flushableDevicePointUuids = [];
      const devicesToProcess = this.model.isCirculationFunction()
        ? Object.keys(selectedFunction.circulationValveConfigurationMapping)
        : selectedFunction.flushableDevicePointUuids;

      devicesToProcess.forEach((deviceUuid) => this.model.setDeviceSelection(deviceUuid, true));
      this.onFormChange();
    }
  }
}
