import { Directive, Input } from '@angular/core';
import {
  FormGroup, NG_VALIDATORS, ValidationErrors, Validator,
} from '@angular/forms';

@Directive({
  selector: '[appValidateEqual]',
  providers: [{ provide: NG_VALIDATORS, useExisting: ValidateEqualDirective, multi: true }],
})
export class ValidateEqualDirective implements Validator {
  constructor() { }

  @Input('appValidateEqual') mustMatch: string[] = [];

  validate(formGroup: FormGroup): ValidationErrors {
    return this.match(this.mustMatch[0], this.mustMatch[1])(formGroup);
  }

  match(controlName: string, matchingControlName: string) {
    return (formGroup: FormGroup) => {
      const control = formGroup.parent.controls[controlName];
      const matchingControl = formGroup.parent.controls[matchingControlName];

      // return null if controls haven't initialized yet
      if (!control || !matchingControl) {
        return null;
      }

      // set error on matchingControl if validation fails
      if (control.value !== matchingControl.value) {
        matchingControl.markAsTouched();
        matchingControl.setErrors({ customError: true });
        return { customError: true };
      }
      matchingControl.setErrors(null);

      return undefined;
    };
  }
}
