import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TranslateModule } from '@ngx-translate/core';
import { DteFunctionTestReportRoutingModule } from './dte-function-test-report-routing.module';
import { DteFunctionTestReportComponent } from './dte-function-test-report.component';
import { PipesModule } from '../core/pipes/pipes.module';

@NgModule({
  declarations: [DteFunctionTestReportComponent],
  imports: [
    CommonModule,
    DteFunctionTestReportRoutingModule,
    TranslateModule,
    PipesModule,
  ],
})
export class DteFunctionTestReportModule { }
