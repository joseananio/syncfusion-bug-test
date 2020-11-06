import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DropdownComponent } from './dropdown.component';
import { DropDownListModule } from '@syncfusion/ej2-angular-dropdowns';

@NgModule({
  imports: [
    CommonModule,
    DropDownListModule,
  ],
  declarations: [
    DropdownComponent,
  ],
  exports: [
    DropdownComponent,
  ],
})
export class DropdownModule { }
