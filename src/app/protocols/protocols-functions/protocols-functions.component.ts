import { Component, OnInit, ViewChild } from '@angular/core';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { DateTimePickerComponent } from '@syncfusion/ej2-angular-calendars';
import { ColumnModel, GridComponent, SortSettingsModel } from '@syncfusion/ej2-angular-grids';
import { DataManager, Query } from '@syncfusion/ej2-data';
import { EventTypes, MessagesService } from 'src/app/core/services';
import {
  DataManagerService, DateTimeService, MessageToolsService, NotificationService,
} from 'src/app/core/services/local-services';
import {
  FilterTemplate,
  FilterTemplateComponent,
} from 'src/app/shared/components/filter-template/filter-template/filter-template.component';
import { ModalButtonData } from 'src/app/shared/components/modal-dialog/modal-dialog/modal-dialog.component';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-protocols-functions',
  templateUrl: './protocols-functions.component.html',
  styleUrls: ['./protocols-functions.component.scss'],
})
export class ProtocolsFunctionsComponent implements OnInit {
  public logDataSource: DataManager;

  public query: Query;

  public allowGridFiltering = environment.allowGridFiltering;

  public gridSortSettings: SortSettingsModel = {
    allowUnsort: false,
    columns: [
      { field: 'createdTime', direction: 'Descending' },
    ],
  };

  @ViewChild('dataGrid')
  dataGrid: GridComponent;

  exportButton: ModalButtonData = {
    name: _('PROTOCOLS.EXPORT_DATA'),
    type: 'primary',
    eventName: 'csv',
    id: 'btn-export-csv',
  };

  gridColumns: ColumnModel[] = [
    {
      field: 'createdTime',
      headerText: _('PROTOCOLS.TIME'),
      textAlign: 'Left',
      format: { type: 'dateTime', skeleton: 'short' },
      width: 170,
      allowSorting: true,
    },
    {
      field: 'summary',
      headerText: _('PROTOCOLS.SUMMARY'),
      textAlign: 'Left',
      allowSorting: false,
    },
  ];

  pageSettings = {
    pageSizes: [10, 20, 50, 100],
    pageSize: 20,
  };

  @ViewChild('fromDatePicker')
  fromDatePicker: DateTimePickerComponent;

  @ViewChild('toDatePicker')
  toDatePicker: DateTimePickerComponent;

  @ViewChild('templateManager')
  templateManagerComponent: FilterTemplateComponent;

  public activeFilter: FilterTemplate = new FilterTemplate();

  public startDateTime: Date = null;

  public endDateTime: Date = null;

  public maxStartTime: Date = null;

  public minEndTime: Date = null;

  /**
   * Filter template section name.
   * Override this in subclasses.
   */
  public section = 'functions';

  constructor(
    private messageService: MessagesService,
    private dataManagerService: DataManagerService,
    private dateTimeService: DateTimeService,
    private notificationService: NotificationService,
    private messsageToolsService: MessageToolsService,
  ) {
  }

  ngOnInit() {
    this.logDataSource = this.dataManagerService.getMessagesDataManager();
    this.query = this.createQuery();
  }

  public onDatechange(): void {
    // Make sure that startDate <= endDate
    this.minEndTime = this.startDateTime || null;
    this.maxStartTime = this.endDateTime || null;

    this.onDateSelected(this.startDateTime, this.endDateTime);
  }

  private onDateSelected(startDate: Date, endDate: Date): void {
    this.resetTemplateManager();
    this.query = this.createQuery();

    if (startDate !== null) {
      this.activeFilter.filters.dateStartFilter = this.dateTimeService.toISOString(startDate);
      const startDateString = this.dateTimeService.toISOString(startDate);
      this.query.where('createdTime', 'greaterthanorequal', startDateString);
    }

    if (endDate !== null) {
      this.activeFilter.filters.dateEndFilter = this.dateTimeService.toISOString(endDate);
      const endDateString = this.dateTimeService.toISOString(endDate);
      this.query.where('createdTime', 'lessthanorequal', endDateString);
    }
  }

  private resetTemplateManager(): void {
    this.activeFilter = new FilterTemplate();
    this.templateManagerComponent.reset();
  }

  private setDatePickerRange(start: Date, end: Date): void {
    this.fromDatePicker.value = start;
    this.toDatePicker.value = end;
    this.fromDatePicker.refresh();
    this.toDatePicker.refresh();
  }

  public onTemplateSelected(): void {
    this.setDatePickerRange(new Date(this.activeFilter.filters.dateStartFilter), new Date(this.activeFilter.filters.dateEndFilter));
    this.onDateSelected(new Date(this.activeFilter.filters.dateStartFilter), new Date(this.activeFilter.filters.dateEndFilter));
  }

  public onFilterReset(): void {
    this.resetDatePicker();
    this.resetGridQuery();
    // this.resetGridSettings();
    this.resetTemplateManager();
  }

  private resetDatePicker(): void {
    this.fromDatePicker.value = null;
    this.toDatePicker.refresh();
    this.toDatePicker.value = null;
    this.toDatePicker.refresh();
  }

  private resetGridQuery(): void {
    // TODO(schuster): These two operations trigger two backend requests. Try to find a way to do
    //     this with a single request.
    this.query = this.createQuery();
    // this.gotToFirstPage();  // reset pager
  }

  public getMessageParameters(jsonString: string): Object {
    const str = this.messsageToolsService.getMessageParameters(jsonString);
    if (!(typeof str === 'object' && str !== null)) {
      return { str };
    }
    return str;
  }

  public renderMessageDescription(messageDescription: string): string {
    return this.messsageToolsService.renderMessageDescription(messageDescription);
  }

  protected createQuery(): Query {
    const query = new Query().addParams('EventTypes', this.getEventTypeNames().join('|'));

    return query;
  }

  /**
   * Provides the event type name used in the query.
   * Subclasses should override this function to query different data.
   */
  protected getEventTypeNames(): string[] {
    return [EventTypes.FUNCTION];
  }

  public onExportMessages(): void {
    const fileName = `${new Date().toISOString().slice(0, 10)} ${this.getCsvBaseFileName()}`;
    const dataSource = this.dataManagerService.getMesasgesCsvDataManager(fileName);
    const processedQuery = dataSource.adaptor.processQuery(dataSource, this.getAllDataQuery());
    window.open(processedQuery.url, '_blank');
    this.notificationService.notify(_('PROTOCOLS.REPORT_CREATION_NOTIFICATION'));
  }

  public exportButtonDisabled(): boolean {
    return !this.dataGrid || !this.dataGrid.currentViewData.length;
  }

  private getAllDataQuery(): Query {
    const allDataQuery = this.dataGrid.query.clone();
    // currently the backend requires SOME limitation of requested items
    allDataQuery.skip(0).take(99999);
    return allDataQuery;
  }

  /**
   * Provides the file name for downloaded CSV exports.
   * Override this in subclasses.
   */
  protected getCsvBaseFileName(): string {
    return 'Funktions-Protokoll.csv';
  }
}
