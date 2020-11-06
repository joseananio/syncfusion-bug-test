import { Component, OnInit } from '@angular/core';
import { Routes } from '@angular/router';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { AuthorityCodes } from 'src/app/core/services';
import { DataManagerService, NotificationService } from 'src/app/core/services/local-services';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-protocols',
  templateUrl: './protocols.component.html',
  styleUrls: ['./protocols.component.scss'],
})
export class ProtocolsComponent implements OnInit {
  constructor(
    private dataManagerService: DataManagerService,
    private notificationService: NotificationService,
  ) {}

  public routes: Routes = ROUTES;

  public AuthorityCodes = AuthorityCodes;

  public authorities: Set<string> = undefined;

  public protocolFunctionsEnabled = false;

  public protocolUserActionsEnabled = false;

  public protocolOperationSystemEnabled = false;

  ngOnInit() {
    this.dataManagerService.getUserAuthorityDataManager().ready.then(
      (authorities) => {
        this.authorities = new Set(authorities['result'].authorityCodes);
        this.protocolFunctionsEnabled = this.authorities.has(this.AuthorityCodes.VIEWEVENTTYPEFUNCTION)
                                     || environment.ignoreMessageAuthorityFlags;
        this.protocolUserActionsEnabled = this.authorities.has(this.AuthorityCodes.VIEWMESSAGE);
        this.protocolOperationSystemEnabled = this.authorities.has(this.AuthorityCodes.VIEWEVENTTYPESYSTEMEVENT)
                                           || this.authorities.has(this.AuthorityCodes.VIEWEVENTTYPESYSTEMFAULT)
                                           || environment.ignoreMessageAuthorityFlags;
      },
    ).catch(() => {
      this.notificationService.notify(_('GLOBAL.COULD_NOT_LOAD_PRIVILEGES'));
    });
  }
}

export const ROUTES: Routes = [
  {
    path: '',
    component: ProtocolsComponent,
  },
  {
    path: 'measurement-data',
    component: ProtocolsComponent,
    data: { tabIndex: 0 },
  },
  {
    path: 'plot',
    component: ProtocolsComponent,
    data: { tabIndex: 1 },
  },
  {
    path: 'functions',
    component: ProtocolsComponent,
    data: { tabIndex: 2 },
  },
  {
    path: 'user-actions',
    component: ProtocolsComponent,
    data: { tabIndex: 3 },
  },
  {
    path: 'os',
    component: ProtocolsComponent,
    data: { tabIndex: 4 },
  },
  {
    path: 'auto-backup',
    component: ProtocolsComponent,
    data: { tabIndex: 5 },
  },
  {
    path: '**',
    component: ProtocolsComponent,
    redirectTo: '',
  },
];
