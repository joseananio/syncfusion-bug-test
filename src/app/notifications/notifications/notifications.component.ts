import { Component, ViewChild, OnInit } from '@angular/core';
import { Routes } from '@angular/router';
import { AuthorityCodes } from 'src/app/core/services';
import { DataManagerService, NotificationService } from 'src/app/core/services/local-services';
import { environment } from 'src/environments/environment';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { OpenNotificationsComponent } from '../open-notifications/open-notifications.component';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss'],
})
export class NotificationsComponent implements OnInit {
  routes: Routes = ROUTES;

  notificationsEnabled = false;

  eventNotificationsEnabled = false;

  @ViewChild('doneNotifications')
  private fixedMessages: OpenNotificationsComponent;

  constructor(
    private dataManagerService: DataManagerService,
    private notificationService: NotificationService,
  ) {}

  ngOnInit() {
    this.dataManagerService.getUserAuthorityDataManager().ready.then((authorities) => {
      const authoritiesSet = new Set(authorities['result'].authorityCodes);
      this.eventNotificationsEnabled = authoritiesSet.has(AuthorityCodes.VIEWEVENTTYPEEVENT)
                                    || environment.ignoreMessageAuthorityFlags;
      this.notificationsEnabled = authoritiesSet.has(AuthorityCodes.VIEWEVENTTYPEALARM)
                               || authoritiesSet.has(AuthorityCodes.VIEWEVENTTYPEDISRUPTION)
                               || authoritiesSet.has(AuthorityCodes.VIEWEVENTTYPEMAINTENANCE)
                               || environment.ignoreMessageAuthorityFlags;
    }).catch(() => {
      this.notificationService.notify(_('GLOBAL.COULD_NOT_LOAD_PRIVILEGES'));
    });
  }

  public onUnfixedMessageRefresh(): void {
    // update list of fixed messages
    this.fixedMessages.refresh();
  }
}

export const ROUTES: Routes = [
  {
    path: '',
    component: NotificationsComponent,
  },
  {
    path: 'new',
    component: NotificationsComponent,
    data: { tabIndex: 0 },
  },
  {
    path: 'archive',
    component: NotificationsComponent,
    data: { tabIndex: 1 },
  },
  {
    path: 'events',
    component: NotificationsComponent,
    data: { tabIndex: 2 },
  },
  {
    path: '**',
    component: NotificationsComponent,
    redirectTo: '',
  },
];
