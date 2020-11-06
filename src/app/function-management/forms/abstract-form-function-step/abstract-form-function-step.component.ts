import {
  ChangeDetectorRef, Component, Input, ViewChild,
} from '@angular/core';
import {
  FormGroup, NgForm,
} from '@angular/forms';
import {
  DevicePointService, FlushService, FunctionDto, ParameterService,
} from 'src/app/core/services';
import { NotificationService } from 'src/app/core/services/local-services';
import { LocalFunctionType } from '../../functions-types';
import { FunctionsInputModel } from '../../abstractions/functions-input-model';

import {
  FunctionTemperatureServiceService,
} from '../form-function-step-two/function-temperature-level/function-temperature-service.service';

export interface FunctionDtoEx extends FunctionDto {
  isChecked?: boolean;
}
@Component({
  selector: 'app-abstract-form-function-step',
  template: '',
  styles: [''],
})
export class AbstractFormFunctionStepComponent {
  /**
   * initial data model. Must be converted back to FunctionsInput before saving.
   */
  @Input() public model: FunctionsInputModel;

  /**
   * holds the local form
   */
  @ViewChild(NgForm) form: FormGroup = new FormGroup({});

  /**
   * List of functions to display in checkboxes
   */
  @Input() public functionList: FunctionDtoEx[] = [];

  /**
   * selected model.type-ish local function type object
   */
  @Input() public selectedFunctionType: LocalFunctionType;

  constructor(
    protected changeDetector: ChangeDetectorRef,
    protected devicePointsService: DevicePointService,
    protected notificationService: NotificationService,
    protected flushService: FlushService,
    protected parameterService: ParameterService,
    protected temperatureService: FunctionTemperatureServiceService,
  ) { }

  protected getForm(): FormGroup {
    if (this.form instanceof NgForm) {
      return (this.form as NgForm).form;
    }
    return this.form;
  }
}
