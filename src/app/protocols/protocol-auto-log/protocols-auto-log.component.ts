import { Component, Input, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import {
  AuthorityCodes, ItemReportsServiceService,
  ReportServiceParametersDto,
} from 'src/app/core/services';
import { DateTimeService, NotificationService } from 'src/app/core/services/local-services';
import { QuestionDialogComponent } from 'src/app/shared/components/modal-dialog/question-dialog/question-dialog.component';
import { ColumnData } from 'src/app/shared/lib/viega-common/lib/datagrid/datagrid/datagrid.component';
import { ProtocolsAutoLogFormEditComponent } from './form-add/protocol-auto-log-form-edit.component';

@Component({
  selector: 'app-protocols-auto-log',
  templateUrl: './protocols-auto-log.component.html',
  styleUrls: ['./protocols-auto-log.component.scss'],
})
export class ProtocolsAutoLogComponent implements OnInit {
  serviceColumns: ColumnData[] = [
    {
      field: 'serviceName',
      headerText: _('PROTOCOLS.NAME'),
      textAlign: 'left',
    },
    {
      field: 'fileNameWithoutExtension',
      headerText: _('PROTOCOLS.FILE_NAME'),
      textAlign: 'left',
    },
    /*
    {
      field: 'trigger',
      headerText: _('PROTOCOLS.PERIOD'),
      textAlign: 'Left',
    },
    {
      field: 'action',
      headerText: _('GLOBAL.ACTION'),
      textAlign: 'Left',
    },
    {
      field: 'format',
      headerText: 'Format',
      textAlign: 'Left',
    },
    */
  ];

  actionMap = {
    EMAIL: _('USERS.EMAIL'),
    SFTP: _('PROTOCOLS.SFTP'),
    USBLOCAL: _('PROTOCOLS.USB_DRIVE'),
  };

  triggerMapLang = {
    EVENT: _('PROTOCOLS.ON_EVENT'),
    'CRON:yearly': _('PROTOCOLS.YEARLY'),
    'CRON:monthly': _('PROTOCOLS.MONTHLY'),
    'CRON:weekly': _('PROTOCOLS.WEEKLY'),
    'CRON:daily': _('PROTOCOLS.DAILY'),
    MANUAL: _('PROTOCOLS.MANUAL_EXECUTION'),
    DATA: _('PROTOCOLS.NUMBER_OF_EVENTS'),
  };

  services: ReportServiceParametersDto[] = [];

  public stateLoading = true;

  constructor(
    private dialog: MatDialog,
    private itemReportsServiceService: ItemReportsServiceService,
    private dateTimeService: DateTimeService,
    private notificationService: NotificationService,
  ) {}

  @Input()
  authorities: Set<string> = new Set();

  AuthorityCodes = AuthorityCodes;

  ngOnInit() {
    this.updateTable();
    console.log(this.services);
  }

  private updateTable(): void {
    this.stateLoading = true;
    this.itemReportsServiceService.getServices().subscribe(
      (services: ReportServiceParametersDto[]) => {
        this.services = services.map((service) => ({
          serviceId: service.serviceId,
          serviceName: service.serviceName,
          fileNameWithoutExtension: service.fileNameWithoutExtension,
          action: this.actionMap[service.action],
          trigger: this.triggerMap(service.trigger, service.cronJobTimeStr),
        }));
        this.stateLoading = false;
      },
      (err) => {
        this.services = [];
        this.stateLoading = false;
        this.notificationService.notify(_('PROTOCOLS.COULD_NOT_GET_SERVICES'));
        console.error(err);
      },
    );
  }

  private afterDialogClosed<T, R = any>(dialog: MatDialogRef<T, R>, forceUpdate?: boolean): MatDialogRef<T, R> {
    dialog.afterClosed().subscribe((data) => {
      // if is updated:
      // if (data) {
      if (forceUpdate) {
        this.updateTable();
      }
    });
    return dialog;
  }

  public onAddReporting() {
    return this.afterDialogClosed(
      this.dialog.open(ProtocolsAutoLogFormEditComponent, {
        data: {
          mode: 'add',
        },
        width: '70%',
      }),
      true,
    );
  }

  public onEditReporting(serviceId: number) {
    return this.afterDialogClosed(
      this.dialog.open(ProtocolsAutoLogFormEditComponent, {
        data: {
          serviceId,
          mode: 'edit',
        },
        width: '70%',
      }),
      true,
    );
  }

  public onExecuteReporting(serviceId: number): void {
    const { serviceName } = this.services.find((service) => service.serviceId === serviceId);

    this.dialog.open(QuestionDialogComponent, {
      data: { message: _('PROTOCOLS.RUN_REPORT_ALEART'), params: { serviceName } },
      width: '30%',
    }).afterClosed().subscribe(
      (res) => {
        if (res) {
          this.itemReportsServiceService.executeService(serviceId).subscribe(
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            (ok) => { /* do noting */ },
            (err) => {
              this.notificationService.notify(_('PROTOCOLS.COULD_NOT_RUN_REPORT_SERVICES'));
              console.error(err);
            },
          );
        }
      },
    );
  }

  public onDeleteReporting(serviceId: number): void {
    const { serviceName } = this.services.find((service) => service.serviceId === serviceId);

    this.dialog.open(QuestionDialogComponent, {
      data: { message: _('PROTOCOLS.REMOVE_REPORT_ALEART'), params: { serviceName } },
      width: '30%',
    }).afterClosed().subscribe(
      (res) => {
        if (res) {
          this.itemReportsServiceService.deleteService(serviceId).subscribe(
            (ok) => {
              this.updateTable();
            },
            (err) => {
              this.notificationService.notify(_('PROTOCOLS.COULD_NOT_DELETE_REPORT_SERVICES'));
              this.updateTable();
              console.error(err);
              // TODO: Bug
              this.updateTable();
            },
          );
        }
      },
    );
  }

  // to datetime.service
  private triggerMap(trigger: string, cronJobTimeStr) {
    if (this.triggerMapLang[trigger]) {
      return this.triggerMapLang[trigger];
    }
    const subTrigger = this.dateTimeService.parseCronJobTimeStr(cronJobTimeStr);
    return this.triggerMapLang[`CRON:${subTrigger}`];
  }
}

export interface AutoLogModule {
  zeitraum: string;
  uhrzeit: string;
  speicherort: string;
  format: string;
}
