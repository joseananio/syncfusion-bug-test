import { SystemService } from 'src/app/core/services';
import {
  Component, OnInit, Inject, Output, EventEmitter, ViewChild,
} from '@angular/core';
import { FeedbackDialogComponent } from 'src/app/shared/components/modal-dialog/feedback-dialog/feedback-dialog.component';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { NgForm } from '@angular/forms';
import { ModalButtonData } from 'src/app/shared/components/modal-dialog/modal-dialog/modal-dialog.component';
import { AuthenticationService, NotificationService } from 'src/app/core/services/local-services';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { DashboardConfig, DashboardConfigItem } from '../dashboard-overview.component';
import { DashboardHelper } from '../../../helper';

@Component({
  selector: 'app-dashboard-add-component',
  templateUrl: './dashboard-add-component.component.html',
  styleUrls: ['./dashboard-add-component.component.scss'],
})
export class DashboardAddComponentComponent implements OnInit {
  // TODO (Reger): Refactor these kind of keys into
  // ApplicationKey is the database key within user configs. Do not change!
  dashboardApplicationKey = 'dashboards';

  dashboards = {} as DashboardConfig;

  newDashboard = {} as DashboardConfigItem;

  newDashboardName = '';

  currentUserName: string;

  buttons: ModalButtonData[] = [
    {
      name: _('GLOBAL.CANCEL_BUTTON_TEXT'), type: 'cancel', eventName: 'close', id: 'btn-item-details-modal-cancel',
    },
    {
      name: _('GLOBAL.CREATE_BUTTON_TEXT'), type: 'primary', eventName: 'save', id: 'btn-item-details-modal-save', isDisabled: true,
    },
  ];
  // pattern="[^\x22 ]*+$"

  @ViewChild(NgForm) formViewChild;

  @Output()
  public closeEvent = new EventEmitter<string>();

  duplicateNameError: boolean;

  constructor(
    public dialogRef: MatDialogRef<DashboardAddComponentComponent>,
    private dialog: MatDialog,
    @Inject('AuthService') private authService: AuthenticationService,
    private systemService: SystemService,
    private notificationService: NotificationService,
  ) {}

  ngOnInit() {
    this.currentUserName = this.authService.getUserName();
  }

  public onButtonEvent(eventName: string): void {
    switch (eventName) {
      case 'save': {
        this.saveNewDashboard();
        break;
      }
      case 'close': {
        this.closeDialog();
        break;
      }
      default: {
        console.error('ERROR: DashboardAddComponent: onButtonEvent triggered with unhandled event name');
      }
    }
  }

  private saveNewDashboard(): void {
    this.duplicateNameError = false;
    // Get current cofig first and only safe if successful
    this.systemService.getSystemPreference(this.dashboardApplicationKey).subscribe(
      (config) => {
        Object.assign(this.dashboards, DashboardHelper.dashboardConfigFromString(config));
        this.submitnewDashboards();
      },
      (err) => {
        if (err.status === 404) {
          // Backend throws 404 only and only if preference is empty. Hence directly submit the new one.
          this.submitInitialDashboard();
        } else {
          this.notificationService.notify(_('DASHBOARD.COULD_NOT_SAVE_DASHBOARD'));
          console.error(err);
        }
      },
    );
  }

  private submitInitialDashboard(): void {
    this.newDashboard.imageUrl = 'assets/img/dashboard-empty.png';
    const newDashboardConfig: DashboardConfig = {
      dashboards: [this.newDashboard],
    };

    // TODO (Reger): Remove escaping once backend accepts unescaped json-strings
    let stringifiedNewDashboardConfig = JSON.stringify(newDashboardConfig).replace(/"/g, '\\"');
    // Backend needs further wrapping quotemarks
    stringifiedNewDashboardConfig = `"${stringifiedNewDashboardConfig}"`;
    this.systemService.setSystemPreference(this.dashboardApplicationKey, stringifiedNewDashboardConfig).subscribe(
      (ok) => {
        this.closeEvent.emit('success');
        this.closeDialog();
      },
      (err) => {
        // TODO(schuster): Investigate consequences of this initialization failing
        console.error(err);
      },
    );
  }

  private submitnewDashboards(): void {
    this.newDashboard.imageUrl = 'assets/img/dashboard-empty.png';
    const newDashboardConfig: DashboardConfig = {
      dashboards: this.dashboards.dashboards.concat(this.newDashboard),
    };

    // prevent duplicate names
    if (this.dashboards.dashboards.find((dashboardItem) => dashboardItem.name === this.newDashboard.name)) {
      this.duplicateNameError = true;
      return;
    }

    // TODO (Reger): Remove escaping once backend accepts unescaped json-strings
    let stringifiedNewDashboardConfig = JSON.stringify(newDashboardConfig).replace(/"/g, '\\"');
    // Backend needs further wrapping quotemarks
    stringifiedNewDashboardConfig = `"${stringifiedNewDashboardConfig}"`;
    this.systemService.setSystemPreference(this.dashboardApplicationKey, stringifiedNewDashboardConfig).subscribe(
      (ok) => {
        this.closeEvent.emit('success');
        this.closeDialog();
      },
      (err) => {
        this.notificationService.notify(_('DASHBOARD.COULD_NOT_SAVE_DASHBOARDS'));
        console.error(err);
      },
    );
  }

  public onChange(): void {
    this.newDashboard.name = this.newDashboardName;
    this.newDashboard.devices = [];
    this.buttons[1].isDisabled = !this.isFormVerified();
  }

  private isFormVerified(): boolean {
    return this.formViewChild.valid;
  }

  private openFeedbackDialog(feedbackMessage: string): void {
    this.dialog.open(FeedbackDialogComponent, {
      data: {
        message: feedbackMessage,
      },
    });
  }

  private closeDialog(): void {
    this.dialogRef.close();
  }
}
