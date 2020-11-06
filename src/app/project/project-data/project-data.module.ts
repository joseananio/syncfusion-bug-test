import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ViegaCommonModule } from 'src/app/shared/lib/viega-common/lib/viega-common.module';
import { TranslateModule } from '@ngx-translate/core';
import { ProjectDataComponent } from './project-data.component';

@NgModule({
  declarations: [
    ProjectDataComponent,
  ],
  exports: [
    ProjectDataComponent,
  ],
  imports: [
    CommonModule,
    ViegaCommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
  ],
})
export class ProjectDataModule {}
