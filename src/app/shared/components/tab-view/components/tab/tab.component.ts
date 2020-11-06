import {
  Component, Input, TemplateRef, ViewChild,
} from '@angular/core';

@Component({
  selector: 'viega-tab',
  templateUrl: './tab.component.html',
  styleUrls: ['./tab.component.css'],
})
export class TabComponent {
  @Input() tabTitle: string;

  @Input() isDisabled = false;

  @Input() cssClass: string;

  @ViewChild('tabTemplate')
  template: TemplateRef<any>;
}
