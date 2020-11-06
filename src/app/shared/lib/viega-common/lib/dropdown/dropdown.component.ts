import {
  Component,
  OnInit,
  HostListener,
  Input,
  Output,
  ViewChild,
  ViewEncapsulation,
  EventEmitter
} from '@angular/core';
import { DropDownListComponent, ChangeEventArgs } from '@syncfusion/ej2-angular-dropdowns';
export interface DropdownFields {
  groupBy: string;
  text: string;
  value: string;
}

@Component({
  selector: 'viega-dropdown',
  templateUrl: './dropdown.component.html',
  styleUrls: ['./dropdown.component.scss']
})
export class DropdownComponent implements OnInit {
  constructor() {}

  @Input()
  public locale: string;

  @Input()
  public isDisabled: boolean = false;

  @Input()
  public placeholder: string;

  /**
   * String array to display. Can also be type  { [key: string]: Object }[]
   * with a dedicated field input set. Then, field select which key's value to display
   * in the dropdown.   */
  @Input()
  public dataSource: any[];

  /** Selected value.
   * Allows two way binding with [(value)].
   */
  @Input()
  value: string;

  /**
   * Selects the key of dataSource to be displayed in the dropdown.
   * Needs to be set if dataSource is not a string array but key-value object.
   */
  @Input()
  fields?: DropdownFields = null;

  @Input()
  public popupHeight: number;

  @Input()
  public width: number;

  @Input()
  public itemTemplate: any;

  @Input()
  public valueTemplate: any;

  /**
   * Output directly passes through (change) of child component
   * ejs-dropdownlist from syncfusion.
   */
  @Output()
  public change = new EventEmitter<ChangeEventArgs>();

  @Output()
  valueChange: EventEmitter<string> = new EventEmitter<string>();

  onChange(event: ChangeEventArgs) {
    this.valueChange.emit(this.value);
    this.change.emit(event);
  }
  ngOnInit() {}
}
