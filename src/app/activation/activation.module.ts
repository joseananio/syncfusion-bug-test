import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ViegaCommonModule } from '../shared/lib/viega-common/lib/viega-common.module';
import { ActivationComponent } from './activation.component';

@NgModule({
  declarations: [ActivationComponent],
  imports: [CommonModule, FormsModule, ViegaCommonModule, TranslateModule],
})
export class ActivationModule { }
