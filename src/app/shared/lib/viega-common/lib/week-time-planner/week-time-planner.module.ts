import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WeekTimePlannerComponent } from './week-time-planner.component';
import { DropdownModule } from '../dropdown/dropdown.module';
import { DropDownListModule } from '@syncfusion/ej2-angular-dropdowns';
import { ButtonModule } from '@syncfusion/ej2-angular-buttons';
import { FormsModule } from '@angular/forms';
import { enableRipple } from '@syncfusion/ej2-base';
import { TimePickerModule } from '@syncfusion/ej2-angular-calendars';
import { CheckboxModule } from '../checkbox';
import { RadioModule } from '../radio';
import { UnitInputModule } from '../unit-input';
import { WeekTimePlannerControlComponent } from './week-time-planner-control/week-time-planner-control.component';

enableRipple(true);
@NgModule({
  imports: [
    CommonModule,
    DropdownModule,
    DropDownListModule,
    ButtonModule,
    FormsModule,
    TimePickerModule,
    CheckboxModule,
    RadioModule,
    UnitInputModule,
  ],
  declarations: [WeekTimePlannerComponent, WeekTimePlannerControlComponent],
  exports: [WeekTimePlannerComponent, WeekTimePlannerControlComponent],
})
export class WeekTimePlannerModule {}
