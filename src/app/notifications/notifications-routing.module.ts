import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ROUTES } from './notifications/notifications.component';

@NgModule({
  imports: [RouterModule.forChild(ROUTES)],
  exports: [RouterModule],
})
export class NotificationsRoutingModule {}
