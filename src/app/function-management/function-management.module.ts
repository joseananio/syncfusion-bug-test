import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { CheckBoxModule } from '@syncfusion/ej2-angular-buttons';
import { DateTimePickerModule } from '@syncfusion/ej2-angular-calendars';
import { ListBoxModule } from '@syncfusion/ej2-angular-dropdowns';
import { GridModule, ReorderService } from '@syncfusion/ej2-angular-grids';
import { TreeViewModule } from '@syncfusion/ej2-angular-navigations';
import { ComponentsModule } from '../shared/components/components.module';
import { ModalDialogModule } from '../shared/components/modal-dialog/modal-dialog.module';
import { ViegaCommonModule } from '../shared/lib/viega-common/lib/viega-common.module';
import {
  FunctionTemperatureLevelComponent,
} from './forms/form-function-step-two/function-temperature-level/function-temperature-level.component';
import {
  FunctionDevicesSequenceComponent,
} from './forms/form-function-step-three/function-devices-sequence/function-devices-sequence.component';
import { FunctionAddComponent } from './function-add/function-add.component';
import { FunctionManagementRoutingModule } from './function-management-routing.module';
import { FunctionsComponent } from './functions/functions.component';
import { ThermalDisinfectModalComponent } from './thermal-disinfect-modal/thermal-disinfect-modal.component';
import { FormFunctionStepOne } from './forms/form-function-step-one/form-function-step-one.component';
import { FormFunctionStepThree } from './forms/form-function-step-three/form-function-step-three.component';
import { FormFunctionStepTwo } from './forms/form-function-step-two/form-function-step-two.component';

@NgModule({
  declarations: [
    FunctionsComponent,
    FunctionAddComponent,
    FormFunctionStepOne,
    FormFunctionStepTwo,
    FormFunctionStepThree,
    ThermalDisinfectModalComponent,
    FunctionDevicesSequenceComponent,
    FunctionTemperatureLevelComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    FunctionManagementRoutingModule,
    ViegaCommonModule,
    GridModule,
    ModalDialogModule,
    DateTimePickerModule,
    ComponentsModule,
    TreeViewModule,
    DragDropModule,
    CheckBoxModule,
    ListBoxModule,
    TranslateModule,
  ],
  providers: [ReorderService],
})
export class FunctionManagementModule {}
