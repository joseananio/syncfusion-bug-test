import {
  Component,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  OnInit,
  ɵConsole,
  HostListener,
} from '@angular/core';
import { ValueAccessor } from '../shared/ValueAccessor';
import { TooltipComponent, Position } from '@syncfusion/ej2-angular-popups';

export interface IInfoButtonValueChangeEvent {
  newState: boolean;
}

@Component({
  selector: 'viega-info-button',
  templateUrl: './info-button.component.html',
  styleUrls: ['./info-button.component.scss'],
})
export class InfoButtonComponent {
  isTooltipOpen = false;
  @Input()
  public header = '';

  /**
   * The content of the tooltip.
   * Be careful not to use any unsanitized user input here. Any HTML will work!
   */
  @Input()
  public message: string = null;

  @Input()
  public isDisabled: boolean;

  @Input()
  public id?: string;

  @Input()
  public position: Position = 'BottomRight';

  @ViewChild('tooltip')
  public tooltipItem: TooltipComponent;

  @ViewChild('infoTrigger')
  public infoTrigger: HTMLButtonElement;

  private hoverOpened = false;

  @HostListener('mouseover', ['$event'])
  public onClick(event: MouseEvent) {
    this.openInfo(event);
    this.hoverOpened = true;
  }

  @HostListener('blur', ['$event'])
  @HostListener('mouseout', ['$event'])
  public onBlur(event: MouseEvent) {
    this.closeInfo(event);
    this.hoverOpened = false;
  }

  customOpen(event: MouseEvent): void {
    if (this.hoverOpened) {
      this.hoverOpened = false;
      return;
    }
    if ((event.target as Element).getAttribute('data-tooltip-id')) {
      this.closeInfo(event);
      this.hoverOpened = false;
    } else {
      this.openInfo(event);
    }
  }

  closeInfo(event: MouseEvent) {
    this.tooltipItem.close();
    this.isTooltipOpen = false;
    (event.target as Element).removeAttribute('data-tooltip-id');
  }

  openInfo(event: MouseEvent) {
    if (this.isDisabled) {
      return;
    }
    this.tooltipItem.open(event.target as HTMLElement);
    this.isTooltipOpen = true;
  }

  getId() {
    if (!this.id) {
      return null;
    }
   return `${this.id}${this.isDisabled ? '' : '_target'}`
  }
}
