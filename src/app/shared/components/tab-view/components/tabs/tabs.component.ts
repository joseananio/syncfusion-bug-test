import {
  Component,

  ContentChildren, EventEmitter,
  Input,
  Output,
  QueryList,
  ViewChild,
} from '@angular/core';
import { Tab as SyncfusionTab } from '@syncfusion/ej2-angular-navigations';
import { SelectEventArgs } from '@syncfusion/ej2-navigations';
import { TabComponent as Tab } from '../tab/tab.component';

@Component({
  selector: 'viega-tab-view',
  templateUrl: './tabs.component.html',
  styleUrls: ['./tabs.component.scss'],
})
export class TabsComponent {
  /**
   * 0-based index of the tab that shall be initially selected.
   */
  @Input() selectedItem: number;

  /**
   * Event emitted after a tab has been selected.
   */
  @Output() selected = new EventEmitter();

  @ViewChild('tabs')
  public tabElement: SyncfusionTab;

  /**
   * List of viega-tab child elements in the content DOM.
   */
  @ContentChildren(Tab)
  viegaTabs: QueryList<Tab>;

  /**
   * Animation currently turned off for performance reasons.
   */
  public animationSettings: object = {
    previous: { effect: '', duration: 0, easing: '' },
    next: { effect: '', duration: 0, easing: '' },
  };

  /**
   * Sets the current tab.
   *
   * @param index The new 0-based tab index.
   */
  public select(index: number) {
    this.tabElement.select(index);
  }

  // Prevent content swipe selection
  public selecting(e: SelectEventArgs) {
    if (e.isSwiped) {
      e.cancel = true;
    }
  }
}
