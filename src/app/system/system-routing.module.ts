import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ROUTES as ROUTES_SYSTEM } from './system/system.component';

@NgModule({
  imports: [RouterModule.forChild(ROUTES_SYSTEM)],
  exports: [RouterModule],
})
export class SystemRoutingModule {}
