import {
  Component, HostBinding, Inject, OnInit,
} from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AbstractModularComponent } from '../abstract-modular.component';

@Component({
  selector: 'app-modular-input-button',
  templateUrl: './input-button-modular.component.html',
  styleUrls: ['../../generated-dynamic-dialog.component.scss'],
})
export class InputButtonModularComponent extends AbstractModularComponent implements OnInit {
  @HostBinding('class') classes = '';

  /*
   * Do we want toggle buttons?
   */
  private isActive = false;

  constructor(public dialogRef: MatDialogRef<InputButtonModularComponent>, @Inject(MAT_DIALOG_DATA) public item) {
    super(dialogRef);
  }

  ngOnInit() {
    super.ngOnInit();
    this.classes = '';
  }

  protected getClasses(): string {
    return this.classes ? this.classes : '';
  }

  onClickButton(evt?: any) {
    if (this.data.toggle) {
      // TODO: THis will never do anything yet
      this.isActive = !this.isActive;
    }
    this.classes = this.isActive ? 'active' : '';
    if (this.data.toggle && !this.isActive) {
      return;
    }
    super.onChange(this.data.name);
  }
}
