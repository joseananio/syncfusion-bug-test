import { Directive, Input } from '@angular/core';
import { NG_VALIDATORS, Validator, ValidatorFn, FormControl } from '@angular/forms';

@Directive({
  selector: '[minMax]',
  providers: [{
    multi: true,
    provide: NG_VALIDATORS,
    useExisting: MinMaxValidator,
  }]
})
export class MinMaxValidator implements Validator {
    private readonly validator: ValidatorFn;

    @Input()
    public min: number;

    @Input()
    public max: number;

    public validate(control: FormControl) {
        const value: any = control.value;

        if ((typeof this.min === 'number') && (typeof this.max === 'number')) {
            if (typeof value !== 'number')
                return { minMax: { valid: false } };

            if (value < this.min)
                return { minMax: { valid: false } };
            if (value > this.max)
                return { minMax: { valid: false } };
        }

        return null;
    }
}
