import { ComponentsModule } from './../shared/components/components.module';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ListBoxModule } from '@syncfusion/ej2-angular-dropdowns';
import { GridModule } from '@syncfusion/ej2-angular-grids';
import { TreeViewModule } from '@syncfusion/ej2-angular-navigations';
import { FilterService, SortService, TreeGridModule } from '@syncfusion/ej2-angular-treegrid';
import { DevicesRoutingModule } from './devices-routing.module';
import { DevicesComponent } from './devices/devices.component';

@NgModule({
  declarations: [
    DevicesComponent,
  ],
  imports: [
    FormsModule,
    CommonModule,
    DevicesRoutingModule,
    TreeGridModule,
    GridModule,
    TreeViewModule,
    TranslateModule,
    ListBoxModule,
    ComponentsModule,
  ],
  providers: [FilterService, SortService],
  exports: [],
})
export class DevicesModule { }
