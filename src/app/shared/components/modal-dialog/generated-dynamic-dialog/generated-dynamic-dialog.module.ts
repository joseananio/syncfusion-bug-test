import { NgModule } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { GridModule } from '@syncfusion/ej2-angular-grids';
import { TestdataModularComponent } from './subcomponents/testdata-modular.component';
import { PipesModule } from '../../../../core/pipes/pipes.module';
import { GeneratedDynamicDialogComponent } from './generated-dynamic-dialog.component';
import { InfoModularComponent } from './subcomponents/info-modular.component';
import { InputButtonModularComponent } from './subcomponents/inputs/input-button-modular.component';
import { ValueModularComponent } from './subcomponents/value-modular.component';
import { InputNumericModularComponent } from './subcomponents/inputs/input-numeric-modular.component';
import { ViegaCommonModule } from '../../../lib/viega-common/lib/viega-common.module';
import { ModalDialogComponent } from '../modal-dialog/modal-dialog.component';
import { AbstractModularComponent } from './subcomponents/abstract-modular.component';

@NgModule({
  imports: [
    CommonModule,
    ViegaCommonModule,
    MatDialogModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    GridModule,
    PipesModule,
  ],
  /*
   * when declaring additional subcomponents, put them into both "declarations" and "exports" list
   */
  declarations: [
    AbstractModularComponent,
    ModalDialogComponent,
    GeneratedDynamicDialogComponent,
    InfoModularComponent,
    ValueModularComponent,
    TestdataModularComponent,
    InputButtonModularComponent,
    InputNumericModularComponent,
  ],
  exports: [
    GeneratedDynamicDialogComponent,
    InfoModularComponent,
    ValueModularComponent,
    InputButtonModularComponent,
    TestdataModularComponent,
    InputNumericModularComponent,
    ModalDialogComponent,
  ],
})
export class GeneratedDynamicDialogModule { }
