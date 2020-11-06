import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ROUTES } from './protocols/protocols.component';

@NgModule({
  imports: [RouterModule.forChild(ROUTES)],
  exports: [RouterModule],
})
export class ProtocolsRoutingModule {
}
