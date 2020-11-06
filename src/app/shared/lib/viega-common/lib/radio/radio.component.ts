import { Component, Input, HostListener, EventEmitter, Output, forwardRef, ViewChild, ElementRef } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { ValueAccessor } from '../shared/ValueAccessor';

export interface IRadioButtonValueChangeEvent {
    newState: boolean;
}

@Component({
    selector: 'viega-radio',
    templateUrl: './radio.component.html',
    styleUrls: ['./radio.component.scss'],
    providers: [{
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => RadioComponent),
        multi: true
    }]
})
export class RadioComponent extends ValueAccessor<any> {
    @ViewChild('optionbox')
    public optionBox: ElementRef;

    @Input('value')
    public instanceValue: any;

    @Input()
    public name: string;

    public get value(): boolean {
      return super.value;
    }
    
    public set value(value: boolean) {
      super.value = value;
    }

    @Input()
    public get isChecked(): boolean {
        return super.value === this.instanceValue;
    }

    public set isChecked(isChecked: boolean) {
        if (isChecked) {
            super.value = this.instanceValue;
        } else {
            super.value = !this.instanceValue;
        }
    }

    @Input()
    public get isDisabled(): boolean {
        return this.disabled;
    }

    public set isDisabled(isDisabled: boolean) {
        this.disabled = isDisabled;
    }

    @Output()
    public valueChange = new EventEmitter<IRadioButtonValueChangeEvent>();

    public isClicking: boolean = false;

    @HostListener('click', ['$event'])
    public onClick(event: MouseEvent) {
        if (this.disabled)
            return;

        this.value = this.instanceValue;

        this.optionBox.nativeElement.focus();
        this.touch();
        this.valueChange.emit({ newState: this.isChecked });
    }

    @HostListener('keydown', ['$event'])
    public onKeyDown(event: KeyboardEvent) {
        if (this.disabled)
            return;

        if (event.key === ' ' || event.key === 'Enter') {
            event.preventDefault();
            this.value = this.instanceValue;

            this.optionBox.nativeElement.focus();
            this.touch();
            this.valueChange.emit({ newState: this.isChecked });
        }
    }
}
