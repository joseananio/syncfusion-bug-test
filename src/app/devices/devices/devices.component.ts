import {
  Component, OnInit, ViewChild, OnDestroy,
} from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import {
  forkJoin, of, from, Observable,
} from 'rxjs';
import {
  ColumnModel, CellSelectEventArgs, TextWrapSettingsModel, FilterSettingsModel,
} from '@syncfusion/ej2-angular-grids';
import { RowExpandedEventArgs, RowExpandingEventArgs, TreeGridComponent } from '@syncfusion/ej2-angular-treegrid';
import {
  DevicesService,
  DevicePointService,
  ControllerService,
  ControllerPointService,
  DevicesOutputDto,
  ControllerOutputDto,
  ControllerPointOutputDto,
  DevicePointOutputDto,
  AuthorityCodes,
  ControllerStatus,
  DeviceStatusSimple,
  DeviceStatus as DeviceStatusFull,
  DeviceTypeName,
  DeviceTypeNameMapping,
  DiscoveryStatusEnum,
} from 'src/app/core/services';
import { DataManagerService, NotificationService } from 'src/app/core/services/local-services';
import { ControllerStructureComponent } from 'src/app/devices/controller-structure/controller-structure.component';
import { QuestionDialogComponent } from 'src/app/shared/components/modal-dialog/question-dialog/question-dialog.component';
import { LayoutModule, LayoutBreakpoint } from 'src/app/shared/layout.module';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { ActivatedRoute } from '@angular/router';
import { SearchBoxComponent } from 'src/app/shared/lib/viega-common/lib/search-box';
import { DevicePointFullOutputDto } from '../../core/services/model/devicePointFullOutputDto';
import { DeviceReverseSearchComponent } from '../device-reverse-search/device-reverse-search.component';
import { DeviceStructureComponent } from '../device-structure/device-structure.component';
import { DeviceFunctionEditComponent, DeviceFunctionEditDialogData } from '../device-function-edit/device-function-edit.component';
import { DeviceFunctionListComponent } from '../device-function-list/device-function-list.component';
import { DeviceDetailsComponent } from '../device-details/device-details.component';

interface ExtendedDevicesOutputDto extends DevicesOutputDto {
  status: string;
  actions: boolean[];
  isInExpandState?: boolean;

  /**
   * Set device point enabled status on the device for display in the toggle button.
   */
  devicePointEnabled: boolean;

  /**
   * Hyplus devices are not connected over CAN but have an IP address.
   */
  ipAddress?: string;

  /**
   * The child devices.
   */
  devices?: ExtendedDevicesOutputDto[];

  /**
   * The device's software version.
   */
  softwareVersion?: string;
}

interface ExtendedControllerOutputDto extends ControllerOutputDto {
  devices: ExtendedDevicesOutputDto[];
  status: string;
  isInExpandState: boolean;
  actions: boolean[];
  deviceTypeName: string;
  softwareVersion: string;
}

interface DataUpdateParameters {
  /**
   * If no controller is provided, data for ALL controllers shall be queried. Otherwise only the
   * given controller shall be updated.
   */
  controller?: ControllerOutputDto;

  /**
   * If controller data shall be updated.
   */
  updateControllers?: boolean;

  /**
   * If controller point data shall be updated.
   */
  updateControllerPoints?: boolean;

  /**
   * If no device is provided, data for ALL devices shall be queried. Otherwise only the
   * given device shall be updated.
   */
  device?: DevicesOutputDto;

  /**
   * If device data shall be updated.
   */
  updateDevices?: boolean;

  /**
   * If device point data shall be updated.
   */
  updateDevicePoints?: boolean;

  /**
   * Show Loading data text.
   */
  loadingText?: boolean;
}

interface DeviceStatus {
  text: string;
  class: string;
}

// eslint-disable-next-line no-shadow
enum SearchStates {
  DeviceIdle,
  ControllerIdle,
  LssSearchRunning,
  ControllerSearchRunning,
  ControllerSearchError,
  LssSearchDone,
  ControllerSearchDone
}

const searchButtonTexts: {
  deviceStart: string,
  controllerStart: string,
  deviceStop: string,
  controllerStop: string,
} = {
  deviceStart: _('DEVICES.SEARCH_START'),
  controllerStart: _('DEVICES.FIND_CONTROLLER'),
  deviceStop: _('DEVICES.SEARCH_STOP'),
  controllerStop: _('DEVICES.SEARCH_SKIP_CONTROLLER'),
};

const searchStateTexts = {
  DeviceIdle: '',
  ControllerIdle: '',
  ControllerSearchRunning: _('DEVICES.SEARCH_STATE_CONTROLLER_RUNNING'),
  ControllerSearchError: _('DEVICES.SEARCH_STATE_CONTROLLER_ERROR'),
  ControllerSearchDone: _('DEVICES.SEARCH_STATE_CONTROLLER_DONE'),
  LssSearchRunning: _('DEVICES.SEARCH_STATE_LSS_RUNNING'),
  LssSearchError: _('DEVICES.SEARCH_STATE_LSS_ERROR'),
  LssSearchDone: _('DEVICES.SEARCH_STATE_LSS_DONE'),
};

export interface DeviceDialogData {
  device: DevicesOutputDto | ControllerOutputDto;
  authorities: Set<string>;
}

@Component({
  selector: 'app-devices',
  templateUrl: './devices.component.html',
  styleUrls: ['./devices.component.scss'],
})
export class DevicesComponent implements OnInit, OnDestroy {
  static errorStates = new Set([
    DeviceStatusFull.ErrorUnlinkedSensor,
    DeviceStatusFull.ErrorBackendRemote,
    DeviceStatusFull.ErrorBackend,
    DeviceStatusFull.ErrorDevice,
    ControllerStatus.FATALPERSISTANTSYSTEMFAILURE,
  ]);

  wrapSettings: TextWrapSettingsModel = {
    wrapMode: 'Both',
  };

  columns: ColumnModel[] = [
    { field: 'ipAddress', headerText: _('DEVICES.IP_ADDRESS'), hideAtMedia: LayoutModule.getHideAtMedia('md') },
    // invisible column used for filtering
    { field: 'devicePointUUID', visible: false },
    // invisible column used for filtering
    { field: 'controllerPoint_UUID', visible: false },
    // reference to the full DevicesOutputDto object
    { field: 'fullObject', visible: false },
  ];

  public gridDataSource;

  public filterSettings: FilterSettingsModel = {};

  public lssActive = false;

  AuthorityCodes = AuthorityCodes;

  authorities: Set<string> = new Set();

  @ViewChild('treegrid')
  public treeGrid: TreeGridComponent;

  @ViewChild('searchBox')
  public searchBox: SearchBoxComponent;

  public stateLoading = false;

  public deviceSearchStateLoading = false;

  public deviceSearchButtonState: SearchStates = SearchStates.DeviceIdle;

  public controllerSearchButtonState: SearchStates = SearchStates.ControllerIdle;

  private deviceSearchStateTimeout = null;

  private _deviceSearchStateLabel: string;

  get deviceSearchStateLabel(): string {
    return this._deviceSearchStateLabel;
  }

  set deviceSearchStateLabel(value : string) {
    this._deviceSearchStateLabel = value;
    if (this.deviceSearchStateTimeout) {
      clearTimeout(this.deviceSearchStateTimeout);
    }
    if (value !== '') {
      this.deviceSearchStateTimeout = setTimeout(() => { this._deviceSearchStateLabel = ''; }, 5000);
    }
  }

  private controllerSearchStateTimeout = null;

  private _controllerSearchStateLabel: string;

  get controllerSearchStateLabel(): string {
    return this._controllerSearchStateLabel;
  }

  set controllerSearchStateLabel(value : string) {
    this._controllerSearchStateLabel = value;
    if (this.controllerSearchStateTimeout) {
      clearTimeout(this.controllerSearchStateTimeout);
    }
    if (value !== '') {
      this.controllerSearchStateTimeout = setTimeout(() => { this._controllerSearchStateLabel = ''; }, 5000);
    }
  }

  public deviceSearchButtonText = searchButtonTexts.deviceStart;

  public controllerSearchButtonText = searchButtonTexts.controllerStart;

  public deviceSearchStateRefreshTimer;

  public controllerSearchStateRefreshTimer;

  public isControllerSearchTriggered = false;

  public isLssStarted = false;

  private devicePointFilterToggleState = false;

  private stateFilterToggleState = false;

  private controllers: ControllerOutputDto[] = [];

  private controllerPoints: ControllerPointOutputDto[] = [];

  private devices: DevicesOutputDto[] = [];

  private devicePoints: DevicePointOutputDto[] = [];

  searchInputPlaceholder = _('DEVICES.SEARCH_PLACEHOLDER');

  actionInfoHeader = _('DEVICES.ACTION_INFO_HEADER');

  private collapsedNodes: Set<string> = new Set();

  discoveryStatus = DiscoveryStatusEnum.Unknown;

  constructor(
    private controllerService: ControllerService,
    private controllerPointService: ControllerPointService,
    private deviceService: DevicesService,
    private devicePointService: DevicePointService,
    private dataManagerService: DataManagerService,
    private dialog: MatDialog,
    private notificationService: NotificationService,
    private route: ActivatedRoute,
  ) { }

  ngOnInit() {
    this.updateData({
      updateControllers: true,
      updateControllerPoints: true,
      updateDevices: true,
      updateDevicePoints: true,
      loadingText: true,
    });
    this.getLssStatus();
    this.getDiscoveryStatus();
    this.getSearchStates();
    this.applyFilter();
  }

  ngOnDestroy() {
    this.clearControllerSearchRefreshTimer();
  }

  private applyFilter(): void {
    let name;
    this.route.queryParamMap.subscribe((params) => { name = params.get('filter'); });
    if (name) {
      const deviceName = decodeURI(name);
      this.searchBox.value = deviceName;
      // treeGrid is undefined at this point
      setTimeout(
        () => {
          this.onSearchChange(deviceName);
        },
        1500,
      );
    }
  }

  // since LayoutModule isn't available in template
  public getHideAtMedia(size: LayoutBreakpoint): string {
    return LayoutModule.getHideAtMedia(size);
  }

  afterDialogClosed<T, R = any>(
    dialog: MatDialogRef<T, R>,
    updateParameters?: DataUpdateParameters,
  ): MatDialogRef<T, R> {
    dialog.afterClosed().subscribe((confirmed) => {
      if (updateParameters
        && (
          updateParameters.updateControllers
          || updateParameters.updateControllerPoints
          || updateParameters.updateDevices
          || updateParameters.updateDevicePoints
        )
      ) {
        this.updateData(updateParameters);
      }
    });
    return dialog;
  }

  private updateData(updateParameters: DataUpdateParameters): void {
    // TODO:
    if (updateParameters.loadingText) {
      this.stateLoading = true;
    }

    // use cached data if possible
    let controllerRequest: Observable<ControllerOutputDto> | Observable<ControllerOutputDto[]> = of(this.controllers);
    if (updateParameters.updateControllers) {
      if (updateParameters.controller) {  // incremental update
        controllerRequest = this.controllerService.getControllerUUIDMetadata(updateParameters.controller.uuid);
      } else {  // global update
        controllerRequest = this.controllerService.getControllerMetadataList();
      }
    }
    let controllerPointRequest: Observable<ControllerPointOutputDto> | Observable<ControllerPointOutputDto[]> = of(this.controllerPoints);
    if (updateParameters.updateControllerPoints) {
      if (updateParameters.controller && updateParameters.controller.controllerPoint_UUID) {  // incremental update
        controllerPointRequest = this.controllerPointService.getControllerPointByUuid(updateParameters.controller.controllerPoint_UUID);
      } else {  // global update
        controllerPointRequest = this.controllerPointService.getAllControllerPoints();
      }
    }

    let deviceRequest: Observable<DevicesOutputDto> | Observable<DevicesOutputDto[]> = of(this.devices);
    if (updateParameters.updateDevices) {
      if (updateParameters.device) {  // incremental update
        deviceRequest = this.deviceService.getDeviceUUIDMetadata(updateParameters.device.uuid);
      } else {  // global update
        deviceRequest = this.deviceService.getDeviceMetadataList();
      }
    }

    let devicePointRequest: Observable<DevicePointFullOutputDto> | Observable<DevicePointFullOutputDto[]> = of(this.devicePoints);
    if (updateParameters.updateDevicePoints) {
      if (updateParameters.device && updateParameters.device.devicePointUUID) {  // incremental update
        devicePointRequest = this.devicePointService.getFullDevicePointByUuid(updateParameters.device.devicePointUUID);
      } else {  // global update
        devicePointRequest = this.devicePointService.getDevicePointsFull();
      }
    }

    forkJoin([
      controllerRequest,
      controllerPointRequest,
      deviceRequest,
      devicePointRequest,
      from(this.dataManagerService.getUserAuthorityDataManager().ready),
    ]).subscribe(([controllers, controllerPoints, devices, devicePoints, authorities]) => {
      this.cacheBackendData(controllers, controllerPoints, devices, devicePoints);
      this.authorities = new Set(authorities['result'].authorityCodes);

      // remove WireSens devices that have no free ports
      const usedUpWireSensDevices: Set<string> = new Set(
        this.devices.filter((d) => d.deviceTypeName === DeviceTypeName.WireSens && d.availablePortCount === 0).map((device) => device.uuid),
      );
      this.devices = this.devices.filter((d) => !usedUpWireSensDevices.has(d.uuid));

      let devicesExtended = this.devices.map((device) => {
        const devicePoint: DevicePointFullOutputDto = this.devicePoints.find((dp) => dp.device_UUID === device.uuid);
        const hasDevicePointAddress = !!devicePoint;
        const devicePointEnabled = hasDevicePointAddress && !this.isDevicePointDisabled(devicePoint);
        const vmDevice: ExtendedDevicesOutputDto = {
          ...device,
          devicePointEnabled,
          status: this.getStatus(device).text,
          ipAddress: devicePoint ? devicePoint.ipAddress : undefined,
          isInExpandState: !this.collapsedNodes.has(device.uuid),
          softwareVersion: devicePoint ? devicePoint.softwareVersion : undefined,
          actions: [
            true,  // device details dialog is always accessible
            this.authorities.has(AuthorityCodes.INSTALLDEVICETODEVICEPOINT) && !hasDevicePointAddress,
            this.authorities.has(AuthorityCodes.READDEVICEPOINTGROUPFUNCTIONS) && hasDevicePointAddress,
            this.authorities.has(AuthorityCodes.ASSIGNFUNCTION) && hasDevicePointAddress,
            this.authorities.has(AuthorityCodes.UNINSTALLDEVICEFROMDEVICEPOINT) && hasDevicePointAddress,
          ],
        };
        if (!hasDevicePointAddress) {
          if (!vmDevice.name) {
            vmDevice.name = _('DEVICES.UNASSIGNED_DEVICE');
          }
        } else {
          vmDevice.name = devicePoint.name;
        }
        return vmDevice;
      });

      // Child devices shall be shown as children of their parent
      // Collect child devices
      const childDevices = devicesExtended.filter((device: DevicesOutputDto) => !!device.ancestorDeviceUUID);
      // remove child devices from top level
      devicesExtended = devicesExtended.filter((device: DevicesOutputDto) => !device.ancestorDeviceUUID);
      // assign child devices to parent devices
      devicesExtended = devicesExtended.map((device: ExtendedDevicesOutputDto) => {
        device.devices = childDevices.filter((currentDevice: DevicesOutputDto) => currentDevice.ancestorDeviceUUID === device.uuid);
        return device;
      });

      this.stateLoading = false;
      this.gridDataSource = this.controllers.map((controller, i) => {
        // To map devices and controllers, we have to use three types of entities:
        // Device <---> ControllerPoint <---> Controller

        const controllerPoint = this.controllerPoints.find((cp) => cp.controller_UUID === controller.uuid);
        let devicesOfController = [];
        if (controllerPoint) {  // A controller without a controller point cannot have devices
          // Hyplus devices do not belong to a controller, but due to an issue in the backend they may be assigned to one.
          devicesOfController = devicesExtended.filter((device) => device.controllerPointUUID === controller.controllerPoint_UUID
                                                       && device.deviceTypeName !== DeviceTypeName.Hyplus);
        }

        if (!controllerPoint) {
          if (!controller.name) {
            controller.name = _('DEVICES.UNASSIGNED_CONTROLLER');
          }
        } else {
          controller.name = controllerPoint.name;
          if (controllerPoint.disabledTimestamp) {
            controller.name = _('DEVICES.DELETED_CONTROLLER');
          }
        }

        const extendedController = controller as ExtendedControllerOutputDto;
        extendedController.devices = devicesOfController;
        extendedController.deviceTypeName = 'Controller';
        extendedController.isInExpandState = !this.collapsedNodes.has(controller.uuid);
        extendedController.status = this.getStatus(controller).text;
        extendedController.softwareVersion = this.getSoftwareVersion(controller.softwareRevision);
        extendedController.actions = [
          true,  // controller details dialog is always accessible
          this.authorities.has(AuthorityCodes.INSTALLCONTROLLERTOCONTROLLERPOINT) && !controllerPoint,
          false, // controllers do not have functions
          false, // controllers do not have functions
          this.authorities.has(AuthorityCodes.UNINSTALLCONTROLLERFROMCONTROLLERPOINT) && !!controllerPoint,
        ];

        return extendedController;
      });

      const hyplusDevices = devicesExtended.filter((d) => d.deviceTypeName === DeviceTypeName.Hyplus);
      this.gridDataSource = this.gridDataSource.concat(hyplusDevices);
    },
    (error) => {
      console.error(error);
      this.notificationService.notify(_('DEVICES.COULD_NOT_LOAD_DEVICE_DATA'));
    });
  }

  /**
   * Converts a software revision to a (shorter) software version string.
   */
  private getSoftwareVersion(softwareRevision?: string): string {
    const postFixSeparatorIndex = softwareRevision ? softwareRevision.search('-') : -1;
    return postFixSeparatorIndex >= 0 ? softwareRevision.substr(0, postFixSeparatorIndex) : softwareRevision;
  }

  private isOffline(controllerOrDevice: ControllerOutputDto | DevicesOutputDto): boolean {
    return (
      (controllerOrDevice as ControllerOutputDto).controllerStatus === ControllerStatus.OFFLINE
      || (controllerOrDevice as DevicesOutputDto).deviceStatusSimple === DeviceStatusSimple.Offline
    );
  }

  private isInErrorState(controllerOrDevice: ControllerOutputDto | DevicesOutputDto): boolean {
    return DevicesComponent.errorStates.has((controllerOrDevice as ControllerOutputDto).controllerStatus)
    || DevicesComponent.errorStates.has((controllerOrDevice as DevicesOutputDto).deviceStatus);
  }

  public getStatus(controllerOrDevice: ControllerOutputDto | DevicesOutputDto): DeviceStatus {
    if (this.isInErrorState(controllerOrDevice)) {
      return {
        text: _('DEVICES.ERROR_STATUS'),
        class: 'persistentFailure',
      };
    }

    if ((controllerOrDevice as DevicesOutputDto).deviceStatus === DeviceStatusFull.Unknown) {
      return {
        text: _('DEVICES.UNKNOWN_STATUS'),
        class: 'status-unknown',
      };
    }

    if (!(controllerOrDevice as DevicesOutputDto).devicePointUUID
        && controllerOrDevice['deviceTypeName'] !== 'Controller') {
      return {
        text: _('DEVICES.UNALLOCATED'),
        class: 'unlinked',
      };
    }

    if (this.isOffline(controllerOrDevice)) {
      return {
        text: _('DEVICES.OFFLINE_STATUS'),
        class: 'offline',
      };
    }

    return {
      text: _('DEVICES.OK_STATUS'),
      class: 'online',
    };
  }

  public onDeviceAction(event: CellSelectEventArgs): void {
    // TODO
  }

  public onNodeCollapsed(args: RowExpandingEventArgs): void {
    this.collapsedNodes.add(args.data['uuid']);
  }

  public onNodeExpanded(args: RowExpandedEventArgs) {
    this.collapsedNodes.delete(args.data['uuid']);
  }

  public onSearchChange(searchTerm: string): void {
    this.treeGrid.search(searchTerm);

    // only update the URL when there's a filter but no search term
    if (searchTerm === '') {
      this.route.queryParamMap.subscribe((params) => {
        if (params.get('filter')) {
          window.location.href = '/devices';
        }
      });
    }
  }

  public onToggleDevicePointFilter(event: boolean): void {
    this.devicePointFilterToggleState = event;
    this.refreshFilters();
  }

  public onToggleStateFilter(event: boolean): void {
    this.stateFilterToggleState = event;
    this.refreshFilters();
  }

  public onDetailsClick(event, device: DevicesOutputDto): void {
    const isController = device.deviceTypeName as string === 'Controller';
    this.afterDialogClosed(
      this.dialog.open(DeviceDetailsComponent, {
        data: {
          device,
          authorities: this.authorities,
        },
        width: '80%',
      }),
      {
        controller: device as any,  // hacky, but working
        updateControllers: isController,
        updateDevices: true,  // update all devices - a new GPIO device my have been created in the device or controller details dialog
      },
    );
  }

  /**
   * Cycles through two consecutive search requests, controllers and devices (lss search).
   */
  public onSearchDevices(): void {
    switch (this.deviceSearchButtonState) {
      case SearchStates.DeviceIdle:
        this.onStartLss();
        break;
      case SearchStates.LssSearchRunning:
        this.stopLssSearch();
        break;
      default:
        console.error(`Unknown search button state: ${this.deviceSearchButtonState}`);
        break;
    }
  }

  public onFindController(): void {
    switch (this.controllerSearchButtonState) {
      case SearchStates.ControllerIdle:
        this.startControllerSearch();
        break;
      case SearchStates.ControllerSearchRunning:
        this.skipControllerSearch();
        break;
      default:
        console.error(`Unknown search button state: ${this.controllerSearchButtonState}`);
        break;
    }
  }

  private stopLssSearch(): void {
    this.clearDeviceSearchRefreshTimer();
    this.isLssStarted = false;
    this.deviceSearchStateLabel = searchStateTexts.DeviceIdle;
    this.deviceSearchButtonState = SearchStates.DeviceIdle;
    this.deviceSearchButtonText = this.getSearchButtonText(this.deviceSearchButtonState);
  }

  private skipControllerSearch(): void {
    this.clearControllerSearchRefreshTimer();
    this.controllerService.abortDiscovery().subscribe(
      (ok) => {
        this.controllerSearchStateRefreshTimer = window.setTimeout(
          () => {
            this.isControllerSearchTriggered = false;
            this.controllerSearchStateLabel = searchStateTexts.ControllerIdle;
            this.controllerSearchButtonState = SearchStates.ControllerIdle;
            this.controllerSearchButtonText = this.getSearchButtonText(this.controllerSearchButtonState);
            this.getSearchStates();
          },
          100,
        );
      },
      (err) => {
        this.controllerSearchStateLabel = searchStateTexts.ControllerSearchError;
        this.controllerSearchButtonState = SearchStates.ControllerIdle;
        this.controllerSearchButtonText = this.getSearchButtonText(this.controllerSearchButtonState);
      },
    );
  }

  private startControllerSearch(): void {
    // Set flag: Current user triggered a search
    this.discoveryStatus = DiscoveryStatusEnum.Running;
    this.controllerService.startDiscovery().subscribe(
      (ok) => {
        this.controllerSearchStateLabel = searchStateTexts.ControllerSearchRunning;
        this.controllerSearchButtonState = SearchStates.ControllerSearchRunning;
        this.controllerSearchButtonText = this.getSearchButtonText(this.controllerSearchButtonState);
        this.isControllerSearchTriggered = true; // Set flag: Current user triggered a search
        // Refresh the search states
        this.controllerSearchStateRefreshTimer = window.setTimeout(
          () => {
            this.getSearchStates();
          },
          1000,
        );
      },
      (err) => {
        throw new Error(err);
      },
    );
  }

  public onFunctionClick(event, device: DevicesOutputDto): void {
    this.afterDialogClosed(this.dialog.open(DeviceFunctionListComponent, {
      data: device.devicePointUUID,
      width: '40%',
    }));
  }

  public onEditFunctionClick(event, device: DevicesOutputDto): void {
    const deviceFunctionEditDialogData: DeviceFunctionEditDialogData = {
      device: {
        devicePointUUID: device.devicePointUUID,
      },
    };
    this.afterDialogClosed(this.dialog.open(DeviceFunctionEditComponent, {
      data: deviceFunctionEditDialogData,
      width: '50%',
    }));
  }

  public onLinkClicked(event, device: any): void {
    if (device.deviceTypeName === 'Controller') {
      this.afterDialogClosed(
        this.dialog.open(ControllerStructureComponent, {
          data: {
            device,
            authorities: this.authorities,
          },
          width: '50%',
        }),
        {
          updateControllers: true,  // controllers know their controller point
          updateControllerPoints: true,
        },
      );
    } else {
      this.afterDialogClosed(
        this.dialog.open(DeviceStructureComponent, {
          data: {
            device,
            controllerPoint: this.controllerPoints.find(
              (controllerPoint) => controllerPoint.uuid === device.controllerPointUUID,
            ),
            authorities: this.authorities,
          },
          width: '50%',
        }),
        {
          updateDevices: true,  // devices know their device point
          updateDevicePoints: true,
        },
      );
    }
  }

  private refreshFilters(): void {
    this.filterSettings = { columns: [] };
    if (this.devicePointFilterToggleState) {
      // include unassigned devices
      this.filterSettings.columns.push(
        {
          field: 'devicePointUUID', operator: 'equal', predicate: 'and', value: '',
        },
      );
      // include unassigned controllers
      this.filterSettings.columns.push(
        {
          field: 'controllerPoint_UUID', operator: 'equal', predicate: 'and', value: '',
        },
      );
    }
    if (this.stateFilterToggleState) {
      // include status != OK
      this.filterSettings.columns.push(
        {
          field: 'status', operator: 'notEqual', predicate: 'and', value: 'DEVICES.OK_STATUS',
        },
      );
      // include status != unassigned - this is considered a non-status
      this.filterSettings.columns.push(
        {
          field: 'status', operator: 'notEqual', predicate: 'and', value: 'DEVICES.UNALLOCATED',
        },
      );
    }
  }

  public onUnlink(event, device: ExtendedDevicesOutputDto | ExtendedControllerOutputDto): void {
    if (!device.actions[2]) {
      this.onUnlinkController(event, device as ExtendedControllerOutputDto);
    } else {
      this.onUnlinkDevice(event, device as ExtendedDevicesOutputDto);
    }
  }

  public onUnlinkDevice(event, device: ExtendedDevicesOutputDto): void {
    const dialog = this.dialog.open(QuestionDialogComponent, {
      data: {
        title: device.name,
        message: _('DEVICES.UNLINK_DEVICE_ALERT'),
      },
    });
    dialog.afterClosed().subscribe(
      (res) => {
        if (res) {
          // hide unlink button - spinner shown automatically by css rule
          event.target.closest('viega-icon-button').classList.add('hidden');
          this.devicePointService.uninstallDeviceFromDevicePoint({
            deviceUUID: device.uuid,
            devicePointUUID: device.devicePointUUID,
            reloadConfig: true,
          }).subscribe(
            (unlinked) => {
              this.updateData({
                updateDevices: true,  // devices know their device point
                updateDevicePoints: true,
              });
            },
            (error) => {
              console.error(error);
              this.notificationService.notify(_('DEVICES.COULD_NOT_UNLINK_DEVICE'));
            },
          );
        }
      },
    );
  }

  public onUnlinkController(event, controller: ExtendedControllerOutputDto): void {
    const dialog: MatDialogRef<QuestionDialogComponent, any> = this.dialog.open(QuestionDialogComponent, {
      data: {
        title: controller.name,
        message: _('DEVICES.UNLINK_CONTROLLER_ALERT'),
      },
    });
    dialog.afterClosed().subscribe(
      (res) => {
        if (res) {
          // hide unlink button - spinner shown automatically by css rule
          event.target.closest('viega-icon-button').classList.add('hidden');
          this.controllerPointService.uninstallControllerFromControllerPoint(controller.uuid).subscribe(
            (unlinked) => {
              this.updateData({
                updateControllers: true,  // controllers know their controller point
                updateControllerPoints: true,
              });
            },
            (error) => {
              console.error(error);
              this.notificationService.notify(_('DEVICES.COULD_NOT_UNLINK_CONTROLLER'));
            },
          );
        }
      },
    );
  }

  /**
   * Gets the search button state by comparing the controller and lss search status against multiple conditions.
   */
  private getSearchStates(): void {
    console.log(this.discoveryStatus, this.lssActive);
    forkJoin(
      this.controllerService.getDiscoveryStatus(),
      this.deviceService.isScanningLSS(),
    ).subscribe(
      ([controllerSearchStatus, lssStatus]) => {
        if (
          // Button state: Start search
          controllerSearchStatus.discoveryStatus === DiscoveryStatusEnum.Unknown
        ) {
          this.controllerSearchButtonState = SearchStates.ControllerIdle;
          this.controllerSearchStateLabel = searchStateTexts.ControllerIdle;
        } else if (
          // Search state: Controller Search Error
          controllerSearchStatus.discoveryStatus === DiscoveryStatusEnum.Error
        ) {
          this.controllerSearchButtonState = SearchStates.ControllerSearchError;
          this.controllerSearchStateLabel = searchStateTexts.ControllerSearchError;
        } else if (
          // Button state: Skip controller search
          controllerSearchStatus.discoveryStatus === DiscoveryStatusEnum.Running
        ) {
          this.controllerSearchButtonState = SearchStates.ControllerSearchRunning;
          this.controllerSearchStateLabel = searchStateTexts.ControllerSearchRunning;
          this.controllerSearchStateRefreshTimer = window.setTimeout(
            () => {
              this.getSearchStates();
            },
            1000,
          );
        } else if (
          // Controller search done, but lss not triggered
          (controllerSearchStatus.discoveryStatus === DiscoveryStatusEnum.Succeeded && !lssStatus)
          || (controllerSearchStatus.discoveryStatus === DiscoveryStatusEnum.NotAllReply && !lssStatus)
          || (controllerSearchStatus.discoveryStatus === DiscoveryStatusEnum.Aborted && !lssStatus)
          || (controllerSearchStatus.discoveryStatus === DiscoveryStatusEnum.Unknown && !lssStatus)
        ) {
          this.controllerSearchButtonState = SearchStates.ControllerIdle;
          // At this point controller search was triggered and has ended successfully
          if (this.discoveryStatus === DiscoveryStatusEnum.Succeeded && this.isControllerSearchTriggered) {
            this.controllerSearchStateLabel = searchStateTexts.ControllerSearchDone;
            this.isControllerSearchTriggered = false;
          }
          if (this.isLssStarted) {
            // Lss is done after successful start and returning running state false again
            this.isLssStarted = false;
            this.deviceSearchButtonState = SearchStates.DeviceIdle;
            this.deviceSearchStateLabel = searchStateTexts.LssSearchDone;
          } else {
            // Set idle state because this user did not trigger previous searches
            this.controllerSearchButtonState = SearchStates.ControllerIdle;
          }
        } else if (
          // Stop lss search
          lssStatus
        ) {
          this.deviceSearchButtonState = SearchStates.LssSearchRunning;
          this.deviceSearchStateRefreshTimer = window.setTimeout(
            () => {
              this.getSearchStates();
            },
            1000,
          );
        }
        this.deviceSearchButtonText = this.getSearchButtonText(this.deviceSearchButtonState);
        this.controllerSearchButtonText = this.getSearchButtonText(this.controllerSearchButtonState);
      },
      (error) => {
        this.notificationService.notify(_('DEVICES.COULD_NOT_GET_DISCOVERY_STATUS'));
        console.error(error);
      },
    );
  }

  /**
   * Gets search button text corresponding to a search state. Returns translation key.
   */
  private getSearchButtonText(state: SearchStates): string {
    let translationkey: string;
    switch (state) {
      case SearchStates.DeviceIdle:
        translationkey = searchButtonTexts.deviceStart;
        break;
      case SearchStates.ControllerIdle:
        translationkey = searchButtonTexts.controllerStart;
        break;
      case SearchStates.ControllerSearchRunning:
        translationkey = searchButtonTexts.controllerStop;
        break;
      case SearchStates.LssSearchRunning:
        translationkey = searchButtonTexts.deviceStop;
        break;
      default:
        translationkey = searchButtonTexts.deviceStart;
    }
    return translationkey;
  }

  /**
   * Clears the update polls to getSearchStates().
   */
  private clearDeviceSearchRefreshTimer(): void {
    window.clearTimeout(this.deviceSearchStateRefreshTimer);
  }

  private clearControllerSearchRefreshTimer(): void {
    window.clearTimeout(this.controllerSearchStateRefreshTimer);
  }

  private getLssStatus(): void {
    this.deviceService.isScanningLSS().subscribe(
      (status) => {
        this.lssActive = status;
        if (status) {
          window.setTimeout(
            () => {
              this.getLssStatus();
            },
            1000,
          );
        } else {
          this.deviceSearchStateLoading = false;
          this.updateData({
            updateControllers: true,
            updateControllerPoints: true,
            updateDevices: true,
            updateDevicePoints: true,
          });
        }
      },
      (error) => {
        console.error(error);
        if (this.lssActive) {
          window.setTimeout(
            () => { this.getLssStatus(); },
            1000,
          );
        }
      },
    );
  }

  private getDiscoveryStatus(): void {
    this.controllerService.getDiscoveryStatus().subscribe(
      (status) => {
        this.discoveryStatus = status.discoveryStatus;
        if (status) {
          this.controllerSearchStateRefreshTimer = window.setTimeout(
            () => {
              this.getDiscoveryStatus();
            },
            1000,
          );
        } else {
          this.updateData({
            updateControllers: true,
            updateControllerPoints: true,
            updateDevices: true,
            updateDevicePoints: true,
          });
        }
      },
      (error) => {
        console.error(error);
        if (this.discoveryStatus) {
          window.setTimeout(
            () => { this.getDiscoveryStatus(); },
            1000,
          );
        }
      },
    );
  }

  private onStartLss(): void {
    this.lssActive = true;
    this.deviceSearchStateLoading = true;
    this.deviceService.startLss()
      .subscribe(
        (okay) => {
          this.isLssStarted = true;
          this.deviceSearchStateLabel = searchStateTexts.LssSearchRunning;
          this.deviceSearchButtonState = SearchStates.LssSearchRunning;
          this.deviceSearchButtonText = this.getSearchButtonText(this.deviceSearchButtonState);
          this.deviceSearchStateRefreshTimer = window.setTimeout(
            () => {
              this.getSearchStates();
            },
            1000,
          );
        },
        (err) => {
          this.deviceSearchStateLabel = searchStateTexts.LssSearchError;
          console.error(err);
        },
      );
  }

  public onReverseSearch(): void {
    this.dialog.open(DeviceReverseSearchComponent, {
      data: {
        title: _('DEVICES.START_REVERSE_SEARCH'),
        message: _('DEVICES.START_REVERSE_SEARCH_MESSAGE'),
      },
    });
  }

  private cacheBackendData(controllers, controllerPoints, devices, devicePoints): void {
    if (Array.isArray(controllers)) {  // global update
      this.controllers = controllers;
    } else {  // incremental update
      const controllerIndex = this.controllers.findIndex(
        (controller) => controller.uuid === (controllers as ControllerOutputDto).uuid,
      );
      if (controllerIndex >= 0) {
        this.controllers[controllerIndex] = controllers as ControllerOutputDto;
      } else {
        this.controllers.push(controllers as ControllerOutputDto);
      }
    }

    if (Array.isArray(controllerPoints)) {  // global update
      this.controllerPoints = controllerPoints;
    } else {  // incremental update
      const controllerPointIndex = this.controllerPoints.findIndex(
        (controllerPoint) => controllerPoint.uuid === (controllerPoints as ControllerPointOutputDto).uuid,
      );
      if (controllerPointIndex >= 0) {
        this.controllerPoints[controllerPointIndex] = controllerPoints as ControllerPointOutputDto;
      } else {
        this.controllerPoints.push(controllerPoints as ControllerPointOutputDto);
      }
    }

    if (Array.isArray(devices)) {  // global update
      this.devices = devices;
    } else {  // incremental update
      const deviceIndex = this.devices.findIndex(
        (device) => device.uuid === (devices as DevicesOutputDto).uuid,
      );
      if (deviceIndex >= 0) {
        this.devices[deviceIndex] = devices as DevicesOutputDto;
      } else {
        this.devices.push(devices as DevicesOutputDto);
      }
    }

    if (Array.isArray(devicePoints)) {  // global update
      this.devicePoints = devicePoints;
    } else {  // incremental update
      const devicePointIndex = this.devicePoints.findIndex(
        (devicePoint) => devicePoint.uuid === (devicePoints as DevicePointOutputDto).uuid,
      );
      if (devicePointIndex >= 0) {
        this.devicePoints[devicePointIndex] = devicePoints as DevicePointOutputDto;
      } else {
        this.devicePoints.push(devicePoints as DevicePointOutputDto);
      }
    }
  }

  /**
   * Called when the toggle button is pressed.
   * This should call activation endpoint for the specific row.
   *
   * @param data
   */
  public onToggleActivationBtnClick(data: DevicesOutputDto): void {
    const devicePoint = this.devicePoints.find((dp) => dp.uuid === data.devicePointUUID);
    if (!devicePoint) {
      return;
    }

    if (this.isDevicePointDisabled(devicePoint)
    ) {
      this.enableDevicePoint(data.devicePointUUID);
    } else {
      this.disableDevicePoint(data.devicePointUUID);
    }
  }

  public getDeviceTypeNameI18nKey(deviceTypeName: DeviceTypeName): string {
    return DeviceTypeNameMapping[deviceTypeName] || deviceTypeName;
  }

  private isDevicePointDisabled(devicePoint: DevicePointOutputDto): boolean {
    return (
      devicePoint.disabledTimestamp
      && (!devicePoint.enabledTimestamp
        || new Date(devicePoint.disabledTimestamp)
          > new Date(devicePoint.enabledTimestamp))
    );
  }

  private disableDevicePoint(uuid: string): void {
    this.toggleEnableDevice(this.devicePointService.setDevicePointDisabled(uuid), false);
  }

  private enableDevicePoint(uuid): void {
    this.toggleEnableDevice(this.devicePointService.resetDevicePointDisabled(uuid), true);
  }

  private toggleEnableDevice(call: Observable<any>, enabled: boolean): void {
    call.subscribe(
      () => {
        this.updateData({
          updateControllers: false,
          updateControllerPoints: false,
          updateDevices: false,
          updateDevicePoints: true,
        });
      },
      (error) => {
        console.error(error);
        this.notificationService.notify(enabled ? _('DEVICES.COULD_NOT_ENABLE_DEVICE') : _('DEVICES.COULD_NOT_DISABLE_DEVICE'));
      },
    );
  }
}
