import {
  Component,
  Input,
  Output,
  EventEmitter,
  HostListener,
  OnInit
} from '@angular/core';
import { ViewEncapsulation } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ValueAccessor } from '../shared/ValueAccessor';

enum SearchButtonTheme {
  DARK = 'dark',
  LIGHT = 'light'
}

export interface ISearchBoxChangeEvent {
  newState: string;
}
@Component({
  selector: 'viega-search-box',
  templateUrl: './search-box.component.html',
  styleUrls: ['./search-box.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class SearchBoxComponent extends ValueAccessor<string>
  implements OnInit {
  @Input()
  public theme: SearchButtonTheme = SearchButtonTheme.LIGHT;

  @Input()
  public get isDisabled(): boolean {
    return this.disabled;
  }
  public set isDisabled(isDisabled: boolean) {
    this.disabled = isDisabled;
  }

  @Input()
  public defaultValue: string;

  @Input()
  public placeholder = 'Suche';

  @Output()
  public valueChange = new EventEmitter<ISearchBoxChangeEvent>();

  modelChanged: Subject<string> = new Subject<string>();

  constructor() {
    super();
    this.modelChanged
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
      )
      .subscribe(this.setValue.bind(this));
  }

  ngOnInit() {
    if (this.defaultValue) {
      this.setValue(this.defaultValue);
    }
  }

  private setValue(value) {
    this.value = value;
    this.valueChange.emit({ newState: this.value });
  }

  inputChanged(text: string) {
    this.modelChanged.next(text);
  }
}
