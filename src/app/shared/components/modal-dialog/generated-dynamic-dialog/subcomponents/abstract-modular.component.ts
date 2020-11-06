import {
  Component, EventEmitter, HostBinding, Input, OnInit, Output,
} from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

export interface DynamicLocalisationData {
  i18N: string;
  default: string;
  formats?: string[];
}

@Component({
  template: '',
  styleUrls: ['../generated-dynamic-dialog.component.scss'],
})
/*
 * Important: This is _not_ a dialogue component, it's a partial
 */
export class AbstractModularComponent implements OnInit {
  /*
   * Required for @HostBinding('style.width') below
   */
  @Input() numCols = 1;

  /*
   * data to be bound
   */
  @Input() public data: { [Key: string]: any } = {};

  /*
   * Send changes back to GeneratedModularDialogue
   */
  @Output() changeEvt = new EventEmitter<{ [Key: string]: any }>();

  /*
   * Component will dynamically calculate its width based on numSiblings
   */
  @HostBinding('style.width') styleWidth: string;

  /*
   * for css styling
   */
  @HostBinding('class') class = 'col';

  constructor(public dialogRef: MatDialogRef<AbstractModularComponent>) {}

  ngOnInit() {
    const width = 100 / this.numCols;
    this.styleWidth = `${Math.max(width, 20)}%`;
  }

  public getData(): DynamicLocalisationData {
    this.data = this.data || {};
    const text = this.data.text || {};
    return { i18N: text.i18N, default: text.default, formats: text.formats };
  }

  public toString(): string {
    return JSON.stringify(
      this.data,
      (key, value) => (value !== null ? value : undefined),
      2,
    );
  }

  onChange(key: string, value?: any) {
    this.changeEvt.emit({ key, value });
  }
}
