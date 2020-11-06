import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Routes } from '@angular/router';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { TranslateService } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';
import {
  AuthorityCodes, ControllerConfiguration, ControllerPointOutputDto, ControllerPointService,
  EmailConfiguration,
  EmailSecurityError, EmailSecurityErrorMapping, SystemConfigDto, SystemService,
  TimeConfiguration,
} from 'src/app/core/services';
import { DataManagerService, DateTimeService, NotificationService } from 'src/app/core/services/local-services';
import { FeedbackDialogComponent } from 'src/app/shared/components/modal-dialog/feedback-dialog/feedback-dialog.component';
import { ModalButtonData } from 'src/app/shared/components/modal-dialog/modal-dialog/modal-dialog.component';

@Component({
  selector: 'app-system-settings',
  templateUrl: './system-settings.component.html',
  styleUrls: ['./system-settings.component.scss'],
})
export class SystemSettingsComponent implements OnInit {
  @ViewChild(NgForm) formViewChild;

  buttons: ModalButtonData[];

  systemSettings: SystemConfigDto = {
    emailConfiguration: {} as EmailConfiguration,
    controllerConfiguration: {} as ControllerConfiguration,
    timeConfiguration: {} as TimeConfiguration,
    language: '',
  };

  emailSecurityErrors: EmailSecurityError[] = [];

  controllerPoints: ControllerPointOutputDto[] = null;

  oldsystemSettings: string;

  disableSafe = true;

  AuthorityCodes = AuthorityCodes;

  authorities: Set<string> = new Set();

  controllerTime: Date;

  currentTimezone: number;

  isTimeEditing = false;

  // form validation
  isReadOnly: string;

  isRequiringControllerData = false;

  isRequiringEmailData = false;

  switchedOnText = _('SYSTEM.SWITCHED_ON');

  switchedOffText = _('SYSTEM.SWITCHED_OFF');

  droppDownFields = {
    text: 'title',
    value: 'value',
  };

  selectableLanguages = [
    {
      titleKey: _('LANGUAGE.GERMAN'),
      title: undefined,
      value: 'german',
    },
  ];

  selectableTimeZones: any[] = [
    {
      value: -12,
      title: _('TIMEZONES.GMT-12'),
    },
    {
      value: -11,
      title: _('TIMEZONES.GMT-11'),
    },
    {
      value: -10,
      title: _('TIMEZONES.GMT-10'),
    },
    {
      value: -9,
      title: _('TIMEZONES.GMT-9'),
    },
    {
      value: -8,
      title: _('TIMEZONES.GMT-8'),
    },
    {
      value: -7,
      title: _('TIMEZONES.GMT-7'),
    },
    {
      value: -6,
      title: _('TIMEZONES.GMT-6'),
    },
    {
      value: -5,
      title: _('TIMEZONES.GMT-5'),
    },
    {
      value: -4,
      title: _('TIMEZONES.GMT-4'),
    },
    {
      value: -3.5,
      title: _('TIMEZONES.GMT-3_5'),
    },
    {
      value: -3,
      title: _('TIMEZONES.GMT-3'),
    },
    {
      value: -2,
      title: _('TIMEZONES.GMT-2'),
    },
    {
      value: -1,
      title: _('TIMEZONES.GMT-1'),
    },
    {
      value: 0,
      title: _('TIMEZONES.GMT'),
    },
    {
      value: 1,
      title: _('TIMEZONES.GMT+1'),
    },
    {
      value: 2,
      title: _('TIMEZONES.GMT+2'),
    },
    {
      value: 3,
      title: _('TIMEZONES.GMT+3'),
    },
    {
      value: 3.5,
      title: _('TIMEZONES.GMT+3_5'),
    },
    {
      value: 4,
      title: _('TIMEZONES.GMT+4'),
    },
    {
      value: 4.5,
      title: _('TIMEZONES.GMT+4_5'),
    },
    {
      value: 5,
      title: _('TIMEZONES.GMT+5'),
    },
    {
      value: 5.5,
      title: _('TIMEZONES.GMT+5_5'),
    },
    {
      value: 5.75,
      title: _('TIMEZONES.GMT+5_75'),
    },
    {
      value: 6,
      title: _('TIMEZONES.GMT+6'),
    },
    {
      value: 7,
      title: _('TIMEZONES.GMT+7'),
    },
    {
      value: 8,
      title: _('TIMEZONES.GMT+8'),
    },
    {
      value: 9,
      title: _('TIMEZONES.GMT+9'),
    },
    {
      value: 9.5,
      title: _('TIMEZONES.GMT+9_5'),
    },
    {
      value: 10,
      title: _('TIMEZONES.GMT+10'),
    },
    {
      value: 11,
      title: _('TIMEZONES.GMT+11'),
    },
    {
      value: 12,
      title: _('TIMEZONES.GMT+12'),
    },
  ];

  timer = null;

  constructor(
    private systemService: SystemService,
    private dataManagerService: DataManagerService,
    private controllerPointService: ControllerPointService,
    private dateTimeService: DateTimeService,
    private translateService: TranslateService,
    private notificationService: NotificationService,
    private dialog: MatDialog,
  ) {
    this.startTimer();

    this.isReadOnly = 'readonly';
  }

  private startTimer() {
    if (this.timer) {
      this.stopTimer();
    }
    this.timer = setInterval(
      () => {
        this.refreshTime();
      },
      1000,
    );
  }

  private stopTimer() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  ngOnInit() {
    this.buttons = [
      {
        name: _('SYSTEM.SAVE_CHANGES'),
        type: 'primary',
        eventName: 'save',
        id: 'btn-save',
        isDisabled: true,
      },
      {
        name: _('SYSTEM.EDIT_SETTINGS'),
        type: 'secondary',
        eventName: 'beginEdit',
        id: 'btn-edit',
        isDisabled: false,
      },
      {
        name: _('SYSTEM.CANCEL_EDIT_SETTINGS'),
        type: 'cancel',
        eventName: 'cancel',
        id: 'btn-cancel',
        isDisabled: true,
      },
    ];

    this.setDropdownStrings();
    this.translateService.onLangChange.subscribe(() => { this.setDropdownStrings(); });

    this.getSystemSettings();
    this.dataManagerService.getUserAuthorityDataManager().ready.then(
      (authorities) => {
        this.authorities = new Set(authorities['result'].authorityCodes);
      },
    ).catch(() => {
      this.notificationService.notify(_('GLOBAL.COULD_NOT_LOAD_PRIVILEGES'));
    });
  }

  public getTranslationKey(enumItem: string): string {
    return EmailSecurityErrorMapping[enumItem] || enumItem;
  }

  private getEmailSecurityWarnings() {
    // When no host is configured, doing this check does not make much sense.
    if (this.systemSettings.emailConfiguration.host) {
      this.systemService.checkSmtpConfiguration(this.systemSettings.emailConfiguration).subscribe(
        (result: EmailSecurityError[]) => {
          this.emailSecurityErrors = result;
        },
        () => {
          this.emailSecurityErrors = [];
        },
      );
    } else {
      this.emailSecurityErrors = [];
    }
  }

  /**
   * For strings in dropdowns the translation service is used instead of the translation pipe.
   * Using the translation pipe is not feasible since templates in Syncfusion dropdowns do not work
   * well. The hacky workaround suggested in https://www.syncfusion.com/feedback/12948 does not work
   * in more complex cases.
   */
  private setDropdownStrings() {
    const languageNameKeys = this.selectableLanguages.map((language) => language.titleKey);
    this.translateService.get(languageNameKeys).subscribe((languageNames) => {
      // replace this.selectableLanguages to trigger change detection
      this.selectableLanguages = this.selectableLanguages.map((selectableLanguage) => {
        selectableLanguage.title = languageNames[selectableLanguage.titleKey];
        return selectableLanguage;
      });
    });
  }

  private getControllerPoints(): Observable<ControllerPointOutputDto[]> {
    if (this.controllerPoints) {
      return of(this.controllerPoints);
    }

    return this.controllerPointService.getAllControllerPoints();
  }

  private getSystemSettings(): void {
    this.getControllerPoints().subscribe((controllerPoints: ControllerPointOutputDto[]) => {
      // TODO: Get the right controller point. Currently we simply use the first one.
      const controllerPointUuid = controllerPoints[0].uuid;
      this.systemService.getSystemConfig(controllerPointUuid).subscribe(
        (config) => {
          this.systemSettings = config;
          this.controllerTime = new Date(config.timeConfiguration.currentTime);
          this.currentTimezone = config.timeConfiguration.timezone;
          this.oldsystemSettings = JSON.stringify(this.systemSettings);
          this.getEmailSecurityWarnings();
          this.onChange();
        },
      );
    });
  }

  private saveSystemSettings(): void {
    this.getControllerPoints().subscribe((controllerPoints: ControllerPointOutputDto[]) => {
      // TODO: Get the right controller point. Currently we simply use the first one.
      const controllerPointUuid = controllerPoints[0].uuid;
      this.systemSettings.timeConfiguration.currentTime = this.dateTimeService.toISOString(this.controllerTime);
      this.systemSettings.timeConfiguration.timezone = this.currentTimezone;
      this.systemService.setSystemConfig(controllerPointUuid, this.systemSettings).subscribe(
        (ok) => {
          this.getSystemSettings();
        },
        (err) => {
          console.error(err);
          this.openFeedBackDialog(_('SYSTEM.SAVE_SYSTEM_SETINGS_FAIL_MESSAGE'));
        },
      );
    });
  }

  public isDisabled() {
    return this.isReadOnly === 'readonly';
  }

  public onChange(): void {
    // Get current form status and activate save button
    this.buttons[0].isDisabled = !this.isFormChanged() || !this.isFormVerified();
  }

  public onClickSaveButton(): void {
    this.saveSystemSettings();
    this.getEmailSecurityWarnings();
    this.buttons[0].isDisabled = true;
    this.buttons[1].isDisabled = false;
    this.buttons[2].isDisabled = true;
    this.isReadOnly = 'readonly';
  }

  private isFormChanged(): boolean {
    const hasChanged = this.isDeepObjectDifferent(this.systemSettings, this.oldsystemSettings);
    return hasChanged;
  }

  private isFormVerified(): boolean {
    return this.formViewChild.valid;
  }

  // TODO (Reger): Refactor into shared tools
  /**
   * Compares object with it's previous stringyfied JSON.
   * Comparing to a JSON dump of a previous state of the object avoids having to create a deep copy.
   */
  private isDeepObjectDifferent(object: Object, oldJson: string): boolean {
    // Removing '"' from the strings allows comparison even after a type change from inputs, e.g. number to "numberVal"
    return JSON.stringify(object).replace(/"/g, '') !== oldJson.replace(/"/g, '');
  }

  private refreshTime() {
    if (this.controllerTime !== undefined) {
      this.controllerTime = new Date(this.controllerTime.setSeconds(this.controllerTime.getSeconds() + 1));
    }
  }

  public onEnterTimeEditing(): void {
    this.isTimeEditing = true;
    this.stopTimer();
  }

  public onTakeClientTime(): void {
    this.controllerTime = new Date();
    this.systemSettings.timeConfiguration.currentTime = this.dateTimeService.toISOString(this.controllerTime);
    this.getClientTimezone();
    this.onChange();
  }

  private getClientTimezone() {
    const localTimezone = Math.floor(new Date().getTimezoneOffset() / 60);
    const timezone = this.selectableTimeZones.find((tz) => tz.value === localTimezone);
    if (!timezone) {
      let timezoneEntry;
      // check if it's a positive value
      if ((localTimezone * 60) > 0) {
        timezoneEntry = { value: localTimezone, title: `(GMT+${localTimezone}:00)` };
      }
      // else
      if ((localTimezone * 60) < 0) {
        timezoneEntry = { value: localTimezone, title: `(GMT-${localTimezone}:00)` };
      }
      this.selectableTimeZones.push(timezoneEntry);
    }
    this.currentTimezone = timezone.value;
  }

  public onCancelTimeEditing(): void {
    this.isTimeEditing = false;
    this.startTimer();
  }

  private openFeedBackDialog<R = any>(feedBackMessage: string): MatDialogRef<FeedbackDialogComponent, R> {
    return this.dialog.open(
      FeedbackDialogComponent,
      {
        data: {
          message: feedBackMessage,
        },
      },
    );
  }

  public onHandleClick(eventName: string): void {
    switch (eventName) {
      case 'beginEdit':
        this.isReadOnly = undefined;
        this.buttons[1].isDisabled = true;
        this.buttons[2].isDisabled = false;
        break;
      case 'cancel':
        this.systemSettings = JSON.parse(this.oldsystemSettings);
        this.isTimeEditing = false;
        this.isReadOnly = 'readonly';
        this.buttons[0].isDisabled = true;
        this.buttons[1].isDisabled = false;
        this.buttons[2].isDisabled = true;
        break;
      default:
        break;
    }
  }

  public handleSectionDataChange(section: string) {
    let dataFields = [];

    switch (section) {
      case 'controller':
        dataFields = ['alternativeDnsServer', 'dnsServer', 'hostName', 'domainName'];
        this.isRequiringControllerData = dataFields.some((field) => !!this.systemSettings.controllerConfiguration[field]);
        break;

      case 'email':
        dataFields = ['password', 'from', 'host', 'port', 'username'];
        this.isRequiringEmailData = dataFields.some((field) => !!this.systemSettings.emailConfiguration[field]);
        break;

      default:
        break;
    }
  }
}

/**
 * On mobile devices there are no tabs. Only the content of the settings tab is available.
 */
export const ROUTES: Routes = [
  {
    path: '',
    component: SystemSettingsComponent,
  },
  {
    path: 'settings',
    component: SystemSettingsComponent,
  },
  {
    path: '**',
    component: SystemSettingsComponent,
    redirectTo: '',
  },
];
