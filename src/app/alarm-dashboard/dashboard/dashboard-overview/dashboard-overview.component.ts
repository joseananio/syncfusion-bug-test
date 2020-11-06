import { SystemService } from 'src/app/core/services/api/system.service';
import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';
import { AuthenticationService, NotificationService } from 'src/app/core/services/local-services';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { DashboardAddComponentComponent } from './dashboard-add-component/dashboard-add-component.component';
import { DashboardHelper } from '../../helper';

export interface Position {
  x: number;
  y: number;
}

export interface Device {
  uuid: string;
  name: string;
  position: Position;
  isExpanded: boolean;
}

export interface DashboardConfigItem {
  name: string;
  imageUrl: string;
  devices: Device[];
}

export interface DashboardConfig {
  dashboards: DashboardConfigItem[];
}

@Component({
  selector: 'app-dashboard-overview',
  templateUrl: './dashboard-overview.component.html',
  styleUrls: ['./dashboard-overview.component.scss'],
})
export class DashboardOverviewComponent implements OnInit {
  currentUserName: string;

  dashboards = {} as DashboardConfig;

  // TODO (Reger): Refactor these kind of keys into
  // ApplicationKey is the database key within user configs. Do not change!
  dashboardApplicationKey = 'dashboards';

  constructor(
    @Inject('AuthService') private authService: AuthenticationService,
    private systemService: SystemService,
    private notificationService: NotificationService,
    private dialog: MatDialog,
  ) {}

  ngOnInit() {
    this.currentUserName = this.authService.getUserName();
    // this.initializeDataBaseWithMocks();

    // This also triggers updateDasbhoards once in the beginning:
    this.updateDashboards(true);  // allow failure - key might not exist yet
  }

  private afterDialogClosed<T, R = any>(dialog: MatDialogRef<T, R>, forceUpdate?: boolean): MatDialogRef<T, R> {
    dialog.afterClosed().subscribe((data) => {
      // if is updated:
      // if (data) {
      if (forceUpdate) {
        this.updateDashboards();
      }
    });
    return dialog;
  }

  private updateDashboards(allowFailure = false): void {
    this.systemService.getSystemPreference(this.dashboardApplicationKey).subscribe(
      (config) => {
        this.dashboards = Object.assign(this.dashboards, DashboardHelper.dashboardConfigFromString(config));
      },
      (error) => {
        if (!allowFailure) {
          this.notificationService.notify(_('DASHBOARD.COULD_NOT_GET_DASHBOARDS'));
          console.error(error);
        }
      },
    );
  }

  public onDashboardAdd(): void {
    this.afterDialogClosed(this.dialog.open(DashboardAddComponentComponent), true);
  }

  public onDashboardDelete(itemIndex: number): void {
    // Get current cofig first and only safe if successful
    this.systemService.getSystemPreference(this.dashboardApplicationKey).subscribe(
      (config) => {
        Object.assign(this.dashboards, DashboardHelper.dashboardConfigFromString(config));
        // Delete dashboard
        const alteredDashboards: DashboardConfig = {
          dashboards: this.dashboards.dashboards.filter((board, index) => index !== itemIndex),
        };
        this.submitDashboards(alteredDashboards);
      },
      (error) => {
        this.notificationService.notify(_('DASHBOARD.COULD_NOT_DELETE_DASHBOARD'));
        console.error(error);
      },
    );
  }

  private submitDashboards(alteredDashboards: DashboardConfig): void {
    // TODO (Reger): Remove escaping once backend accepts unescaped json-strings
    let stringifiedNewDashboardConfig = JSON.stringify(alteredDashboards).replace(/"/g, '\\"');
    // Backend needs further wrapping quotemarks
    stringifiedNewDashboardConfig = `"${stringifiedNewDashboardConfig}"`;
    this.systemService.setSystemPreference(this.dashboardApplicationKey, stringifiedNewDashboardConfig).subscribe(
      (ok) => {
        this.updateDashboards();
      },
      (error) => {
        this.notificationService.notify(_('DASHBOARD.COULD_NOT_SAVE_DASHBOARD'));
        console.error(error);
      },
    );
  }
}
