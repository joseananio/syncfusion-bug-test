import {
  Component,
  AfterViewInit,
  Input,
  Output,
  EventEmitter,
  forwardRef,
  ElementRef,
  ViewChild
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { ValueAccessor } from '../shared/ValueAccessor';

export interface ICheckboxValueChangeEvent {
  newState: boolean;
}
interface ChangedEvent {
  checked: boolean;
  event: Event;
  name: string;
}
@Component({
  selector: 'viega-checkbox',
  templateUrl: './checkbox.component.html',
  styleUrls: ['./checkbox.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CheckboxComponent),
      multi: true
    }
  ]
})
export class CheckboxComponent extends ValueAccessor<boolean> implements AfterViewInit {
  @Input()
  public inputId: string;

  @Input()
  public label: string;

  @ViewChild('labelContentWrapper') content: ElementRef;

  @Output()
  public valueChange = new EventEmitter<ICheckboxValueChangeEvent>();

  public isClicking = false;

  ngAfterViewInit() {
    // avoid ExpressionChangedAfterItHasBeenCheckedError
    setTimeout(() => {
      this.label = this.label || this.content.nativeElement.innerHTML.toString();
    });
  }

  @Input()
  public get isChecked(): boolean {
    return this.value;
  }
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

  public onChange(e: ChangedEvent): EventEmitter<void> {
    e.event.preventDefault();
    this.value = e.checked;
    this.valueChange.emit({ newState: this.value });
    return;
  }
}
