import {
  AfterViewInit,
  Component, EventEmitter, Input, IterableDiffers, OnInit, Output,
} from '@angular/core';
import {
  AbstractControl,
  FormArray, FormBuilder, FormControl, FormGroup, ValidatorFn, Validators,
} from '@angular/forms';
import { TemperatureLevelCirculation } from 'src/app/core/services';
import { FunctionsInputModel } from '../../../abstractions/functions-input-model';

export interface DeviceDto {
  uuid: string;
  name?: string;
  targetTemperatureMapping: any;
}

function getValueFromEnum(idx: number): string {
  switch (idx) {
    default:
    case 1: return TemperatureLevelCirculation.DefaultNoUfc;
    case 2: return TemperatureLevelCirculation.UfcLower;
    case 3: return TemperatureLevelCirculation.UfcLowest;
    case 4: return TemperatureLevelCirculation.UfcManualConfig;
  }
}
@Component({
  selector: 'app-function-temperature-level',
  templateUrl: './function-temperature-level.component.html',
  styleUrls: ['./function-temperature-level.component.scss'],
})
export class FunctionTemperatureLevelComponent implements OnInit, AfterViewInit {
  // TODO [Refactoring] Hook this up somehow - see function-add.component:loadTemperatureLevelsForCirculation
  /* eslint-disable object-curly-newline */
    targetValues: { name: string; key: string; boundaries: string; id: number }[] = [
      { name: 'FUNCTIONS.TEMPERATURE_LEVEL_1', key: getValueFromEnum(1), boundaries: '(60°C/65°C)', id: 0 },
      { name: 'FUNCTIONS.TEMPERATURE_LEVEL_2', key: getValueFromEnum(2), boundaries: '(55°C/50°C)', id: 1 },
      { name: 'FUNCTIONS.TEMPERATURE_LEVEL_3', key: getValueFromEnum(3), boundaries: '(48°C/45°C)', id: 2 },
      { name: 'FUNCTIONS.TEMPERATURE_LEVEL_4', key: getValueFromEnum(4), boundaries: '(40°C/35°C)', id: 3 },
    ];
    /* eslint-enable object-curly-newline */

  dataSource: any;

  temperatureLevelsEnum = TemperatureLevelCirculation;

  @Output() temperatureValueChanged: EventEmitter<FormGroup> = new EventEmitter<FormGroup>();

  @Input() model: FunctionsInputModel;

  @Input() parentForm: FormGroup;

  @Input() upperBound= 70;

  @Input() lowerBound = 30;

  previousMapping;

  iterableDiffer: any;

  tempValues: FormArray = new FormArray([]);

  tempForm: FormGroup = new FormGroup({
    tempValues: this.tempValues,
  }, { updateOn: 'change' });

  constructor(private fb:FormBuilder,
    iterableDiffers: IterableDiffers) {
    this.iterableDiffer = iterableDiffers.find([]).create(null);
  }

  ngOnInit() {
    //
  }

  ngAfterViewInit() {
    setTimeout(() => {
      if (!this.parentForm) {
        return;
      }
      const fg: FormGroup = this.parentForm['form'];
      if (fg && !fg.contains('tempForm')) {
        fg.addControl('tempForm', this.tempForm);
      }
    });
  }

  ngDoCheck() {
    const changes = this.iterableDiffer.diff(Object.values(this.model.circulationValveConfigurationMapping));
    if (changes) {
      this.initializeForm();
      this.onChange();
    }
  }

  onChange(evt?) {
    this.temperatureValueChanged.emit(this.tempForm);
  }

  public initializeForm() {
    if (!this.tempValues) {
      return;
    }
    this.tempValues.clear();
    this.targetValues.forEach((val) => {
      this.tempValues.push(this.newTemp(val));
    });
  }

  /**
   * Will limit mouse wheel scrolling to stay within the bounds.
   */
  onMouseWheel(event: any) {
    if (event && event.target) {
      // make sure that a numeric value is passed (field can be empty)
      const offset = Math.min(Math.sign(event.wheelDelta), 1);
      const newValue = Number(!event.target.value ? 0 : event.target.value);

      // clamp, but apply offset - we need to return true for the form validation to trigger
      event.target.value = Math.max(this.lowerBound - offset, Math.min(newValue, this.upperBound - offset));
    }
    return true;
  }

  onCirculationInput(deviceUuid: string, key: string | TemperatureLevelCirculation, event: any) {
    this.model.setCirculationMappingValue(deviceUuid, key, event.target.value);
    this.temperatureValueChanged.emit(this.tempForm);
  }

  newTemp(tempLevel:{ name: string; key: string; boundaries: string; id: number }): FormGroup {
    const devices = this.model.getSelectedFlushableDevices().map((device) => {
      const validators = [this.tempValueValidator(tempLevel.key)];
      if (tempLevel.key === TemperatureLevelCirculation.DefaultNoUfc) {
        validators.push(Validators.required);
      }

      const d: FormControl = new FormControl(device, []);
      const tempValue = new FormControl(
        this.model.circulationValveConfigurationMapping[device.uuid].targetTemperatureMapping[tempLevel.key],
        validators,
      );
      if (tempValue.value) {
        tempValue.markAsDirty();
        tempValue.updateValueAndValidity();
      }
      return new FormGroup({ device: d, tempValue }, { updateOn: 'change' });
    });

    return this.fb.group({
      tempLevel,
      devices: new FormArray(devices),
    });
  }

  public dropListDropped(event: any): void {
    const fromIndex:number = event.previousIndex;
    const toIndex:number = event.currentIndex;
    this.model.moveFlushableDeviceInArray(fromIndex, toIndex);
  }

  public getTemperatureEnum(level: string): string {
    switch (level) {
      default:
      case 'FUNCTIONS.TEMPERATURE_LEVEL_1': return TemperatureLevelCirculation.DefaultNoUfc;
      case 'FUNCTIONS.TEMPERATURE_LEVEL_2': return TemperatureLevelCirculation.UfcLower;
      case 'FUNCTIONS.TEMPERATURE_LEVEL_3': return TemperatureLevelCirculation.UfcLowest;
      case 'FUNCTIONS.TEMPERATURE_LEVEL_4': return TemperatureLevelCirculation.UfcManualConfig;
    }
  }

  // TODO Osman: bind this directly to the model somehow
  textChange(event, targetLevel, deviceUuid: string) {
    this.model.circulationValveConfigurationMapping[deviceUuid] ||= {};
    this.model.circulationValveConfigurationMapping[deviceUuid].targetTemperatureMapping ||= {};

    const newValue = event.target.value === '' ? null : event.target.value;
    this.model.circulationValveConfigurationMapping[deviceUuid]
      .targetTemperatureMapping[this.getTemperatureEnum(targetLevel)] = newValue;
    this.temperatureValueChanged.emit(event.target.value);
  }

  private tempValueValidator(temperatureLevel: string): ValidatorFn {
    return (control: AbstractControl): {[key: string]: any} | null => {
      /*
      * It's either pristine, or already invalid because of something else
      */
      if ((control.pristine && !control.touched) || !control.valid) {
        return null;
      }

      if (!control.value && temperatureLevel !== TemperatureLevelCirculation.DefaultNoUfc) {
        control.markAsUntouched();
        control.markAsPristine();
      } else if (!!control.value && (Number(control.value) < this.lowerBound || Number(control.value) > this.upperBound)) {
        control.markAsTouched();
        control.markAsDirty();
        return { outOfBounds: { value: control.value } };
      }

      return null;
    };
  }
}
