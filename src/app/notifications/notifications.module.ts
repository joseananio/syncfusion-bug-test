import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { GridModule } from '@syncfusion/ej2-angular-grids';
import { PipesModule } from '../core/pipes/pipes.module';
import { ModalDialogModule } from '../shared/components/modal-dialog/modal-dialog.module';
import { TabViewModule } from '../shared/components/tab-view';
import { ViegaCommonModule } from '../shared/lib/viega-common/lib/viega-common.module';
import { DoneNotificationsComponent } from './done-notifications/done-notifications.component';
import { EventNotificationsComponent } from './event-notifications/event-notifications.component';
import { NotificationsRoutingModule } from './notifications-routing.module';
import { NotificationsComponent } from './notifications/notifications.component';
import { NotificationDetailsComponent } from './open-notifications/notification-details/notification-details.component';
import { OpenNotificationsComponent } from './open-notifications/open-notifications.component';

@NgModule({
  declarations: [
    NotificationsComponent,
    OpenNotificationsComponent,
    DoneNotificationsComponent,
    NotificationDetailsComponent,
    EventNotificationsComponent,
  ],
  imports: [
    CommonModule,
    NotificationsRoutingModule,
    TabViewModule,
    ViegaCommonModule,
    ModalDialogModule,
    FormsModule,
    ReactiveFormsModule,
    GridModule,
    TranslateModule,
    PipesModule,
  ],
  exports: [NotificationDetailsComponent, EventNotificationsComponent],
})
export class NotificationsModule { }
