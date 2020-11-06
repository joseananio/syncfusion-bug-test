import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ListBoxModule } from '@syncfusion/ej2-angular-dropdowns';
import { ViegaCommonModule } from '../../lib/viega-common/lib/viega-common.module';
import { ModalDialogModule } from '../modal-dialog/modal-dialog.module';
import { FilterTemplateComponent } from './filter-template/filter-template.component';

@NgModule({
  declarations: [
    FilterTemplateComponent,
  ],
  imports: [
    CommonModule,
    ListBoxModule,
    ViegaCommonModule,
    ModalDialogModule,
    ReactiveFormsModule,
    TranslateModule,
  ],
  exports: [
    FilterTemplateComponent,
  ],
})
export class FilterTemplateModule { }
