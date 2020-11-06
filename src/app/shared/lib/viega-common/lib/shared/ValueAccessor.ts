import { ControlValueAccessor } from '@angular/forms';

/** Utility class for implementing ngModel support in components. */
export abstract class ValueAccessor<T> implements ControlValueAccessor {
  private innerValue: T;

  private changed: (value: T) => void;
  private touched: () => void;

  public disabled: boolean;

  public get value(): T {
    return this.innerValue;
  }
  public set value(value: T) {
    if (this.innerValue !== value) {
      this.innerValue = value;
      if (this.changed) {
        this.changed(value);
      }
    }
  }

  protected touch(): void {
    if (this.touched) {
      this.touched();
    }
  }

  // ControlValueAccessor
  public writeValue(value: T): void {
    this.innerValue = value;
  }

  // ControlValueAccessor
  public registerOnChange(fn: (value: T) => void) {
    this.changed = fn;
  }

  // ControlValueAccessor
  public registerOnTouched(fn: () => void) {
    this.touched = fn;
  }

  // ControlValueAccessor
  public setDisabledState?(isDisabled: boolean) {
    this.disabled = isDisabled;
  }
}
