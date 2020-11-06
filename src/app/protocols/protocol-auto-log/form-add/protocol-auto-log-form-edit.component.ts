import {
  AfterViewInit, Component, Inject, Input, OnInit,
} from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { TranslateService } from '@ngx-translate/core';
import {
  AuthorityCodes,
  EventTypes, ItemReportsServiceService,
  ReportDataQueryParameters, ReportServiceInput,
  ReportServiceParametersDto, SftpOptionsInput,
  SftpSecurityError, SftpSecurityErrorMapping,
} from 'src/app/core/services';
import { AuthenticationService, DateTimeService, NotificationService } from 'src/app/core/services/local-services';
import { FilterTemplate } from 'src/app/shared/components/filter-template/filter-template/filter-template.component';
import { FeedbackDialogComponent } from 'src/app/shared/components/modal-dialog/feedback-dialog/feedback-dialog.component';
import { ModalButtonData } from 'src/app/shared/components/modal-dialog/modal-dialog/modal-dialog.component';
import { SystemService } from '../../../core/services/api/system.service';

const allDataItem: FilterTemplate = {
  name: undefined,
  section: undefined,
  filters: undefined,
};
interface InputDialogData {
  serviceId: number;
  mode: string;
}

interface TriggerMessageField {
  value: EventTypes;
  text: string;
}

@Component({
  selector: 'app-protocol-auto-log-form-edit',
  templateUrl: './protocol-auto-log-form-edit.component.html',
  styleUrls: ['./protocol-auto-log-form-edit.component.scss'],
})
export class ProtocolsAutoLogFormEditComponent implements OnInit, AfterViewInit {
  fields = {
    value: 'value',
    text: 'text',
  };

  filterFields = {
    value: 'name',
    text: 'name',
  };

  triggerTypes = [{
    value: 'MANUAL',
    text: _('PROTOCOLS.MANUAL_EXECUTION'),
  }, {
    value: 'EVENT',
    text: _('PROTOCOLS.ON_EVENT'),
  }, {
    value: 'DATA',
    text: _('PROTOCOLS.NUMBER_OF_EVENTS'),
  }, {
    value: 'CRON:daily',
    text: _('PROTOCOLS.DAILY'),
  }, {
    value: 'CRON:weekly',
    text: _('PROTOCOLS.WEEKLY'),
  }, {
    value: 'CRON:monthly',
    text: _('PROTOCOLS.MONTHLY'),
  }, {
    value: 'CRON:yearly',
    text: _('PROTOCOLS.YEARLY'),
  }];

  eventTypes: TriggerMessageField[] = Object.keys(EventTypes).map(
    (enumItem) => ({
      value: EventTypes[enumItem],
      // Todo (Reger): i18n for following enum itesm:
      text: EventTypes[enumItem],
    }
    ),
  );

  weekdayTypes = [{
    value: 1,
    text: _('PROTOCOLS.MONDAY'),
  }, {
    value: 2,
    text: _('PROTOCOLS.TUESDAY'),
  }, {
    value: 3,
    text: _('PROTOCOLS.WEDNESDAY'),
  }, {
    value: 4,
    text: _('PROTOCOLS.THURSDAY'),
  }, {
    value: 5,
    text: _('PROTOCOLS.FRIDAY'),
  }, {
    value: 6,
    text: _('PROTOCOLS.SATURDAY'),
  }, {
    value: 0,
    text: _('PROTOCOLS.SUNDAY'),
  }];

  monthTypes = [{
    value: 1,
    text: _('PROTOCOLS.JANUARY'),
  }, {
    value: 2,
    text: _('PROTOCOLS.FEBRUARY'),
  }, {
    value: 3,
    text: _('PROTOCOLS.MARCH'),
  }, {
    value: 4,
    text: _('PROTOCOLS.APRIL'),
  }, {
    value: 5,
    text: _('PROTOCOLS.MAY'),
  }, {
    value: 6,
    text: _('PROTOCOLS.JUNE'),
  }, {
    value: 7,
    text: _('PROTOCOLS.JULY'),
  }, {
    value: 8,
    text: _('PROTOCOLS.AUGUST'),
  }, {
    value: 9,
    text: _('PROTOCOLS.SEPTEMBER'),
  }, {
    value: 10,
    text: _('PROTOCOLS.OCTOBER'),
  }, {
    value: 11,
    text: _('PROTOCOLS.NOVEMBER'),
  }, {
    value: 12,
    text: _('PROTOCOLS.DECEMBER'),
  }];

  monthdayTypes = [];

  actionTypes = [{
    value: 'EMAIL',
    text: _('PROTOCOLS.EMAIL'),
  }, {
    value: 'SFTP',
    text: _('PROTOCOLS.FTP'),
  }, {
    value: 'USBLOCAL',
    text: _('PROTOCOLS.USB_DRIVE'),
  }];

  modalButtons: ModalButtonData[] = [
    {
      name: this.data.mode === 'edit' ? _('GLOBAL.SAVE_BUTTON_TEXT') : _('GLOBAL.CREATE_BUTTON_TEXT'),
      type: 'primary',
      eventName: 'save',
      id: 'btn-modal-save',
      isDisabled: true,
    },
    {
      name: _('GLOBAL.CANCEL_BUTTON_TEXT'),
      type: 'cancel',
      eventName: 'cancel',
      id: 'btn-modal-cancel',
      isDisabled: false,
    },
  ];

  public stateLoading = false;

  currentUserName: string;

  // (Dennis) No camel cases because expected to be more robust in backend
  filterTemplateApplicationKey = 'filtertemplates';

  templateList: FilterTemplate[] = [];

  allowFilterSelect = true;

  public selectedTriggerType = 'CRON:daily';

  public triggerMessageTypes: EventTypes[] = [
    EventTypes.ALARM,
  ];

  public weekday = 1;

  public month = 1;

  public monthday = 1;

  public selectedActionType = 'EMAIL';

  selectedFunction: string;

  AuthorityCodes = AuthorityCodes;

  name = '';

  oldName = null;

  filename = 'Report';

  host = '';

  port = 23;

  d = new Date();

  time = new Date(this.d.getFullYear(), this.d.getMonth(), this.d.getDay(), 12, 0);

  ftppath = '';

  user = '';

  password = '';

  ftpFingerprint = '';

  email = '';

  filter = '';

  triggerDataIntervalCount = 1000;

  ftpWarnings: SftpSecurityError[];

  constructor(
    private dialog: MatDialog,
    private dialogRef: MatDialogRef<ProtocolsAutoLogFormEditComponent>,
    private itemReportsServiceService: ItemReportsServiceService,
    private dateTimeService: DateTimeService,
    private systemService: SystemService,
    private translateService: TranslateService,
    private notificationService: NotificationService,
    @Inject('AuthService') private authService: AuthenticationService,
    @Inject(MAT_DIALOG_DATA) public data: InputDialogData,
  ) {}

  functionNames: string[] = [];

  @Input()
  authorities: Set<string> = new Set();

  ngAfterViewInit() {
    // Get user name
    this.currentUserName = this.authService.getUserName();
    this.getStoredFilterTemplates();
  }

  ngOnInit() {
    // Since dropdonws with templates are buggy, we set the visible strings using TranslateService.
    this.setDropdownStrings('triggerTypes');
    this.setDropdownStrings('actionTypes');
    this.setDropdownStrings('monthTypes');
    this.setDropdownStrings('weekdayTypes');
    this.translateService.get('PROTOCOLS.NO_FILTER').subscribe(
      (text: string) => { allDataItem.name = text; },
    );

    for (let d = 1; d <= 31; d += 1) {
      this.monthdayTypes.push({
        value: d,
        text: `${d}.`,
      });
    }

    if (this.data.mode === 'edit') {
      this.allowFilterSelect = false;
      // edit is not implemented in the backend!
      this.itemReportsServiceService.getService(this.data.serviceId).subscribe(
        (data: ReportServiceParametersDto) => {
          this.name = data.serviceName;
          this.oldName = this.name;
          this.filename = data.fileNameWithoutExtension;
          this.selectedTriggerType = data.trigger;
          if (data.trigger === 'EVENT') {
            this.triggerMessageTypes = data.triggerMessageTypes; // Str ???
          } else if (data.trigger === 'DATA') {
            this.triggerDataIntervalCount = data.triggerDataIntervalCount;
          } else if (data.trigger === 'CRON') {
            const subTrigger = this.dateTimeService.parseCronJobTimeStr(data.cronJobTimeStr);
            this.selectedTriggerType += `:${subTrigger}`;
            const cron = data.cronJobTimeStr.split(' ');
            // m h dom mon dow
            if (cron[3] !== '*') {
              this.month = +cron[3];
            }
            if (cron[2] !== '*') {
              this.monthday = +cron[2];
            }
            if (cron[1] !== '*') {
              this.time = new Date(this.d.getFullYear(), this.d.getMonth(), this.d.getDay(), +cron[1], +cron[0]);
            }
            if (cron[4] !== '*') {
              this.weekday = +cron[4];
            }
          }
          this.selectedActionType = data.action;
          if (data.action === 'EMAIL') {
            this.email = data.emailAddress;
          }
          if (data.action === 'SFTP' && data.sftpOptionsInput) {
            this.host = data.sftpOptionsInput.host;
            this.port = data.sftpOptionsInput.port;
            this.user = data.sftpOptionsInput.username;
            this.password = data.sftpOptionsInput.password;
            this.ftppath = data.sftpOptionsInput.destinationPath;
          }
        },
      );
    }

    this.modalButtons[0].isDisabled = false;
  }

  public onFocusLost(event): void {
    this.checkFtpSetting();
  }

  private checkFtpSetting(): void {
    const ftpConfig = {
      host: this.host,
      port: this.port,
      username: this.currentUserName,
      password: this.password,
      destinationPath: this.ftppath,
    };
    this.systemService.checkSftpConfiguration(ftpConfig).subscribe(
      (x) => {
        this.ftpWarnings = x || [];
      },
      (error) => {
        // fail silently
        this.ftpWarnings = [];
        console.error(error);
      },
    );
  }

  private setDropdownStrings(listName: string): void {
    const keys = this[listName].map((item) => item.text);
    this.translateService.get(keys).subscribe((names) => {
      // replace object to trigger change detection
      this[listName] = this[listName].map((item) => {
        item.text = names[item.text];
        return item;
      });
    });
  }

  private onClickCreateReportingService(): void {
    const configTrigger = this.selectedTriggerType.replace(/:.*$/, '');

    let reportDataQueryParameters: ReportDataQueryParameters = {
      limit: 1000000, // TODO: Taken from confluence documentation. Better value?
    };

    const selectedFilter = this.templateList.find((x) => x.name === this.filter);

    if (selectedFilter) {
      if (selectedFilter.filters) {
        reportDataQueryParameters = this.setFilterToQueryParams(reportDataQueryParameters, selectedFilter);
      } else {  // no filter selected
        reportDataQueryParameters = this.resetFilterInQueryParams(reportDataQueryParameters);
      }
    }
    const config: ReportServiceInput = {
      serviceName: this.name,
      fileNameWithoutExtension: this.filename,

      // possible options: write usbfile, upload file to sftp-server, send email
      action: this.selectedActionType.toUpperCase(), // EMAIL || SFTP || USBLOCAL

      trigger: configTrigger.toUpperCase(), // EVENT || CRON || MANUAL || DATA

      dataQueryParameters: reportDataQueryParameters,
    };
    //
    if (this.selectedActionType === 'EMAIL') {
      // if Action=email, send the service output to this email address
      config.emailAddress = this.email;
    }
    if (this.selectedActionType === 'SFTP') {
      const sftpOptionsInput: SftpOptionsInput = {
        host: this.host,
        port: this.port,
        username: this.user,
        password: this.password,
        destinationPath: this.ftppath,
        fingerprint: this.ftpFingerprint,
      };
      config.sftpOptionsInput = sftpOptionsInput;
    }
    if (this.selectedActionType === 'USBLOCAL') {
      // nothing
    }
    if (this.selectedTriggerType === 'EVENT') {
      config.triggerMessageTypes = this.triggerMessageTypes;
    } else if (this.selectedTriggerType === 'DATA') {
      config.triggerDataIntervalCount = this.triggerDataIntervalCount;
    } else if (this.selectedTriggerType === 'MANUAL') {
      // nothing
    } else {
      if (this.time === null) {
        return;
      }
      // m h  dom mon dow
      if (this.selectedTriggerType === 'CRON:daily') {
        config.cronJobTimeStr = `${this.time.getMinutes()} ${this.time.getHours()} * * *`;
      } else if (this.selectedTriggerType === 'CRON:weekly') {
        config.cronJobTimeStr = `${this.time.getMinutes()} ${this.time.getHours()} * * ${this.weekday}`;
      } else if (this.selectedTriggerType === 'CRON:monthly') {
        config.cronJobTimeStr = `${this.time.getMinutes()} ${this.time.getHours()} ${this.monthday} * *`;
      } else if (this.selectedTriggerType === 'CRON:yearly') {
        config.cronJobTimeStr = `${this.time.getMinutes()} ${this.time.getHours()} ${this.monthday} ${this.month} *`;
      }
    }

    this.itemReportsServiceService.createService(config).subscribe(
      () => {
        // Moritz sagt: Ändern über Löschen und Neuanlegen.
        if (this.data.mode === 'edit') {
          this.itemReportsServiceService.deleteService(this.data.serviceId).subscribe(
            (ok) => {
              this.dialogRef.close();
            },
            (err) => {
              this.notificationService.notify(_('PROTOCOLS.COULD_NOT_EDIT_SERVICE'));
              console.error(err);
              // TODO: Bug
              this.dialogRef.close();
            },
          );
        } else {
          this.dialogRef.close();
        }
      },
      (err) => {
        const message = this.data.mode === 'edit' ? _('PROTOCOLS.COULD_NOT_EDIT_SERVICE') : _('PROTOCOLS.COULD_NOT_CREATE_SERVICE');
        this.notificationService.notify(message);
        console.error(err);
        if (err.error.errorType === 'INVALID_MODEL_STATE') {
          const dlg = this.dialog.open(FeedbackDialogComponent, {
            data: {
              message: _('PROTOCOLS.INVALID_MODEL_STATE'),
              params: { fields: Object.keys(err.error.error).join('", "') },
              // TRIGGER_MESSAGE_TYPES_STR_MUST_BE_SET
            },
          });
          return dlg.afterClosed();
        }

        return undefined;
      },
    );
  }

  private setFilterToQueryParams(reportDataQueryParameters: ReportDataQueryParameters, selectedFilter: FilterTemplate) {
    const _reportDataQueryParameters = {
      ...reportDataQueryParameters,
      dateUtcMin: selectedFilter.filters.dateStartFilter,
      dateUtcMax: selectedFilter.filters.dateEndFilter,
      deviceTypeName: selectedFilter.filters.deviceTypeFilter,
    };
    return _reportDataQueryParameters;
  }

  private resetFilterInQueryParams(reportDataQueryParameters: ReportDataQueryParameters): ReportDataQueryParameters {
    return {
      ...reportDataQueryParameters,
      dateUtcMin: undefined,
      dateUtcMax: undefined,
      deviceTypeName: undefined,
    };
  }

  public onChangeFilterToggle(event): void {
    this.allowFilterSelect = event && !event.newState;
  }

  private serviceNameToFileName(serviceName: string): string {
    return serviceName
      .replace(/ /g, '_')
      .replace(/ä/g, 'ae')
      .replace(/ö/g, 'oe')
      .replace(/ü/g, 'ue')
      .replace(/Ä/g, 'AE')
      .replace(/Ö/g, 'OE')
      .replace(/Ü/g, 'UE')
      .replace(/ß/g, 'ss')
      .replace(/[^A-Za-z0-9_-]+/g, '');
  }

  /**
   * Change filename if servicename changed, only if filename was not altered by the user.
   */
  public onNameChange(event): void {
    const newFilename = this.serviceNameToFileName(this.name);
    // not entered before:
    if (this.oldName === null) {
      if (this.filename === '') {
        this.filename = newFilename;
      }
    // filename field is empty
    } else if (this.filename === '') {
      this.filename = newFilename;
    // filename has the old value of servicename
    } else if (this.serviceNameToFileName(this.oldName) === this.filename) {
      this.filename = newFilename;
    }

    this.oldName = this.name;
  }

  public onButtonEvent(eventName: string): void {
    switch (eventName) {
      case 'cancel': {
        this.dialogRef.close();
        break;
      }
      case 'save': {
        this.onClickCreateReportingService();
        break;
      }
      default: {
        console.error('ERROR: Add reporting service component: onButtonEvent triggered with unhandled event name');
      }
    }
  }

  public getI18nKey(value: SftpSecurityError): string {
    return SftpSecurityErrorMapping[value] || value;
  }

  private getStoredFilterTemplates(): void {
    this.systemService.getSystemPreference(this.filterTemplateApplicationKey).subscribe(
      (preference) => {
        this.templateList = (JSON.parse(preference));
        // Sanitize misconfigured Json, hence keeping the parameterConfig clean
        // TODO (Reger): Refactor 'measurement' with parameter from protocols-measurement-data
        // TODO (Reger): Refactor all production lifecycle params globally
        this.templateList = this.templateList.filter(
          (templateItem) => templateItem.name !== undefined && templateItem.name !== ''
          && templateItem.section.toLocaleLowerCase() === 'measurement',
        );
        this.templateList.unshift(allDataItem);
      },
      (error) => {
        this.templateList = [];
        // Assuming preference not existing yet, adding empty preference.
        // 200 is a bit surprising, but this is what the server returns in this case.
        if (error.status === 200) {
          // this.initializePreferenceDB();
        }
      },
    );
  }
}
