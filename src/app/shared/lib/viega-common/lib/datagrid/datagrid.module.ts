import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DatagridComponent } from './datagrid/datagrid.component';
import { GridModule, PageService, SortService, FilterService, GroupService } from '@syncfusion/ej2-angular-grids';

@NgModule({
  declarations: [DatagridComponent],
  imports: [
    CommonModule,
    GridModule
  ],
  exports: [
    DatagridComponent
  ],
  providers: [
    PageService,
    SortService,
    FilterService,
    GroupService
  ]
})
export class DatagridModule { }
