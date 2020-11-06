import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { ViegaCommonModule } from 'src/app/shared/lib/viega-common/lib/viega-common.module';
import { ProjectFileComponent } from './project-file.component';

@NgModule({
  declarations: [
    ProjectFileComponent,
  ],
  exports: [
    ProjectFileComponent,
  ],
  imports: [
    CommonModule,
    ViegaCommonModule,
    TranslateModule,
  ],
})
export class ProjectFileModule {}
