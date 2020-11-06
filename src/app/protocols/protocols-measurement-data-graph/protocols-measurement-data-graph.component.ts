import {
  AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild,
} from '@angular/core';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { AxisModel, Chart, SeriesModel } from '@syncfusion/ej2-angular-charts';
import { MultiSelect, TaggingEventArgs } from '@syncfusion/ej2-angular-dropdowns';
import { Query } from '@syncfusion/ej2-data';
import { interval, Subscription } from 'rxjs';
import {
  ItemReportsFilterService,
  ReportOptionsQueryOutputDto,
  ReportOptionsQueryResultDto,
} from 'src/app/core/services';
import { DataManagerService, DateTimeService, NotificationService } from 'src/app/core/services/local-services';

interface ColorSet {
  color: string;
  class: string;
}

interface SeriesMetadata {
  devicePointUuid: string;
  channelId: number;
  side: number;
}

interface ColoredReportOptionsQueryOutputDto extends ReportOptionsQueryOutputDto {
  color: ColorSet;
  index: number;
}

interface SelectedUnits {
  left: string;
  right: string;
}

const POLLING_INTERVAL = 10000;

@Component({
  selector: 'app-protocols-measurement-data-graph',
  templateUrl: './protocols-measurement-data-graph.component.html',
  styleUrls: ['./protocols-measurement-data-graph.component.scss'],
})
export class ProtocolsMeasurementDataGraphComponent implements OnInit, AfterViewInit, OnDestroy {
  public dimensionsFields = {
    text: 'title',
    value: 'unit',
  };

  public dataPointsFields = {
    text: 'description',
    value: 'index',  // using the index as value, since we need deivcePointUuid AND dataPointId
    groupBy: 'devicePointName',  // group data channels by device instance
  };

  public placeholder = _('PROTOCOLS.PLEASE_CHOOSE');

  public liveViewToggleEnabled = true;

  private pollingSubscription: Subscription;

  public maxSelectedDevices = 4;

  public dimensions = [];

  public startDateTime: Date = null;

  public endDateTime: Date = null;

  public selectedUnits: SelectedUnits = {
    left: undefined,
    right: undefined,
  };

  public dataPoints: ColoredReportOptionsQueryOutputDto[][] = [[], []];

  public chartArea: Object = {
    border: {
      width: 0,
    },
  };

  public legend: Object = {
    visible: false,
  };

  public tooltip: Object = {
    enable: false,
  };

  public zoomSettings: Object = {
    mode: 'X',
    enableMouseWheelZooming: false,  // This would conflict with actual scrolling
    enablePinchZooming: true,
    enableSelectionZooming: true,
    enableScrollbar: true,
  };

  public primaryXAxis: any = {
    valueType: 'DateTime',
    intervalType: 'Minutes',
    majorGridLines: { width: 0 },
    minorGridLines: { width: 0 },
    majorTickLines: { width: 0 },
    minorTickLines: { width: 0 },
    lineStyle: { width: 0 },
    zoomFactor: 0.0,
    zoomPosition: 0.0,
  };

  public primaryYAxis: AxisModel = {
    opposedPosition: false,
    lineStyle: { width: 0 },
    visible: false,
    majorTickLines: { width: 0 },
    majorGridLines: { width: 0 },
    minorGridLines: { width: 0 },
    minorTickLines: { width: 0 },
  };

  public secondaryYAxis: AxisModel = {
    opposedPosition: true,
    lineStyle: { width: 0 },
    visible: false,
    majorTickLines: { width: 0 },
    majorGridLines: { width: 0 },
    minorGridLines: { width: 0 },
    minorTickLines: { width: 0 },
  };

  @ViewChild('chart')
  chart: Chart;

  @ViewChild('deviceSelector0')
  deviceSelector0: MultiSelect;

  @ViewChild('deviceSelector1')
  deviceSelector1: MultiSelect;

  private deviceSelectors: MultiSelect[];

  private availableDataSeriesColors: ColorSet[] = [
    { color: '#9ce1e6', class: 'chip2' },
    { color: '#e3aa7f', class: 'chip4' },
    { color: '#df5858', class: 'chip6' },  // $viega-c16
    { color: '#999999', class: 'chip8' },  // $viega-c7
    { color: '#ffff00', class: 'chip3' },  // $viega-c13
    { color: '#e1e7e7', class: 'chip7' },  // $viega-c8
    { color: '#489b48', class: 'chip1' },  // $viega-c11
    { color: '#cc3d5b', class: 'chip5' },  // $viega-c15
  ];

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private itemReportsFilterService: ItemReportsFilterService,
    private dataManagerService: DataManagerService,
    private dateTimeService: DateTimeService,
    private notificationService: NotificationService,
  ) {}

  ngOnInit() {
    // Query all available data channels
    this.itemReportsFilterService.getOptionQuery(/* no filters */).subscribe(
      (optionsQuery: ReportOptionsQueryResultDto) => {
        this.dimensions = optionsQuery.dropdownOptions.dataPointunit.map((unit) => ({
          unit,
          title: this.getVisibleUnit(unit, true),
        }));
      },
      (error) => {
        console.error(error);
        this.notificationService.notify(_('PROTOCOLS.COULD_NOT_INITIALIZE_PLOT_PAGE'));
      },
    );
  }

  ngAfterViewInit() {
    // Initialize with current day
    this.startDateTime = this.dateTimeService.stripTime(new Date());
    this.endDateTime = this.dateTimeService.addDays(this.startDateTime, 1);
    this.changeDetectorRef.detectChanges();

    this.deviceSelectors = [this.deviceSelector0, this.deviceSelector1];

    this.chart.primaryXAxis.zoomFactor = 1;  // reset zoom
  }

  ngOnDestroy(): void {
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
    }
  }

  public onUnitSelected(side: number, unit: string) {
    this.selectedUnits[side] = unit;

    this.clearDevices(side);

    const yAxis = (side === 0) ? this.chart.primaryYAxis : this.chart.axes.find((axis) => axis.name === 'secondaryYAxis');
    yAxis.visible = true;
    this.configureYAxis(yAxis, this.getVisibleUnit(unit, false));

    // Get all channels (and devices) providing the selected unit
    this.itemReportsFilterService.getOptionQuery(
      undefined,  // devicePointUuid
      undefined,  // deviceUuid
      undefined,  // deviceTypeName
      unit,  // unit
    ).subscribe(
      (reply) => {
        this.dataPoints[side] = reply.detailedDeviceInfo.map((deviceInfo, i: number) => {
          const result = deviceInfo as ColoredReportOptionsQueryOutputDto;
          result.color = this.availableDataSeriesColors.pop();
          result.index = i;
          return result;
        });
      },
    );
  }

  public onDevicesSelected(side: number, dataChannels: number[]): void {
    // Remove unselected series from chart
    // Go through items in reverse to avoid changing indices when deleting items.
    for (let i = this.chart.series.length - 1; i >= 0; i -= 1) {
      const series = this.chart.series[i];
      if (!this.isDefaultSeries(series) && this.seriesBelongsToSide(series, side)) {
        // Is the series not among the selected devices?
        if (!dataChannels.find((channelIndex) => {
          const dataPoint = this.dataPoints[side][channelIndex];
          const seriesName = this.createUniqueSeriesName(
            dataPoint.devicePointUuid,
            parseInt(dataPoint.dataPointId, 10),
            side,
          );
          return seriesName === series.name;
        })) {
          this.chart.removeSeries(i);
        }
      }
    }

    // Add missing, selected series to chart
    dataChannels.forEach((dataChannelIndex) => {
      const device = this.dataPoints[side][dataChannelIndex].devicePointUuid;
      const channel = parseInt(this.dataPoints[side][dataChannelIndex].dataPointId, 10);
      this.addDataRow(device, channel, side, this.startDateTime, this.endDateTime);
    });
  }

  private clearDevices(side: number): void {
    // Get back color assignments to devices
    // Reverse to restore orig. order
    for (let i = this.dataPoints[side].length - 1; i >= 0; i -= 1) {
      this.availableDataSeriesColors.push(this.dataPoints[side][i].color);
    }
    // Clear device selection
    this.deviceSelectors[side].selectAll(false);
    // Clear data series from chart
    // Avoid index change by reverse iteration
    for (let i = this.chart.series.length - 1; i >= 0; i -= 1) {
      const series = this.chart.series[i];
      if (!this.isDefaultSeries(series) && this.seriesBelongsToSide(series, side)) {
        this.chart.removeSeries(i);
      }
    }
  }

  /**
   * Replaces non-standard units returned by the backend with correct units.
   */
  private getVisibleUnit(unit: string, replaceNonUnit: boolean): string {
    const UNIT_MAP = {
      DegC: '°C',
      degC: '°C',
    };
    if (replaceNonUnit) {
      UNIT_MAP[''] = _('PROTOCOLS.NO_UNIT');  // TODO: translate...
    }

    return UNIT_MAP[unit] || unit;
  }

  private seriesBelongsToSide(series: SeriesModel, side: number): boolean {
    return (side === 0)
      ? (series.yAxisName === 'primaryYAxis') : (series.yAxisName !== 'primaryYAxis');
  }

  /**
   * Checks if the series is the default series defined for an axis by Syncfusion.
   * This one should never be deleted.
   */
  private isDefaultSeries(series: SeriesModel): boolean {
    return !series.name;
  }

  private getAxisValueType(unit: string): string {
    return unit === 'bool' ? 'Category' : 'Double';
  }

  private getAxisLabelFormat(unit: string): string {
    return unit === 'bool' ? '' : `{value} ${unit}`;
  }

  private getAxisMaximum(unit: string) {
    return unit === 'bool' ? 1 : null;
  }

  private createUniqueSeriesName(devicePointUuid: string, channelId: number, side: number): string {
    return `${devicePointUuid}-${channelId}-${side}`;
  }

  private splitUniqueSeriesName(seriesName: string): SeriesMetadata {
    const components = seriesName.split('-');
    return {
      devicePointUuid: components[0],
      channelId: parseInt(components[1], 10),
      side: parseInt(components[2], 10),
    };
  }

  private addDataRow(devicePointUuid: string, channelId: number, side: number, startDate: Date, endDate: Date): void {
    const name = this.createUniqueSeriesName(devicePointUuid, channelId, side);

    // Check if data series is currently added
    if (this.chart.series.find((series) => series.name === name)) {
      return;
    }

    const isPrimaryAxis = side === 0;
    this.chart.addSeries([{
      name,
      dataSource: this.dataManagerService.getReportsDataManager(),
      query: this.getDataQuery(devicePointUuid, channelId, startDate, endDate),
      yAxisName: isPrimaryAxis ? 'primaryYAxis' : 'secondaryYAxis',
      type: this.selectedUnits[side] === 'bool' ? 'StepLine' : 'Line',
      fill: this.dataPoints[side].find((device) => device.devicePointUuid === devicePointUuid).color.color,
      zOrder: isPrimaryAxis ? 1000 : 900,
      xName: 'dateUtc',
      yName: 'value',
      width: 2,
      visible: true,
      animation: {
        enable: false,
      },
    }]);
  }

  private configureYAxis(axis, unit: string): void {
    axis.labelFormat = this.getAxisLabelFormat(unit);
    axis.minimum = 0;
    axis.maximum = this.getAxisMaximum(unit);
    axis.valueType = this.getAxisValueType(unit);
  }

  public onStartDateChange(): void {
    this.onDateSelected();
  }

  public onEndDateChange(): void {
    this.onDateSelected();
    const now = new Date();
    this.liveViewToggleEnabled = !this.endDateTime || this.endDateTime > now;
  }

  private onDateSelected(): void {
    this.chart.series.forEach((series) => {
      const seriesMetaData = this.splitUniqueSeriesName(series.name);
      series.query = this.getDataQuery(
        seriesMetaData.devicePointUuid,
        seriesMetaData.channelId,
        this.startDateTime,
        this.endDateTime,
      );
    });
    this.chart.refresh();  // This is needed (checked 2020-10-19)
  }

  public onMultiSelectChipTagging(event: TaggingEventArgs): void {
    event.setClass(event.itemData['color'].class);
  }

  public onLiveViewToggle(enabled: boolean): void {
    if (enabled) {
      this.pollingSubscription = interval(POLLING_INTERVAL).subscribe(() => {
        // get updated data from backend
        this.chart.refresh();  // refresh data
        this.chart.refreshBound();  // preserve zoom
      });
    } else {
      this.pollingSubscription.unsubscribe();
    }
  }

  private getDataQuery(devicePointUuid: string, channelId: number, startDate: Date, endDate: Date): Query {
    const query = new Query()
      .where('devicePointUuid', 'equal', devicePointUuid)
      .where('dataPointId', 'equal', channelId)
      .take(999999999);  // some limitation is required by backend

    if (startDate) {
      const startDateString = this.dateTimeService.toISOString(startDate);
      query.where('dateUtc', 'greaterthanorequal', startDateString);
    }

    if (endDate) {
      const endDateString = this.dateTimeService.toISOString(endDate);
      query.where('dateUtc', 'lessthanorequal', endDateString);
    }

    return query;
  }
}
