import {
  Component, OnInit, ViewChild,
} from '@angular/core';
import {
  ColumnModel, CellSelectEventArgs, TextWrapSettingsModel, FilterSettingsModel,
} from '@syncfusion/ej2-angular-grids';
import { RowExpandedEventArgs, RowExpandingEventArgs, TreeGridComponent } from '@syncfusion/ej2-angular-treegrid';
import { LayoutModule, LayoutBreakpoint } from 'src/app/shared/layout.module';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import data from "./data.json";

@Component({
  selector: 'app-devices',
  templateUrl: './devices.component.html',
  styleUrls: ['./devices.component.scss'],
})
export class DevicesComponent implements OnInit {

  wrapSettings: TextWrapSettingsModel = {
    wrapMode: 'Both',
  };

  columns: ColumnModel[] = [
    { field: 'ipAddress', headerText: _('DEVICES.IP_ADDRESS'), hideAtMedia: LayoutModule.getHideAtMedia('md') },
    // invisible column used for filtering
    { field: 'controllerPoint_UUID', visible: false },
    // reference to the full DevicesOutputDto object
    { field: 'fullObject', visible: false },
  ];

  public gridDataSource = data;

  public filterSettings: FilterSettingsModel = {};

  public lssActive = false;

  @ViewChild('treegrid')
  public treeGrid: TreeGridComponent;

  public stateLoading = false;
  collapsedNodes: string[] = [];

  constructor() { }

  ngOnInit() {

  }

  // since LayoutModule isn't available in template
  public getHideAtMedia(size: LayoutBreakpoint): string {
    return LayoutModule.getHideAtMedia(size);
  }

  private isOffline(controllerOrDevice: any): boolean {
    return (
      (controllerOrDevice as any).controllerStatus === ControllerStatus.OFFLINE
      || (controllerOrDevice as any).deviceStatusSimple === DeviceStatusSimple.Offline
    );
  }

  private isInErrorState(controllerOrDevice: any): boolean {
    return false
  }

  public getStatus(controllerOrDevice: any) {
    if (this.isInErrorState(controllerOrDevice)) {
      return {
        text: _('DEVICES.ERROR_STATUS'),
        class: 'persistentFailure',
      };
    }

    if ((controllerOrDevice as any).deviceStatus === DeviceStatus.Unknown) {
      return {
        text: _('DEVICES.UNKNOWN_STATUS'),
        class: 'status-unknown',
      };
    }

    if (!(controllerOrDevice as any).devicePointUUID
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
    // this.collapsedNodes.add(args.data['uuid']);
  }

  public onNodeExpanded(args: RowExpandedEventArgs) {
    // this.collapsedNodes.delete(args.data['uuid']);
  }


  public getDeviceTypeNameI18nKey(deviceTypeName: any): string {
    return DeviceTypeNameMapping[deviceTypeName] || deviceTypeName;
  }
}


export type DeviceTypeName = 'Wall-E' | 'Beat-E' | 'WireSens' | 'WirePort' | 'DTE' | 'Zirk-E' | 'Rulantica' | 'RulanticaT' | 'UfcFaultContact' | 'Hyplus' | 'Pump' | 'MagneticValve' | 'TemperatureSensor' | 'FlowSensor' | 'PressureSensor' | 'PulseSensor' | 'FlowAndTemperatureSensor' | 'GPIO' | 'LEDBar' | 'KeySwitch';

export const DeviceTypeName = {
    WallE: 'Wall-E' as DeviceTypeName,
    BeatE: 'Beat-E' as DeviceTypeName,
    WireSens: 'WireSens' as DeviceTypeName,
    WirePort: 'WirePort' as DeviceTypeName,
    DTE: 'DTE' as DeviceTypeName,
    ZirkE: 'Zirk-E' as DeviceTypeName,
    Rulantica: 'Rulantica' as DeviceTypeName,
    RulanticaT: 'RulanticaT' as DeviceTypeName,
    UfcFaultContact: 'UfcFaultContact' as DeviceTypeName,
    Hyplus: 'Hyplus' as DeviceTypeName,
    Pump: 'Pump' as DeviceTypeName,
    MagneticValve: 'MagneticValve' as DeviceTypeName,
    TemperatureSensor: 'TemperatureSensor' as DeviceTypeName,
    FlowSensor: 'FlowSensor' as DeviceTypeName,
    PressureSensor: 'PressureSensor' as DeviceTypeName,
    PulseSensor: 'PulseSensor' as DeviceTypeName,
    FlowAndTemperatureSensor: 'FlowAndTemperatureSensor' as DeviceTypeName,
    GPIO: 'GPIO' as DeviceTypeName,
    LEDBar: 'LEDBar' as DeviceTypeName,
    KeySwitch: 'KeySwitch' as DeviceTypeName
};


export const DeviceTypeNameMapping = {
  [DeviceTypeName.WallE]: _('API.DEVICE_TYPE_NAME.WallE'),
  [DeviceTypeName.BeatE]: _('API.DEVICE_TYPE_NAME.BeatE'),
  [DeviceTypeName.WireSens]: _('API.DEVICE_TYPE_NAME.WireSens'),
  [DeviceTypeName.WirePort]: _('API.DEVICE_TYPE_NAME.WirePort'),
  [DeviceTypeName.DTE]: _('API.DEVICE_TYPE_NAME.DTE'),
  [DeviceTypeName.ZirkE]: _('API.DEVICE_TYPE_NAME.ZirkE'),
  [DeviceTypeName.Rulantica]: _('API.DEVICE_TYPE_NAME.Rulantica'),
  [DeviceTypeName.RulanticaT]: _('API.DEVICE_TYPE_NAME.RulanticaT'),
  [DeviceTypeName.UfcFaultContact]: _('API.DEVICE_TYPE_NAME.UfcFaultContact'),
  [DeviceTypeName.Hyplus]: _('API.DEVICE_TYPE_NAME.Hyplus'),
  [DeviceTypeName.Pump]: _('API.DEVICE_TYPE_NAME.Pump'),
  [DeviceTypeName.MagneticValve]: _('API.DEVICE_TYPE_NAME.MagneticValve'),
  [DeviceTypeName.TemperatureSensor]: _('API.DEVICE_TYPE_NAME.TemperatureSensor'),
  [DeviceTypeName.FlowSensor]: _('API.DEVICE_TYPE_NAME.FlowSensor'),
  [DeviceTypeName.PressureSensor]: _('API.DEVICE_TYPE_NAME.PressureSensor'),
  [DeviceTypeName.PulseSensor]: _('API.DEVICE_TYPE_NAME.PulseSensor'),
  [DeviceTypeName.FlowAndTemperatureSensor]: _('API.DEVICE_TYPE_NAME.FlowAndTemperatureSensor'),
  [DeviceTypeName.GPIO]: _('API.DEVICE_TYPE_NAME.GPIO'),
  [DeviceTypeName.LEDBar]: _('API.DEVICE_TYPE_NAME.LEDBar'),
  [DeviceTypeName.KeySwitch]: _('API.DEVICE_TYPE_NAME.KeySwitch'),
};



export type ControllerStatus = 'FUSI_OK' | 'OFFLINE' | 'FATAL_PERSISTANT_SYSTEM_FAILURE';

export const ControllerStatus = {
    FUSIOK: 'FUSI_OK' as ControllerStatus,
    OFFLINE: 'OFFLINE' as ControllerStatus,
}

export type DeviceStatusSimple = 'Online' | 'Offline';

export const DeviceStatusSimple = {
    Online: 'Online' as DeviceStatusSimple,
    Offline: 'Offline' as DeviceStatusSimple
};


export type DeviceStatus = 'Idle' | 'WaterRunning' | 'ThermalDisinfection' | 'HygieneCleansingCold' | 'HygieneCleansingWarm' | 'UseLock' | 'WarmUp' | 'DiagnoseRunning' | 'BasicMode' | 'DefaultMode' | 'ManualMode' | 'ThermalDisinfectionResultFail' | 'ThermalDisinfectionResultOk' | 'KeySwitchOn' | 'KeySwitchOff' | 'UFCOK' | 'UFCError' | 'UFCFault' | 'ErrorUnlinkedSensor' | 'Automatic' | 'Maintenance' | 'ThermalDisinfectionClosed' | 'ThermalDisinfectionOpen' | 'Remote' | 'Unlinked' | 'ErrorBackendRemote' | 'Unknown' | 'ErrorBackend' | 'ErrorDevice';

export const DeviceStatus = {
    Idle: 'Idle' as DeviceStatus,
    WaterRunning: 'WaterRunning' as DeviceStatus,
    ThermalDisinfection: 'ThermalDisinfection' as DeviceStatus,
    HygieneCleansingCold: 'HygieneCleansingCold' as DeviceStatus,
    HygieneCleansingWarm: 'HygieneCleansingWarm' as DeviceStatus,
    UseLock: 'UseLock' as DeviceStatus,
    WarmUp: 'WarmUp' as DeviceStatus,
    DiagnoseRunning: 'DiagnoseRunning' as DeviceStatus,
    BasicMode: 'BasicMode' as DeviceStatus,
    DefaultMode: 'DefaultMode' as DeviceStatus,
    ManualMode: 'ManualMode' as DeviceStatus,
    ThermalDisinfectionResultFail: 'ThermalDisinfectionResultFail' as DeviceStatus,
    ThermalDisinfectionResultOk: 'ThermalDisinfectionResultOk' as DeviceStatus,
    KeySwitchOn: 'KeySwitchOn' as DeviceStatus,
    KeySwitchOff: 'KeySwitchOff' as DeviceStatus,
    UFCOK: 'UFCOK' as DeviceStatus,
    UFCError: 'UFCError' as DeviceStatus,
    UFCFault: 'UFCFault' as DeviceStatus,
    ErrorUnlinkedSensor: 'ErrorUnlinkedSensor' as DeviceStatus,
    Automatic: 'Automatic' as DeviceStatus,
    Maintenance: 'Maintenance' as DeviceStatus,
    ThermalDisinfectionClosed: 'ThermalDisinfectionClosed' as DeviceStatus,
    ThermalDisinfectionOpen: 'ThermalDisinfectionOpen' as DeviceStatus,
    Remote: 'Remote' as DeviceStatus,
    Unlinked: 'Unlinked' as DeviceStatus,
    ErrorBackendRemote: 'ErrorBackendRemote' as DeviceStatus,
    Unknown: 'Unknown' as DeviceStatus,
    ErrorBackend: 'ErrorBackend' as DeviceStatus,
    ErrorDevice: 'ErrorDevice' as DeviceStatus
};
