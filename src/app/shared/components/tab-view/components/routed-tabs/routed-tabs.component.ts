import { Component, Input } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute, Routes } from '@angular/router';
import { TabsComponent } from '../tabs/tabs.component';

/**
 * A version of TabsComponent that allows controlling the initial selected tab using the URL and
 * changes the URL when switching tabs.
 * It is assumed that a path uses the format <code><base path>/<sub page></code>.
 * The <code>sub page</code> is used to represent the selected tab.
 */
@Component({
  selector: 'viega-routed-tab-view',
  templateUrl: '../tabs/tabs.component.html',
  styleUrls: ['../tabs/tabs.component.scss'],
})
export class RoutedTabsComponent extends TabsComponent {
  /**
   * A list of routes mapping the routes to tab indices.
   * This is done by adding a 0-based <code>tabIndex</code> to the data field like this:
   *
   * @example <code>{path: ...,  component: ..., data: { tabIndex: 3 }}</code>
   */
  @Input() routes?: Routes;

  /**
   * Part of the URL path (!) before the <code>sub page</code>.
   */
  @Input() basePath = '';

  constructor(route: ActivatedRoute, private location: Location) {
    super();

    // Get tab index determined by route.
    route.data.subscribe((data) => {
      this.selectedItem = data.tabIndex;
    });
    // Subscribe to tab switching to manipulate the location.
    this.selected.subscribe(($event) => {
      this.onTabSelected($event);
    });
  }

  /**
   * Returns a normalized base path with a leading slash and no trailing slash.
   */
  private getBasePath(): string {
    return `/${this.basePath.split('/').filter((e) => !!e).join('/')}`;
  }

  private onTabSelected($event) {
    const route = this.routes.find(
      (element) => element.data && element.data.tabIndex === $event.selectedIndex,
    );
    if (route) {
      const initialTabIndex = this.selectedItem || 0;
      // Do not change path if path if equivalent to base path.
      if (this.location.path() !== this.getBasePath()
          || initialTabIndex !== $event.selectedIndex) {
        // Only manipulate path to prevent tab switch to be recorded in browser history.
        this.location.replaceState(Location.joinWithSlash(this.getBasePath(), route.path));
      }
    }
  }
}
