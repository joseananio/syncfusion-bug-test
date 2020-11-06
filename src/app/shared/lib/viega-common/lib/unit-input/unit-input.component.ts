import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { ISliderValueChangeEvent } from '../slider';
import { ValueAccessor } from '../shared/ValueAccessor';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

export interface IUnitInputValueChangeEvent {
    newValue: number;
}

// TODO: add floating point number support
@Component({
    selector: 'viega-unit-input',
    templateUrl: './unit-input.component.html',
    styleUrls: ['./unit-input.component.scss'],
    providers: [{
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => UnitInputComponent),
        multi: true
    }]
})
export class UnitInputComponent extends ValueAccessor<number> {
    private static readonly KeyCodeUpArrow = 38;
    private static readonly KeyCodeDownArrow = 40;

    private lastValue: number = 0;

    public get isDisabled(): boolean {
        return this.disabled;
    }
    @Input()
    public set isDisabled(isDisabled: boolean) {
        this.disabled = isDisabled;
    }

    @Input('value')
    public set inputValue(value: number) {
        this.value = value;
        this.lastValue = value;
    }

    @Input()
    public inputId: string;

    private _min: number = 0;
    public get min(): number {
        return this._min;
    }
    @Input()
    public set min(value: number) {
        if (this.value >= this.min) {
            if (this.value < value) {
                this._min = value;
                this.setValue(this._min);
                return;
            }
        }

        this._min = value;
    }

    private _max: number = 100;
    public get max(): number {
        return this._max;
    }
    @Input()
    public set max(value: number) {
        if (this.value <= this._max) {
            if (this.value > value) {
                this._max = value;
                this.setValue(this._max);
                return;
            }
        }

        this._max = value;
    }

    @Input()
    public increment: number = 1;

    @Input()
    public isSliderEnabled: boolean = true;

    @Input()
    public unitLabel: string = "cm";

    @Input()
    public inputWidth: string = "1.7em";

    @Input()
    public allowInputOverMinMax: boolean;

    @Output()
    public valueChange = new EventEmitter<IUnitInputValueChangeEvent>();

    public input_keyUp(event: KeyboardEvent) {
        const currentValue = (event.target as HTMLInputElement).value;
        const currentValueNumber = parseInt(currentValue, 10);
        const validNumber = !isNaN(currentValueNumber) && currentValue.trim() === currentValueNumber.toString();

        if (!validNumber) {
            (event.target as HTMLInputElement).value = this.lastValue.toString();
            return;
        }

        this.setValue(currentValueNumber);
    }

    public input_keyDown(event: KeyboardEvent) {
        let step = 0;
        if (event.keyCode === UnitInputComponent.KeyCodeUpArrow)
            step = this.increment;
        else if (event.keyCode === UnitInputComponent.KeyCodeDownArrow)
            step = -this.increment;

        if (step !== 0) {
            if (this.allowInputOverMinMax && (this.value === this.max || this.value === this.min)) {
                this.setValue(this.value + step);
            } else {
                this.setValue(Math.min(this.max, Math.max(this.min, this.value + step)));
            }
        }
    }

    public slider_valueChange(event: ISliderValueChangeEvent) {
        this.setValue(Math.round(event.newValue));
    }

    private setValue(newValue: number) {
        this.value = newValue;
        this.lastValue = newValue;
        this.valueChange.emit({ newValue });
    }
}
