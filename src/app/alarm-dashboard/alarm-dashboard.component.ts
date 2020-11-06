import { Component, OnInit, Inject } from '@angular/core';
import { SafeStyle, SafeUrl } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { SystemService } from '../core/services/api/system.service';
import { DashboardHelper } from './helper';
import { DashboardConfigItem, Device } from './dashboard/dashboard-overview/dashboard-overview.component';
import { AuthenticationService, NotificationService } from '../core/services/local-services';

interface FileHandle {
  file: File;
  url: SafeUrl;
}

@Component({
  selector: 'app-alarm-dashboard',
  templateUrl: './alarm-dashboard.component.html',
  styleUrls: ['./alarm-dashboard.component.scss'],
})
export class AlarmDashboardComponent implements OnInit {
  editText = 'edit';

  name = 'Angular 5';

  isEditing = false;

  backgroundImage: SafeStyle;

  files: FileHandle[] = [];

  public backgroundUrl = '';

  selectedDashboard: string;

  selectedDashboardConfig: DashboardConfigItem;

  public dashboardModel: Device[] = [];

  // TODO (Reger): Refactor these kind of keys into
  // ApplicationKey is the database key within user configs. Do not change!
  dashboardApplicationKey = 'dashboards';

  currentUserName: string;

  constructor(
    @Inject('AuthService') private authService: AuthenticationService,
    private systemService: SystemService,
    private notificationService: NotificationService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit() {
    this.currentUserName = this.authService.getUserName();
    // Get target dashboard's name from routing state:
    this.selectedDashboard = this.route.snapshot.paramMap.get('dashboardName');
    this.getDashboardConfig(this.selectedDashboard);
    // this.dashboardItems = this.dashboardService.getDashboarItem();
  }

  getImageUrl() {
    return DashboardHelper.normalizeUrl(this.selectedDashboardConfig.imageUrl);
  }

  private getDashboardConfig(dashboardName: string): void {
    // Get current cofig first and only safe if successful
    this.systemService.getSystemPreference(this.dashboardApplicationKey).subscribe(
      (config) => {
        const allDashboards = DashboardHelper.dashboardConfigFromString(config);

        const dashboards: DashboardConfigItem[] = allDashboards.dashboards.filter((board) => board.name === dashboardName);

        this.selectedDashboardConfig = dashboards[0];
        this.selectedDashboardConfig.imageUrl = DashboardHelper.normalizeUrl(this.selectedDashboardConfig.imageUrl);
        this.selectedDashboardConfig.devices = this.selectedDashboardConfig.devices || [];

        this.dashboardModel = this.selectedDashboardConfig.devices;
      },
      (error) => {
        this.notificationService.notify(_('DASHBOARD.COULD_NOT_INITIALIZE_DASHBOARDS'));
        console.error(error);
      },
    );
  }

  public saveConfig(evtData): void {
    this.saveNewBackgroundImage(evtData);
  }

  private saveNewBackgroundImage(evtData): void {
    // Get current cofig first and only safe if successful
    this.systemService.getSystemPreference(this.dashboardApplicationKey).subscribe(
      (config) => {
        const allDashboards = DashboardHelper.dashboardConfigFromString(config);
        allDashboards.dashboards = allDashboards.dashboards.map((board) => {
          if (board.name === this.selectedDashboard) {
            board.imageUrl = evtData.imageUrl ? DashboardHelper.normalizeUrl(evtData.imageUrl) : board.imageUrl;
            board.devices = evtData.devices;
          }
          return board;
        });
        const stringifiedConfig = DashboardHelper.dashboardConfigToEscapedString(allDashboards);

        this.systemService.setSystemPreference(this.dashboardApplicationKey, stringifiedConfig).subscribe(
          // eslint-disable-next-line @typescript-eslint/no-empty-function
          (ok) => { /* do noting */ },
          (error) => {
            this.notificationService.notify(_('DASHBOARD.COULD_NOT_SAVE_BACKGROUND'));
            console.error(error);
          },
        );
      },
      (error) => {
        this.notificationService.notify(_('DASHBOARD.COULD_NOT_SAVE_BACKGROUND'));
        console.error(error);
      },
    );
  }
}
