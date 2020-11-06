import {
  Component, OnInit, Input, Output, EventEmitter, OnDestroy,
} from '@angular/core';
import {
  DevicesService,
  DevicesOutputDto,
  ItemReportsFilterService,
  ReportDataQueryOutputDto,
  DevicePointService,
} from 'src/app/core/services';
import { CdkDragEnd } from '@angular/cdk/drag-drop';
import { timer, Subscription } from 'rxjs';
import { Device } from '../dashboard/dashboard-overview/dashboard-overview.component';

@Component({
  selector: 'app-dashboard-item',
  templateUrl: './dashboard-item.component.html',
  styleUrls: ['./dashboard-item.component.scss'],
})
// TODO (Reger): Implement GetDataQueryOdata with filter createdByUuid (=devicepointuuid) to poll live data
// TODO (Reger): Implement delete icon and emmit event
export class DashboardItemComponent implements OnInit, OnDestroy {
  constructor(
    private deviceService: DevicesService,
    private devicePointService: DevicePointService,
    private itemReportsFilterService: ItemReportsFilterService,
  ) {}

  private subscription: Subscription;

  deviceColor = '#D35400'; // default to offline

  isExpanded: boolean;

  isHovering = false;

  device = {} as DevicesOutputDto;

  deviceReport = {} as ReportDataQueryOutputDto;

  isEditing: boolean;

  pollInterval = 5000;

  devicePointName?: string = null;

  liveValueFloatString?: string = null;

  liveValueIntString?: string = null;

  @Input() data: any;

  @Input() devicex: Device;

  @Input() isDragDisable = true;

  @Output() dragEnded: EventEmitter<any> = new EventEmitter();

  @Output() delete: EventEmitter<boolean> = new EventEmitter();

  ngOnInit() {
    this.isExpanded = this.devicex.isExpanded;
    // Randomizing polling start time to distribute backend requests within 500ms
    this.subscription = timer(Math.floor(Math.random() * 500), this.pollInterval).subscribe(() => {
      this.updateItem();
    });
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  public onEditingChanged(isEditing: boolean): void {
    this.isDragDisable = isEditing;
    this.isEditing = isEditing;
  }

  public onDragEnded(event: CdkDragEnd): void {
    const { nativeElement } = event.source.element;
    const { parentElement } = nativeElement.offsetParent.parentElement;

    const top = nativeElement.getBoundingClientRect().top - parentElement.getBoundingClientRect().top;
    const { left } = nativeElement.getBoundingClientRect();

    this.devicex.position.x = (left / parentElement.offsetWidth) * 100;
    this.devicex.position.y = (top / parentElement.offsetHeight) * 100;
    this.dragEnded.emit(this.devicex);
  }

  public expand(isExpanded: boolean): void {
    if (!this.isEditing) {
      this.devicex.isExpanded = isExpanded;
    }
  }

  private updateItem(): void {
    this.deviceService.getDeviceUUIDMetadata(this.devicex.uuid).subscribe(
      (device) => {
        this.device = device;
        this.getDevicePointName(device.devicePointUUID);
        // set dashbaord item background color base on device status
        // TODO (Reger): Check for three states: Online, Offline, Device error
        // TODO update device color according to state offline, online, error
        this.deviceColor = device.deviceStatusSimple === 'Online' ? '#cc3d5b' : '#D35400';
        // Only update dataQuery after resolving the first subscription
        this.updateDeviceReport();
      },
      (error) => {
        // TODO(Reger): Visualize state of item with failed last data request
        console.error(error);
      },
    );
  }

  private getDevicePointName(devicePointUUID: string): void {
    this.devicePointService.getDevicePointByUuid(devicePointUUID).subscribe(
      (devicePoint) => {
        this.devicePointName = devicePoint.name;
      },
    );
  }

  /**
   * Update of this item's device values.
   */
  private updateDeviceReport(): void {
    // Todo update live variables (e.g. temperature, pressure, flushing state)
    this.itemReportsFilterService.getDataQuery(
      null,
      this.device.uuid,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      1,
      null,
    ).subscribe(
      (report) => {
        // Handling undefined here to allow better control compared to template binding
        if (report[0] !== undefined) {
          this.deviceReport = report[0];
          // Number parsing is done here since templates don't support it
          this.liveValueFloatString = parseFloat(this.deviceReport.value).toFixed(1).toString();
          this.liveValueIntString = parseInt(this.deviceReport.value, 10).toString();
        } else {
          // Setting null anyway in case report becomes undefined during lifecycle
          this.liveValueFloatString = null;
          this.liveValueIntString = null;
        }
      },
      (error) => {
        // TODO(Reger): Visualize state of item with stale data
        console.error(error);
      },
    );
  }

  public deleteItem(): void {
    this.delete.emit(true);
  }
}
