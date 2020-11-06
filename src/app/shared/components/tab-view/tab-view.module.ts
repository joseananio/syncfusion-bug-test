import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TabModule } from '@syncfusion/ej2-angular-navigations';
import { TabsComponent } from './components/tabs/tabs.component';
import { RoutedTabsComponent } from './components/routed-tabs/routed-tabs.component';
import { TabComponent } from './components/tab/tab.component';

@NgModule({
  declarations: [TabsComponent, RoutedTabsComponent, TabComponent],
  imports: [CommonModule, TabModule],
  exports: [TabsComponent, RoutedTabsComponent, TabComponent],
})
export class TabViewModule {}
