import {
  Component, Input, Output, EventEmitter, Inject,
} from '@angular/core';
import { ButtonType } from 'src/app/shared/lib/viega-common/lib/button';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface ModalDialogData {
  [Key: string]: any;
}

/**
 * Contains a headline with logo and button row at bottom. Create a modal
 * component by using this template.
 *
 * To use this template in your dialog component:
 *
 * 1. Insert this template into the parent component's html template.
 * 2. Bind both input title and buttons. See documentation for each.
 * 3. To call methods with the buttons: Bind your parent event handler to app-modal-dialog via (buttonEvent)=myHandler($event).
 *
 * To open your modal component that uses this template:
 *
 * Create a function in your modal-opening component, e.g.
 * public openAddUserDialog() {this.dialog.open(MyDialogComponent, {})};
 *
 * Your modal component can also contain a method to allow closing it dynamically.
 */
@Component({
  selector: 'app-modal-dialog',
  templateUrl: './modal-dialog.component.html',
  styleUrls: ['./modal-dialog.component.scss'],
})
export class ModalDialogComponent {
  @Output()
  public buttonEvent = new EventEmitter<string>();

  /**
   * Title of dialog, displayed next to the viega logo.
   */
  @Input() title: string = null;

  /**
   * Object containing all buttons. Those will be shown at the bottom of the dialog.
   */
  @Input() buttons: ModalButtonData[] = [];

  public onUpdate: EventEmitter<any> = new EventEmitter();

  private btnCallbacks: {
    [Key: string]: Function;
  } = {};

  /*
   * Keep this map to be able to dynamically pass
   */
  public setButtonAttribute(eventName: string, btnKey: string, attribValue: any) {
    this.buttons
      .filter((btn) => btn.eventName === eventName)
      .forEach((btn) => {
        try {
          btn[btnKey] = attribValue;
        } catch (err) {
          console.error(`couldn't set attribute ${btnKey} to ${attribValue}: %o`, err);
        }
      });
  }

  public addButton(btn: ModalButtonData, callback?: Function) {
    if (!this.buttons.includes(btn)) {
      this.buttons.push(btn);
    }
    this.btnCallbacks[btn.eventName] = callback;
  }

  public getButtons(): ModalButtonData[] {
    return this.buttons.filter((btn) => !btn.isHidden);
  }

  constructor(public dialogRef: MatDialogRef<ModalDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: ModalDialogData) { }

  /**
   * This method is the event handler for all contained buttons.
   * It emits an event containing the string defined in <code>button.eventName</code>
   * This allows parent components to call methods for each button.
   */
  callParent(eventName: string) {
    this.buttonEvent.emit(eventName);
  }

  onButtonEvent(eventName: string) {
    if (this.btnCallbacks[eventName]) {
      return this.btnCallbacks[eventName]();
    }
    switch (eventName) {
      case 'close': {
        this.closeDialog(false);
        break;
      }
      case 'confirm': {
        this.closeDialog(true);
        break;
      }
      default: {
        this.onUpdate.emit(eventName);
        // console.error('ERROR: ModalDialogComponent: onButtonEvent triggered with unhandled event name');
      }
    }

    return undefined;
  }

  public closeDialog(result = null) {
    this.dialogRef.close(result);
  }
}

export interface ModalButtonData {
  /**
   * Button name to be displayed.
   */
  name: string;
  /**
   * Type can be 'primary' 'secondary' 'back' 'back-mini' 'cancel'.
   */
  type: ButtonType;
  /**
   * String containing the event name to bind methods in parent. Events are emitted pressing one of the button.
   * Bind your event handler to app-modal-dialog via (buttonEvent)=myHandler($event).
   */
  eventName: string;
  /**
   * HTML ID for this button, should be unique.
   */
  id?: string;
  /**
   * Disables the button.
   */
  isDisabled?: boolean;

  /**
   * Hides the button.
   */
  isHidden?: boolean;

  /**
   * Additional CSS classes.
   */
  class?: string;
}
