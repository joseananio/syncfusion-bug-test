import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { FunctionsComponent } from './functions/functions.component';

const routes: Routes = [
  {
    path: '',
    component: FunctionsComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FunctionManagementRoutingModule {}
