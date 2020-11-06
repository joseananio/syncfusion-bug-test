import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { ModalDialogComponent } from '../modal-dialog/modal-dialog.component';

/**
 * A dynamically created dialog module for a data structure akin to https://collab.cbb.de/confluence/display/TWMS/DTE+Funktionstest.
 *
 * onUpdate will emit either a tuple or a string:
 *
 * <b>tuple</b> with {key: string, value} in case of input values from abstract-modular-component implementation.
 *
 * <b>string</b> in case of button press.
 */
@Component({
  selector: 'app-generated-dynamic-dialog',
  templateUrl: './generated-dynamic-dialog.component.html',
  styleUrls: ['./generated-dynamic-dialog.component.scss'],
})
export class GeneratedDynamicDialogComponent extends ModalDialogComponent {
  public name = this.data.name;

  constructor(public dialogRef: MatDialogRef<GeneratedDynamicDialogComponent>, @Inject(MAT_DIALOG_DATA) public data) {
    super(dialogRef, data);
    this.updateData();
  }

  public getDisplayElements(): [] {
    return this.data.displayElements || [];
  }

  public getTitle(): string {
    if (this.data.displayName) {
      try {
        const ret = _(this.data.displayName.i18N);
        return ret === this.data.displayName ? this.data.displayName.default : ret;
      } catch (err) {
        return this.data.displayName.default;
      }
    }
    return this.data.title || '';
  }

  public valueChange(evt: any) {
    this.onUpdate.emit(evt);
  }

  public onButtonEvent(eventName: string): void {
    switch (eventName) {
      case 'close': {
        this.closeDialog(false);
        break;
      }
      case 'confirm': {
        this.onUpdate.emit(eventName);
        this.closeDialog(true);
        break;
      }
      default: {
        this.onUpdate.emit(eventName);
        break;
      }
    }
  }

  /**
   * Will be run from the constructor - override this function if you need additional logic.
   */
  protected updateData(): void {
    /* override in implementing classes */
  }
}
