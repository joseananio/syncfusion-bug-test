import {
  Component,
  Input,
  Output,
  EventEmitter,
  HostListener
} from '@angular/core';
import { ViewEncapsulation } from '@angular/core';
import {
  Location,
  LocationStrategy,
  PathLocationStrategy
} from '@angular/common';
import { rippleMouseHandler } from '@syncfusion/ej2-angular-buttons';
import { rippleEffect } from '@syncfusion/ej2-base';

type CustomClickHandler = (event: MouseEvent) => void;

@Component({
  selector: 'viega-app-widget',
  templateUrl: './app-widget.component.html',
  styleUrls: ['./app-widget.component.scss'],
  providers: [
    Location,
    { provide: LocationStrategy, useClass: PathLocationStrategy }
  ],
  encapsulation: ViewEncapsulation.None
})
export class AppWidgetComponent {
  constructor(private location: Location) {
    this.location = location;
  }

  @Input()
  public icon: string;

  @Input()
  public badgeValue: number;

  @Input()
  public isDisabled: boolean;

  @Input()
  public uri: string;

  @Input()
  public clickHandler: CustomClickHandler;

  // @HostListener('click', ['$event'])
  // public onWidgetClick(event: MouseEvent) {
  //   this.runRipple(event);
  //   if (this.isDisabled) {
  //     return;
  //   }

  //   if (this.clickHandler) {
  //     return this.clickHandler(event);
  //   }

  //   if (this.uri) {
  //     this.location.go(this.uri);
  //   }
  // }

  private runRipple(event: MouseEvent) {
    const rippleSpan: HTMLElement = document.querySelector('.viega-app-widget');
    rippleEffect(rippleSpan, { selector: '.icon' });
    // rippleMouseHandler(event, rippleSpan);
  }
}
