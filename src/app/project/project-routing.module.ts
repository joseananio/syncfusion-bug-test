import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ROUTES } from './project/project.component';

@NgModule({
  imports: [RouterModule.forChild(ROUTES)],
  exports: [RouterModule],
})
export class ProjectRoutingModule {
}
