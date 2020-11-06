import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AbstractModularComponent } from './abstract-modular.component';

@Component({
  selector: 'app-modular-output-value',
  templateUrl: './value-modular.component.html',
  styleUrls: ['../generated-dynamic-dialog.component.scss'],
})
export class ValueModularComponent extends AbstractModularComponent {
  constructor(public dialogRef: MatDialogRef<ValueModularComponent>, @Inject(MAT_DIALOG_DATA) public item) {
    super(dialogRef);
  }

  getDescription() {
    return this.data.value;
  }
}
