import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { SupportComponent } from './support.component';
import { ServicesComponent } from './services/services.component';
import { ViegaCommonModule } from '../shared/lib/viega-common/lib/viega-common.module';

@NgModule({
  imports: [
    CommonModule,
    TranslateModule,
    ViegaCommonModule,
  ],
  declarations: [
    SupportComponent,
    ServicesComponent,
  ],
})
export class SupportModule { }
