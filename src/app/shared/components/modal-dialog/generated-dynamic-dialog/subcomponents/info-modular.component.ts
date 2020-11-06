import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AbstractModularComponent } from './abstract-modular.component';

@Component({
  selector: 'app-modular-output-info',
  templateUrl: './info-modular.component.html',
  styleUrls: ['../generated-dynamic-dialog.component.scss'],
})
export class InfoModularComponent extends AbstractModularComponent {
  constructor(public dialogRef: MatDialogRef<InfoModularComponent>, @Inject(MAT_DIALOG_DATA) public item) {
    super(dialogRef);
  }
}
