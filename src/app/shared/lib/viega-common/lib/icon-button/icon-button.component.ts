import { Component, Input, HostBinding, ViewChild } from '@angular/core';

@Component({
  selector: 'viega-icon-button',
  templateUrl: './icon-button.component.html',
  styleUrls: ['./icon-button.component.scss']
})
export class IconButtonComponent {
  public matColor: string = 'basic';

  @Input()
  public icon: string = 'right_thin-01';

  @Input()
  public background: string;

  @Input()
  public isDisabled: boolean = false;

  @ViewChild('descriptionContent')
  descriptionContent: any;

  @HostBinding('attr.disabled')
  public get disabled(): string {
    return this.isDisabled ? 'disabled' : undefined;
  }

  // Remove host binding because it prevents handling click events from within this component.
  /*   @HostBinding('attr.disabled')
    public get disabled(): string {
        return this.isDisabled ? 'disabled' : undefined;
    } */

  public click(event: MouseEvent) {
    event.preventDefault();
    if (this.isDisabled) {
      event.stopImmediatePropagation();
    }
  }
}
