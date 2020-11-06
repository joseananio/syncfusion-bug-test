import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { ValueAccessor } from '../shared/ValueAccessor';

export interface IToggleButtonValueChangeEvent {
  newState: boolean;
}

interface ChangedEvent {
  checked: boolean;
  event: Event;
  name: string;
}

// TODO (Reger): binding (valueChange) in a template leads it being called multiple times during initialization. pls fix
@Component({
  selector: 'viega-toggle-button',
  templateUrl: './toggle-button.component.html',
  styleUrls: ['./toggle-button.component.scss']
})
export class ToggleButtonComponent extends ValueAccessor<boolean> {
  @Input()
  public inputId = '';

  @Input()
  set value(value: boolean) {
    super.value = value;
  };

  get value(): boolean {
    return super.value;
  }

  public get isChecked(): boolean {
    return this.value;
  }

  @Input()
  public set isChecked(isChecked: boolean) {
    this.value = isChecked;
  }

  @Input()
  public get isDisabled(): boolean {
    return this.disabled;
  }
  public set isDisabled(isDisabled: boolean) {
    this.disabled = isDisabled;
  }

  @Output()
  public valueChange = new EventEmitter<boolean>();

  @Output()
  public isCheckedChange = new EventEmitter<IToggleButtonValueChangeEvent>();

  @Output()
  handleChange(e: ChangedEvent): EventEmitter<void> {
    e.event.preventDefault();
    this.value = e.checked;
    this.isCheckedChange.emit({ newState: this.value });
    this.valueChange.emit(this.value);
    return;
  }
}
