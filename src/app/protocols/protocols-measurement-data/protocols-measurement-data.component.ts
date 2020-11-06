import {
  Component, OnInit, ViewChild, Inject,
} from '@angular/core';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { TranslateService } from '@ngx-translate/core';
import { DateTimePickerComponent } from '@syncfusion/ej2-angular-calendars';
import {
  ColumnModel,
  FilterSettingsModel, GridComponent,
  PageSettingsModel, SortSettingsModel,
} from '@syncfusion/ej2-angular-grids';
import { DataManager, Query } from '@syncfusion/ej2-data';
import {
  DeviceTypeName, DeviceTypeNameMapping, ItemReportsFilterService, ReportDataQueryOutputDto,
} from 'src/app/core/services';
import {
  AuthenticationService,
  DataManagerService,
  DateTimeService,
  NotificationService,
} from 'src/app/core/services/local-services';
import { environment } from 'src/environments/environment';
import { LayoutModule } from '../../shared/layout.module';
import {
  FilterTemplate,
  FilterTemplateComponent,
} from '../../shared/components/filter-template/filter-template/filter-template.component';

type ExportFormat = 'CSV' | 'PDF';

@Component({
  selector: 'app-protocols-measurement-data',
  templateUrl: './protocols-measurement-data.component.html',
  styleUrls: ['./protocols-measurement-data.component.scss'],
})
export class ProtocolsMeasurementDataComponent implements OnInit {
  pageSettings = {
    pageSizes: [10, 20, 50, 100],
    pageSize: 20,
    currentPage: 1,
  };

  public gridSortSettings: SortSettingsModel = {
    allowUnsort: false,
    columns: [{ field: 'dateUtc', direction: 'Descending' }],
  };

  public filterSettings: FilterSettingsModel = {
    type: 'CheckBox',
    enableCaseSensitivity: true,  // TODO(schuster): remove when tolower() supported by backend
  };

  allowFiltering = environment.allowGridFiltering;

  public activeFilter: FilterTemplate = new FilterTemplate();

  public section = 'measurement'; // don't change this param!

  public measurementDataSource: DataManager;

  public measurementDataQuery: Query = this.createMeasurementDataQuery();

  public startDateTime = new Date();

  public endDateTime = new Date();

  public maxStartTime: Date = new Date();

  public minEndTime: Date = new Date();

  @ViewChild('dataGrid')
  dataGrid: GridComponent;

  @ViewChild('fromDatePicker')
  fromDatePicker: DateTimePickerComponent;

  @ViewChild('toDatePicker')
  toDatePicker: DateTimePickerComponent;

  @ViewChild('templateManager')
  templateManagerComponent: FilterTemplateComponent;

  gridColumns: ColumnModel[] = [
    {
      field: 'dateUtc',
      headerText: _('PROTOCOLS.TIME'),
      textAlign: 'Left',
      format: { type: 'dateTime', skeleton: 'short' },
      allowSorting: true,
      allowFiltering: false,
    },
    {
      field: 'devicePointName',
      headerText: _('PROTOCOLS.DEVICE_NAME'),
      textAlign: 'Left',
      allowSorting: false,
      allowFiltering: true,
    },
    {
      field: 'deviceTypeName',
      headerText: _('DEVICES.DEVICE_TYPE'),
      textAlign: 'Left',
      allowSorting: false,
      allowFiltering: true,
      hideAtMedia: LayoutModule.getHideAtMedia('sm'),
    },
    {
      field: 'description',
      headerText: _('PROTOCOLS.MEASURING_POINT'),
      textAlign: 'Left',
      allowSorting: false,
      allowFiltering: true,
      hideAtMedia: LayoutModule.getHideAtMedia('sm'),
    },
    {
      field: 'value',
      headerText: _('PROTOCOLS.READING'),
      textAlign: 'Left',
      allowSorting: false,
      allowFiltering: false,
      valueAccessor: (field: string, data: ReportDataQueryOutputDto) => {
        const UNIT_MAP = {
          DegC: '°C',
          degC: '°C',
        };
        const unit = UNIT_MAP[data.unit] || data.unit;
        const value = Number(data.value).toLocaleString(
          this.translate.currentLang,
          { minimumFractionDigits: 2, maximumFractionDigits: 2 },
        );
        let valueResponse: string;
        // Check if value is a sring (corresponds to device state)
        if (Number.isNaN(Number(data.value))) {
          // TODO (Reger): This needs to be replaced by propper translation keys coming from the backend
          switch (data.value) {
            case 'a':
              valueResponse = 'Idle';
              break;
            case 'b':
              valueResponse = 'Wasser läuft';
              break;
            case 'c':
              valueResponse = 'Warm-Up läuft';
              break;
            case 'f':
              valueResponse = 'Thermische Desinfektion';
              break;
            case 'g':
              valueResponse = 'Thermische Desinfektion: Fehlgeschlagen';
              break;
            case 'e':
              valueResponse = 'Thermische Desinfektion: Erfolgreich';
              break;
            case 'h':
              valueResponse = 'Diagnose fehlgeschlagen';
              break;
            case 'i':
              valueResponse = 'Diagnose OK';
              break;
            case 'x':
              valueResponse = 'Schwerwiegender Fehler';
              break;
            default:
              valueResponse = '-';
              break;
          }
        } else if (unit === 'bool') {
          valueResponse = this.translate.instant(Number(value) === 0 ? 'PROTOCOLS.ZERO_READING' : 'PROTOCOLS.NON_ZERO_READING');
        } else {
          // Regular case, number with unit
          valueResponse = `${value}${unit || ''}`;
        }
        return valueResponse;
      },
    },
  ];

  constructor(
    private dataManagerService: DataManagerService,
    private itemReportsFilterService: ItemReportsFilterService,
    private dateTimeService: DateTimeService,
    private notificationService: NotificationService,
    @Inject('AuthService') private authenticationService: AuthenticationService,
    private translate: TranslateService,
  ) {
  }

  ngOnInit() {
    this.measurementDataSource = this.dataManagerService.getReportsDataManager();
    this.startDateTime.setMonth(this.startDateTime.getMonth() - 1);
  }

  public onDatechange(): void {
    // Make sure that startDate <= endDate
    this.minEndTime = this.startDateTime || null;
    this.maxStartTime = this.endDateTime || null;

    this.onDateSelected(this.startDateTime, this.endDateTime);
  }

  // resetTemplateManager allows syncfusion selection to be kept. this is cleared through cyclic reset on data receive
  private onDateSelected(startDate: Date, endDate: Date, resetTemplateManager = true): void {
    if (resetTemplateManager) {
      this.resetTemplateManager();
    }
    this.measurementDataQuery = this.createMeasurementDataQuery();
    this.gotToFirstPage();  // reset pager

    if (startDate !== null) {
      this.activeFilter.filters.dateStartFilter = this.dateTimeService.toISOString(startDate);
      const startDateString = this.dateTimeService.toISOString(startDate);
      this.measurementDataQuery.where('dateUtc', 'greaterthanorequal', startDateString);
    }

    if (endDate !== null) {
      this.activeFilter.filters.dateEndFilter = this.dateTimeService.toISOString(endDate);
      const endDateString = this.dateTimeService.toISOString(endDate);
      this.measurementDataQuery.where('dateUtc', 'lessthanorequal', endDateString);
    }
  }

  public onClickExport(format: ExportFormat): void {
    const allDataQuery = this.dataGrid.query.clone();
    // currently the backend requires SOME limitation of requested items
    allDataQuery.take(99999);

    const dataSource = format === 'PDF'
      ? this.dataManagerService.getReportsPdfDataManager()
      : this.dataManagerService.getReportsCsvDataManager();
    const processQuery = dataSource.adaptor.processQuery(dataSource, allDataQuery);
    window.open(processQuery.url, '_blank');
    this.notificationService.notify(_('PROTOCOLS.REPORT_CREATION_NOTIFICATION'));
  }

  public onFilterReset(): void {
    this.resetDatePicker();
    this.resetGridQuery();
    this.resetGridSettings();
    this.resetTemplateManager();
  }

  private resetDatePicker(): void {
    this.fromDatePicker.value = null;
    this.toDatePicker.refresh();
    this.toDatePicker.value = null;
    this.toDatePicker.refresh();
  }

  private setDatePickerRange(start: Date, end: Date): void {
    this.fromDatePicker.value = null;
    this.toDatePicker.value = null;
    this.fromDatePicker.value = start;
    this.toDatePicker.value = end;
    this.fromDatePicker.refresh();
    this.toDatePicker.refresh();
  }

  private resetGridQuery(): void {
    // TODO(schuster): These two operations trigger two backend requests. Try to find a way to do
    //     this with a single request.
    this.measurementDataQuery = this.createMeasurementDataQuery();
    this.gotToFirstPage();  // reset pager
  }

  private resetGridSettings(): void {
    this.dataGrid.clearFiltering();
    this.dataGrid.clearSelection();
    this.dataGrid.clearSorting();
  }

  private resetTemplateManager(): void {
    this.activeFilter = new FilterTemplate();
    this.templateManagerComponent.reset();
  }

  public onTemplateSelected(): void {
    this.setDatePickerRange(new Date(this.activeFilter.filters.dateStartFilter), new Date(this.activeFilter.filters.dateEndFilter));
    this.onDateSelected(new Date(this.activeFilter.filters.dateStartFilter), new Date(this.activeFilter.filters.dateEndFilter), false);
  }

  private createMeasurementDataQuery() {
    // add unique pager id for seek pagination
    return new Query().addParams('pagerId', 'measurementData');
  }

  public gotToFirstPage(): void {
    if (this.goToFirstPageEnabled()) {
      // copy object to trigger change detection
      this.pageSettings = {
        ...this.pageSettings,
        currentPage: 1,
      };
    }
  }

  public goToFirstPageEnabled(): boolean {
    return this.pageSettings.currentPage !== 1;
  }

  public gotToNextPage(data: PageSettingsModel): void {
    if (this.goToNextPageEnabled(data)) {
      // copy object to trigger change detection
      this.pageSettings = {
        ...this.pageSettings,
        // Any number >1 works for the DataManager. The pager also wants the number to change.
        currentPage: this.pageSettings.currentPage + 1,
      };
    }
  }

  public goToNextPageEnabled(data: PageSettingsModel): boolean {
    // The SeekingODataV4Adaptor signals the last page by setting the fake total count (that cannot
    //  be known when using seek pagination) count to the number of items on the page.
    return data && data.pageSize < data.totalRecordsCount;
  }

  public getDeviceTypeI18nKey(deviceTypeName: DeviceTypeName | 'Controller'): string {
    return DeviceTypeNameMapping[deviceTypeName] || deviceTypeName;
  }
}
