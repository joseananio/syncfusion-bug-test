import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DteFunctionTestReportComponent } from './dte-function-test-report.component';

const routes: Routes = [{ path: '', component: DteFunctionTestReportComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DteFunctionTestReportRoutingModule { }
