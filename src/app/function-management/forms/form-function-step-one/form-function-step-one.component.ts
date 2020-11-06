import {
  Component,
  Input,
  EventEmitter,
  Output,
  AfterViewInit,
  OnInit,
} from '@angular/core';
import {
  AbstractControl, FormControl, FormGroup, ValidatorFn, Validators,
} from '@angular/forms';
import { FunctionDtoEx, AbstractFormFunctionStepComponent } from '../abstract-form-function-step/abstract-form-function-step.component';

import { FunctionTypes } from '../../../core/services/model/functionTypes';
import { LocalFunctionType } from '../../functions-types';

@Component({
  selector: 'app-form-function-step-one',
  templateUrl: './form-function-step-one.component.html',
  styleUrls: ['./form-function-step-one.component.scss'],
})
export class FormFunctionStepOne extends AbstractFormFunctionStepComponent implements OnInit, AfterViewInit {
  /**
   * List of functions types to display in radio.
   */
  @Input() public functionTypes: LocalFunctionType[];

  /**
   * List of functions types to display in radio.
   */
  @Input() public formGroup: FormGroup[];

  public formTypes: FormGroup = new FormGroup({});

  /**
   * Selected model.type-ish local function type object.
   */
  @Input() public currentFunctionType: FunctionTypes;

  /**
   * Used to pass changed data back to the parent
   */
  @Output() formChanged = new EventEmitter();

  private nameField: AbstractControl;

  ngOnInit() {
    // needs to be held as instance variable this way - can't run these actions on ctrl, not even if it's typed.

    if (Object.keys(this.formTypes.controls).length === 0) {
      this.functionTypes.forEach((type) => {
        this.formTypes.registerControl(type.id, new FormControl());
      });
    }
  }

  ngAfterViewInit() {
    if (!this.nameField && !!this.getForm() && !this.getForm().contains('name')) {
      this.nameField = new FormControl(this.model.name, [
        Validators.required,
        Validators.minLength(4),
        this.uniqueNameValidator(this.model.allFunctionsList),
      ]);
      this.getForm().registerControl('name', this.nameField);
    }

    /*
    * removing the timeout or the arrows will break the lifecycle
    * However, it is only necessary to call this for an update and after
    * model initialisation. This will remove the annoying flicker.
    * TODO [refactoring]: Get rid of this on occasion
    */
    if (this.model && this.model.isUpdate) {
      setTimeout(() => {
        this.onFormChange();
      });
    }
  }

  /**
   * Handles form changes. Further validation occurs in the parent after we emit the form status.
   */
  public onFormChange(): void {
    this.formChanged.emit(this.form);
  }

  public onFormFieldChange(field: string, value: any): void {
    if (field === 'name') {
      this.onFormChange();
    }
  }

  private uniqueNameValidator(functionsList: FunctionDtoEx[]): ValidatorFn {
    return (control: AbstractControl): {[key: string]: any} | null => {
      if (control.pristine
        || !control.valid
        || this.model.isFunctionNameEqual(control.value)
        || !functionsList.find((func) => func.name === control.value)) {
        return null;
      }
      control.markAsTouched();
      control.markAsDirty();
      return { duplicate: { value: control.value } };
    };
  }
}
