import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AbstractModularComponent } from './abstract-modular.component';

@Component({
  selector: 'app-modular-output-testdata',
  templateUrl: './testdata-modular.component.html',
  styleUrls: ['../generated-dynamic-dialog.component.scss'],
})
export class TestdataModularComponent extends AbstractModularComponent {
  constructor(public dialogRef: MatDialogRef<TestdataModularComponent>, @Inject(MAT_DIALOG_DATA) public item) {
    super(dialogRef);
  }

  getDescription() {
    return `${this.item.testCaseName}: ${this.item.testCaseResultStatus}`;
  }
}
