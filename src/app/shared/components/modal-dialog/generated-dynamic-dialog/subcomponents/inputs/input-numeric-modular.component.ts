import {
  Component, ElementRef, Inject, OnInit, ViewChild,
} from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { AbstractModularComponent } from '../abstract-modular.component';

@Component({
  selector: 'app-modular-input-numeric',
  templateUrl: './input-numeric-modular.component.html',
  styleUrls: ['../../generated-dynamic-dialog.component.scss'],
})
export class InputNumericModularComponent extends AbstractModularComponent implements OnInit {
  public rawValue = 0;

  public value = 0;

  readOnly = false;

  isWaiting = false;

  interval = 1000;

  @ViewChild('input') input: ElementRef;

  model: number;

  modelChanged = new Subject<number>();

  constructor(public dialogRef: MatDialogRef<InputNumericModularComponent>, @Inject(MAT_DIALOG_DATA) public item) {
    super(dialogRef);

    // add a delay
    this.modelChanged.pipe(debounceTime(1500)).subscribe(() => {
      super.onChange(this.data.name, this.data.value);
      this.isWaiting = false;
    });
  }

  changed(evt) {
    if (this.model !== this.data.value) {
      this.data.value = this.model;
      this.isWaiting = true;
      this.modelChanged.next();
    }
  }

  ngOnInit() {
    super.ngOnInit();
    this.readOnly = this.data.readOnly;
    this.model = this.data.value;
  }
}
