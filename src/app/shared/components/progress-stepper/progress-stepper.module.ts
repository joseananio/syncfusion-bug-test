import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ViegaCommonModule } from '../../lib/viega-common/lib/viega-common.module';
import { ProgressStepperComponent } from './progress-stepper.component';
import { ProgressStepComponent } from './progress-step/progress-step.component';

@NgModule({
  declarations: [ProgressStepperComponent, ProgressStepComponent],
  imports: [CommonModule, ViegaCommonModule],
  exports: [ProgressStepperComponent, ProgressStepComponent],
})
export class ProgressStepperModule {}
