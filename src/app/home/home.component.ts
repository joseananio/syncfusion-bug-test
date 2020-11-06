import { Component, Inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { AuthorityCodes, ControllerService, ControllerStatus } from 'src/app/core/services';
import { AuthenticationService, DataManagerService, NotificationService } from '../core/services/local-services';

interface WidgetItem {
  text: string;
  icon: string;
  batchValueGetter?: () => number;
  uri: string;
  disabled?: boolean;
  id?: string;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  constructor(
    @Inject('AuthService')
    private authService: AuthenticationService,
    private dataManagerService: DataManagerService,
    private controllerService: ControllerService,
    private notificationService: NotificationService,
    private router: Router,
  ) {}

  public widgetItems: WidgetItem[];

  AuthorityCodes = AuthorityCodes;

  authorities: Set<string> = new Set();

  private controllersInErrorStateCount = undefined;

  ngOnInit() {
    this.dataManagerService.getUserAuthorityDataManager().ready.then(
      (authorities) => {
        this.authorities = new Set(authorities['result'].authorityCodes);
        this.setHomeButtons();
      },
    ).catch(() => {
      this.notificationService.notify(_('GLOBAL.COULD_NOT_LOAD_PRIVILEGES'));
    });

    this.countControllersInPersistentFailure();
  }

  private countControllersInPersistentFailure(): void {
    this.controllerService.getControllerMetadataList().subscribe(
      (controllers) => {
        this.controllersInErrorStateCount = controllers.reduce(
          (accumulator, controller) => accumulator
              + (controller.controllerStatus === ControllerStatus.FATALPERSISTANTSYSTEMFAILURE ? 1 : 0),
          0,
        );
      },
      () => {
        // Getting this counter bubble is nice-to-have. So we can ignore this error.
        this.controllersInErrorStateCount = 0;
      },
    );
  }

  private setHomeButtons(): void {
    this.widgetItems = [];

    if (this.authorities.has(AuthorityCodes.SHOWPROJECTINFORMATION)) {
      this.widgetItems.push({
        text: _('APP.PROJECT'),
        uri: '/project',
        icon: 'copy-01',
        id: 'widget-home-project',
      });
    }
    if (this.authorities.has(AuthorityCodes.GETDEVICE)) {
      this.widgetItems.push({
        text: _('APP.DEVICES'),
        uri: '/devices',
        icon: 'faders-01',
        id: 'widget-home-devices',
        batchValueGetter: this.getControllersInErrorState.bind(this),
      });
    }
    if (this.authorities.has(AuthorityCodes.READDEVICEPOINTGROUPFUNCTIONS)) {
      this.widgetItems.push({
        text: _('APP.FUNCTIONS'),
        uri: '/functions',
        icon: 'calendar',
        id: 'widget-home-functions',
      });
    }
    if (this.authorities.has(AuthorityCodes.VIEWMESSAGE)) {
      this.widgetItems.push({
        text: _('APP.NOTIFICATIONS'),
        uri: '/notifications',
        icon: 'mail-01',
        id: 'widget-home-errors',
      });
    }
    if (this.authorities.has(AuthorityCodes.GETDATALOG)) {
      this.widgetItems.push({
        text: _('APP.PROTOCOLS'),
        uri: '/protocols',
        icon: 'fachbucher-01',
        id: 'widget-home-protocols',
      });
    }
    this.widgetItems.push({
      text: _('APP.DASHBOARD'),
      uri: '/dashboard',
      icon: 'preview-01',
    });
    if (this.authorities.has(AuthorityCodes.SHOWSYSTEMCONFIG)) {
      this.widgetItems.push({
        text: _('APP.SYSTEM'),
        uri: '/system',
        icon: 'gear',
        id: 'widget-home-system',
      });
    }
    if (this.authorities.has(AuthorityCodes.SHOWALLUSERS)) {
      this.widgetItems.push({
        text: _('APP.USERS'),
        uri: '/users',
        icon: 'login-01',
        id: 'widget-home-users',
      });
    }
  }

  private getControllersInErrorState(): number {
    return this.controllersInErrorStateCount;
  }
}
