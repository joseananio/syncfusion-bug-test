import {
  FlushScheduleInput,
  FunctionTypes,
  CirculationInput,
  CirculationValveConfiguration,
  FunctionsInput,
  DevicePointOutputDto,
  FunctionDto,
  WeeklyFlushPlan,
  WeekDays,
  TemperatureLevelCirculation,
  AuthorityCodes,
} from 'src/app/core/services';
import { moveItemInArray } from '@angular/cdk/drag-drop';
import { CirculationFunctionHelper } from './circulation-function-helper';
import { DeviceTypeName } from '../../core/services/model/deviceTypeName';
import {
  DevicePointOutputDtoWithStatus,
  noDeviceNeutrum,
  defaultDevices,
  DeviceGroups,
  FunctionTypesEx,
  LocalFunctionType,
  noDeviceMale,
} from '../functions-types';
import { FunctionHelperFactory } from '../../function-management/abstractions/function-helper-factory';
import {
  SetTemperatureValueInputDto,
} from '../forms/form-function-step-two/function-temperature-level/function-temperature-service.service';
import { FunctionDtoEx } from '../forms/abstract-form-function-step/abstract-form-function-step.component';
import { FunctionHelper } from './default-function-helper';

const deviceFilters = {
  circulationDevices: ['zirk-e'],
  dteDevices: ['dte'],
  flushableDevices: ['wall-e', 'beat-e', 'rulantica'],
  keySwitchDevices: ['keyswitch'],
  temperatureSensors: ['sense-e', 'temperaturesensor'],
};
// TODO: [Baumgarten] remove "extends FunctionsInput"
export class FunctionsInputModel implements FunctionsInput {
  /**
   * Is the function disabled?
   */
  disabledTimestamp?: string;

  private _flushSchedule?: FlushScheduleInput = {
    flushParallel: false,
    dependOnStagnationFlushPlan: {
      intervalHours: 72,
    },
    fixIntervalFlushPlan: {
      startDateUtc: null,
      intervalHours: 72,
    },
    dependOnTemperatureFlushPlan: {
      activated: false,
    },
    noFlushFrame: {
      fromHourMinute: null,
      toHourMinute: null,
    },
  };

  get flushSchedule(): FlushScheduleInput {
    return this._flushSchedule;
  }

  set flushSchedule(_value: FlushScheduleInput) {
    const value = _value || {};
    Object.keys(value).forEach((key) => {
      if (!value[key]) { delete value[key]; }
    });
    this._flushSchedule = { ...this._flushSchedule, ...value };
  }

  /**
   * true = use legacy versions of flush and thermal disinfection
   */
  legacy?: boolean;

  /**
   * Name of the function.  Has to be unique, must be used as ID.
   * If the name is changed, cache the previous name - it'll be used to filter devices that can't be used again
   */

  name: string;

  private previousName: string;

  remark = 'remark';

  private _type: FunctionTypes = '' as FunctionTypes;

  get type(): FunctionTypes {
    return this._type;
  }

  set type(value: FunctionTypes) {
    this._type = value;

    if (value === FunctionTypes.HygieneFlush) {
      if (this._flushSchedule.weeklyFlushPlan) {
        this._type = FunctionTypesEx.HygieneFlushCalendar as FunctionTypes;
      } else if (this._flushSchedule.fixIntervalFlushPlan.startDateUtc) {
        this._type = FunctionTypesEx.HygieneFlushInterval as FunctionTypes;
      } else {
        this._type = FunctionTypesEx.HygieneFlushNutzung as FunctionTypes;
      }
    }

    /*
    * Type for hygiene flush function was read, now init arrays with default values
    * to avoid exceptions in the dialogue
    */
    this._flushSchedule.weeklyFlushPlan ||= { weekDays: {} } as WeeklyFlushPlan;
    this._flushSchedule.weeklyFlushPlan.weekDays ||= {} as WeekDays;

    // initialize object helper. Will only be initialized once.
    this._helper = FunctionHelperFactory.getHelper(this.type);

    if (this.isCirculationFunction()) {
      this.flushableDevicePointUuids = [];
    }
    Object.keys(this._circulationValveConfigurationMapping).forEach((uuid) => this.flushableDevicePointUuids.push(uuid));

    this.mapDeviceAndFunctionStatus();
  }

  _circulationInput: CirculationInput = { temperatureLevelObject: {} };

  get circulationInput(): CirculationInput {
    return this._circulationInput;
  }

  set circulationInput(_value: CirculationInput) {
    if (!_value && this.allowDelete) {
      delete this._circulationInput;
    } else {
      const value: CirculationInput = _value || { temperatureLevelObject: {} };
      value.temperatureLevelObject ||= {};
      this._circulationInput = value;
    }
  }

  /**
   * uuid of the key switch
   */
  private _keySwitchUuid?: string = null;

  get keySwitchUuid(): string {
    return this._keySwitchUuid;
  }

  set keySwitchUuid(value: string) {
    this._keySwitchUuid = value;
    this.selectedKeySwitchDevice = this.devices.keySwitchDevices.find((device) => device.uuid === value);
  }

  /**
   * Uuid for the DTE (water heating element)
   */
  private _dteUuid?: string = null;

  get dteUuid(): string {
    return this._dteUuid;
  }

  set dteUuid(value: string) {
    this._dteUuid = value;
    this.selectedDTEDevice = this._allDevices.find((device) => device.uuid === value) || noDeviceNeutrum;
    this.updateUfcFaultContactId();
  }

  private updateUfcFaultContactId() {
    const selectedUfcFaultContact = this.devicePointList
      .filter((devicePoint) => devicePoint.deviceTypeName === DeviceTypeName.UfcFaultContact)
      .find((ufcItem) => ufcItem.controllerPoint_UUID === this.selectedDTEDevice.controllerPoint_UUID);
    this.ufcFaultContactUuid = selectedUfcFaultContact ? selectedUfcFaultContact.uuid : null;
    this.isUfcAvailable = !!this.ufcFaultContactUuid;
  }

  /**
   * Sensor for pwc
   */
  private _temperatureSensorPwcDevicePointUuid?: string = null;

  get temperatureSensorPwcDevicePointUuid(): string {
    return this._temperatureSensorPwcDevicePointUuid;
  }

  set temperatureSensorPwcDevicePointUuid(value: string) {
    this._temperatureSensorPwcDevicePointUuid = value;
    this.selectedTemperatureDevice = this.devices.temperatureSensors.find((device) => device.uuid === value) || noDeviceMale;
  }

  /**
   * Will be passed from creating dialogue to have everything in one place.
   */
  public authorities: Set<AuthorityCodes> = new Set();

  /**
   * Uuid for UFC fault contact, only allowed for a circulation function
   */
  ufcFaultContactUuid: string = null;

  isUfcAvailable?: boolean = false;

  updateUfFaultContactUuid() {
    const devicePoint = this.devicePointList
      .filter((dP) => dP.deviceTypeName === DeviceTypeName.UfcFaultContact)
      .find((ufcItem) => ufcItem.controllerPoint_UUID === this.selectedDTEDevice.controllerPoint_UUID) || noDeviceNeutrum;
    this.ufcFaultContactUuid = devicePoint.uuid;
  }

  /**
   * Use UFC, only allowed for a circulation function.
   */
  public useUFC = false;

  get canSetUfc(): boolean {
    return this.isUfcAvailable && this.authorities.has(AuthorityCodes.SHOWCIRCULATIONUFCAVAILABLEFIELD);
  }

  /**
   * Device uuid's for the flush operation  The first element will be flushed first, the second element will be flushed second and so on.
   */
  flushableDevicePointUuids?: Array<string> = [];

  /**
   * List of circulation valves
   */
  _circulationValveConfigurationMapping?: { [key: string]: CirculationValveConfiguration; } = {};

  get circulationValveConfigurationMapping(): { [key: string]: CirculationValveConfiguration } {
    return this._circulationValveConfigurationMapping;
  }

  set circulationValveConfigurationMapping(value: { [key: string]: CirculationValveConfiguration }) {
    this._circulationValveConfigurationMapping = value;
    if (this.isCirculationFunction()) {
      this.flushableDevicePointUuids = Object.keys(this._circulationValveConfigurationMapping);
    }
  }

  setCirculationMappingValue(deviceUuid: string, key: string | TemperatureLevelCirculation, value: string | number) {
    if (!deviceUuid) {
      return;
    }
    this.circulationValveConfigurationMapping[deviceUuid] ||= { targetTemperatureMapping: {} };
    this.circulationValveConfigurationMapping[deviceUuid].targetTemperatureMapping ||= {};

    if (!!key && (!value || value === '')) {
      delete this.circulationValveConfigurationMapping[deviceUuid].targetTemperatureMapping[key];
    } else if (!!key && !!value) {
      this.circulationValveConfigurationMapping[deviceUuid].targetTemperatureMapping[key] = `${value}`;
    }
  }

  getCirculationMappingValue(deviceUuid: string, key: string | TemperatureLevelCirculation): number {
    if (!deviceUuid) {
      return null;
    }
    this.circulationValveConfigurationMapping[deviceUuid] ||= { targetTemperatureMapping: {} };
    this.circulationValveConfigurationMapping[deviceUuid].targetTemperatureMapping ||= {};
    return this.circulationValveConfigurationMapping[deviceUuid].targetTemperatureMapping[key];
  }

  /**
   * ====================================================================================================
   * Properties beyond BE interface below this line
   * ====================================================================================================
   */
  selectedFunctionType?: LocalFunctionType;

  allowDelete = false;

  isUpdate?: boolean;

  private _helper: FunctionHelper = FunctionHelperFactory.default;

  get helper(): FunctionHelper {
    return this._helper;
  }

  lastTemperatureInput: SetTemperatureValueInputDto;

  /*
  * Hold these in model as properties, so the dialogues don't have to bother.
  * They will be updated when devices is written
  */
  selectedKeySwitchDevice: DevicePointOutputDto = noDeviceNeutrum;

  /*
  * Hold these in model as properties, so the dialogues don't have to bother.
  * They will be updated when devices is written
  */
  selectedTemperatureDevice: DevicePointOutputDto = noDeviceNeutrum;

  selectedDTEDevice: DevicePointOutputDto = noDeviceNeutrum;

  private compatibleFunctionsList: FunctionDtoEx[] = [];

  private _allFunctionsList: FunctionDtoEx[] = [];

  get allFunctionsList(): FunctionDtoEx[] {
    return this._allFunctionsList;
  }

  set allFunctionsList(value: FunctionDtoEx[]) {
    this._allFunctionsList = value;
    this.mapDeviceAndFunctionStatus();
  }
  //#endregion

  private mapDeviceAndFunctionStatus() {
    // if circulation function: Set flushable device list to keys from object
    if (this.isCirculationFunction()) {
      this.flushableDevicePointUuids = Object.keys(this.circulationValveConfigurationMapping);
    }

    /*
     * Set list of compatible functions for for dialogue page 2. Exclude self.
     * Will allow copying existing functions for non-Circulation functions.
     */
    this.compatibleFunctionsList = this._allFunctionsList.filter(
      (func) => (this.type.length === 0 || this.type.startsWith(func.type)) // function type is compatible
        && (this.name !== func.name && this.previousName !== func.name), // self not included
    );
    this.updateDeviceAvailability();
  }

  private updateDeviceAvailability() {
    // gather all devices that are already mapped to functions. Put into set to avoid name duplication.
    const uniqueFunctionDevices: Set<string> = new Set();

    /*
    *  In case of Circulation function: Devices can only be assigned to exactly one of them.
    */
    if (this.isCirculationFunction()) {
      this.compatibleFunctionsList.forEach((func) => {
        Object.keys(func.circulationValveConfigurationMapping || {}).forEach((uuid) => uniqueFunctionDevices.add(uuid));
        if (func.dteUuid) uniqueFunctionDevices.add(func.dteUuid);
      });
    }

    /*
    * Allow selecting of devices in modal dialogue if they're not exclusively assigned to another function
    * (or otherwise not available - TODO: Do we really need three of these?)
    */
    this.allDevices.forEach((device) => {
      this.setDeviceStatus(device, uniqueFunctionDevices.has(device.uuid), this.isDeviceSelected(device.uuid));
    });

    this.getAllFlushableDevices().forEach((device) => {
      this.setDeviceStatus(device, uniqueFunctionDevices.has(device.uuid), this.isDeviceSelected(device.uuid));
    });

    Object.keys(this.devices).forEach((key) => this.devices[key].forEach((device) => {
      this.setDeviceStatus(device, uniqueFunctionDevices.has(device.uuid), this.isDeviceSelected(device.uuid));
    }));

    /*
    * Update selected devices by uuid - this will save a _lot_ of repeated filtering on collections
    * inside the templates
    */
    this.selectedDTEDevice = this.devices.dteDevices.find((d) => d.uuid === this.dteUuid) || noDeviceNeutrum;
    this.selectedKeySwitchDevice = this.devices.keySwitchDevices.find((d) => d.uuid === this._keySwitchUuid) || noDeviceNeutrum;
    this.selectedTemperatureDevice = this.devices.temperatureSensors.find((d) => d.uuid === this._temperatureSensorPwcDevicePointUuid)
    || noDeviceMale;

    // TWMS2020-3458: Map fault contact ID from DTE if not set
    if (this.dteUuid && !this.ufcFaultContactUuid) {
      this.updateUfcFaultContactId();
    }
  }

  private setDeviceStatus(device: DevicePointOutputDtoWithStatus, isDisabled: boolean, isChecked: boolean) {
    if (isDisabled) {
      device.isDisabled = true;
    } else {
      delete device.isDisabled;
    }
    if (isChecked) {
      device.isChecked = true;
    } else {
      delete device.isChecked;
    }
  }

  /**
   * Store device points in model, so we only need to query them once.
   */
  private _devicePointList: DevicePointOutputDto[] = [];

  get devicePointList(): DevicePointOutputDto[] {
    return this._devicePointList;
  }

  set devicePointList(value: DevicePointOutputDto[]) {
    this._devicePointList = value;
    this.devices.temperatureSensors = this._devicePointList.filter((point) => point.deviceTypeName === DeviceTypeName.TemperatureSensor);
    this.mapDeviceAndFunctionStatus();
  }

  //#region devices - all and those compatible to current function type
  private _devices: DeviceGroups = { ...defaultDevices };

  get devices(): DeviceGroups {
    return this._devices;
  }

  set devices(value: DeviceGroups) {
    /*
    * Do not ever _delete_ the devices. If nothing is set, reset to default
    */
    Object.keys(defaultDevices).forEach((key) => {
      if (Object.keys((value || [])[key] || []).length === 0) {
        value[key] = [...defaultDevices[key]];
      }
    });
    this._devices = value;

    this.mapDeviceAndFunctionStatus();
  }

  private _allDevices: DevicePointOutputDtoWithStatus[] = [];

  /**
   * For internal easy access of devices by id. Saves constant filtering.
   */
  private _allDevicesMap: Map<string, DevicePointOutputDtoWithStatus> = new Map();

  get allDevices(): DevicePointOutputDtoWithStatus[] {
    return this._allDevices;
  }

  set allDevices(value: DevicePointOutputDtoWithStatus[]) {
    this._allDevices = (value || []).filter((devicePoint) => devicePoint.disabledTimestamp === null);

    // hold them in a key-value storage by UUID to operate on them in calling classes
    this._allDevicesMap.clear();
    this._allDevices.filter((d) => !!d.uuid).forEach((device) => { this._allDevicesMap[device.uuid] = device; });

    this._devices = { ...defaultDevices };

    /**
     * Make sure none of these are empty or absent. This will lead to exceptions in the dialogues.
     */
    Object.keys(deviceFilters).forEach((key) => {
      const dList = this._allDevices.filter((device) => deviceFilters[key].includes(device.deviceTypeName.toLocaleLowerCase()));
      this._devices[key] = [...this._devices[key], ...dList];
    });

    this.mapDeviceAndFunctionStatus();
  }

  /* For circulation functions: flushable devices will only include Zirk-E */
  public getAllFlushableDevices(): DevicePointOutputDtoWithStatus[] {
    return this.isCirculationFunction() ? this.devices.circulationDevices : this.devices.flushableDevices;
  }

  /**
   * Helper function. Has to maintain order, so will iterate each time.
   */
  public getSelectedFlushableDevices(): DevicePointOutputDtoWithStatus[] {
    return this.getAllFlushableDevices()
      .filter((device) => this.flushableDevicePointUuids.includes(device.uuid))
      .sort((a, b) => this.flushableDevicePointUuids.indexOf(a.uuid) - this.flushableDevicePointUuids.indexOf(b.uuid));
  }

  public getAllSelectedDeviceUuids(onlyUseFlushableDevices = false): string[] {
    const ret = [...this.flushableDevicePointUuids];
    if (!onlyUseFlushableDevices) {
      if (this.dteUuid) { ret.push(this.dteUuid); }
      if (this._keySwitchUuid) { ret.push(this._keySwitchUuid); }
      if (this._temperatureSensorPwcDevicePointUuid) { ret.push(this._temperatureSensorPwcDevicePointUuid); }
    }
    return ret;
  }

  /**
   * Moves a device in the internal data tables. Double mapping to save constant filtering.
   * TODO: Maybe refactor?
   *
   * @param previousIndex current index
   * @param nextIndex future index
   */
  public moveFlushableDeviceInArray(previousIndex, nextIndex) {
    // Move index directly
    moveItemInArray(this.flushableDevicePointUuids, previousIndex, nextIndex);

    if (!this.isCirculationFunction()) {
      return;
    }

    // do not access via getter/setter - will otherwise dump the array
    const oldMapping = this._circulationValveConfigurationMapping;
    this._circulationValveConfigurationMapping = {};
    this.flushableDevicePointUuids.forEach((uuid) => {
      this._circulationValveConfigurationMapping[uuid] = oldMapping[uuid];
    });
  }

  /**
   * Helper method: Is the device uuid selected for the current device?
   *
   * @param uuid a string, can be null or undefined
   * @param onlyUseFlushableDevices optional: Limit this to flushable device points
   * @returns true or false: Is this device selected for the current function?
   */
  public isDeviceSelected(uuid: string, onlyUseFlushableDevices = false) {
    if (!uuid) {
      return false;
    }
    return this.getAllSelectedDeviceUuids(onlyUseFlushableDevices).includes(uuid);
  }

  //#endregion

  public setDeviceSelection(deviceUuid: string, doAdd = false) {
    const device = deviceUuid ? this._allDevicesMap[deviceUuid] : null;
    /*
     * only remove it if it's selected at all
     */
    if (this.isDeviceSelected(deviceUuid) === doAdd) {
      return device;
    }
    if (device.deviceTypeName === DeviceTypeName.ZirkE) {
      if (doAdd) {
        this.circulationValveConfigurationMapping[device.uuid] = { targetTemperatureMapping: {} };
      } else {
        delete this.circulationValveConfigurationMapping[device.uuid];
      }
    }
    switch (device.deviceTypeName) {
      default:
        if (doAdd) {
          this.flushableDevicePointUuids.push(device.uuid);
        } else {
          this.flushableDevicePointUuids = this.flushableDevicePointUuids.filter((d) => d !== device.uuid);
        }
        break;

      case DeviceTypeName.DTE:
        this.dteUuid = doAdd ? device.uuid : null;
        break;
      case DeviceTypeName.KeySwitch:
        this.keySwitchUuid = doAdd ? device.uuid : null;
        break;
      case DeviceTypeName.TemperatureSensor:
        this.temperatureSensorPwcDevicePointUuid = doAdd ? device.uuid : null;
    }
    return device;
  }

  public getCompatibleFunctions(): FunctionDtoEx[] {
    return this.compatibleFunctionsList;
  }

  public isCirculationFunction(): boolean {
    return FunctionTypes.Circulation === this.type;
  }

  public isHygieneFlushFunction(): boolean {
    return !!this.type && this.type.startsWith(FunctionTypes.HygieneFlush);
  }

  public isThermalDisinfectFunction(): boolean {
    return FunctionTypes.ThermalDisinfection === this.type;
  }

  public isTemperatureLevelSetInCircE(idx: string | number | TemperatureLevelCirculation) {
    if (!this.isCirculationFunction() || !this.circulationInput || !this.circulationInput.temperatureLevelObject) {
      return false;
    }
    const allMappings = Object.values(this.circulationValveConfigurationMapping);
    const targetLevel = CirculationFunctionHelper.getTemperatureLevelEnum(idx);
    const validMappings = allMappings.filter((m) => m.targetTemperatureMapping && m.targetTemperatureMapping[targetLevel]);
    return allMappings.length === validMappings.length;
  }

  constructor(functionsData: FunctionDto = {
    name: null,
    remark: 'remark',
    type: null,
  }) {
    // TWMS2020-3458: remove this once BE provides correct value
    if (functionsData && functionsData.ufcFaultContactUuid) {
      functionsData.useUFC = true;
    }
    Object.assign(this, functionsData);

    this.circulationValveConfigurationMapping ||= {};
    this.circulationInput ||= { temperatureLevelObject: {} };
    this.circulationInput.temperatureLevelObject ||= {};

    this.previousName = this.name;

    // TODO [Refactoring] Dirty hack to make sure the device radio buttons on the 2nd page will be selected
    if (undefined === this.dteUuid) {
      this.dteUuid = null;
    }
    if (undefined === this.temperatureSensorPwcDevicePointUuid) {
      this.temperatureSensorPwcDevicePointUuid = null;
    }

    const startDate = new Date(this.flushSchedule.fixIntervalFlushPlan.startDateUtc);
    if (!this.flushSchedule.fixIntervalFlushPlan.startDateUtc) {
      const minutes = startDate.getMinutes();
      const modValue = minutes >= 30 ? 60 : 30;
      startDate.setMinutes(minutes + Math.abs(minutes - modValue));
    }
    this.flushSchedule.fixIntervalFlushPlan.startDateUtc = startDate.toISOString();

    this.mapDeviceAndFunctionStatus();
  }

  public hasTemperatureFlushPlan(): boolean {
    return this.flushSchedule.dependOnTemperatureFlushPlan && this.flushSchedule.dependOnTemperatureFlushPlan.activated;
  }

  public isFunctionNameEqual(otherName: string): boolean {
    return this.name === otherName || (this.previousName && this.previousName === otherName);
  }

  public toFunctionsInput() {
    const ret: FunctionsInput = {
      disabledTimestamp: this.disabledTimestamp,
      flushSchedule: this.flushSchedule,
      legacy: this.legacy,
      name: this.name,
      remark: this.remark,
      type: this.type,
      circulationInput: this.circulationInput,
      keySwitchUuid: this.keySwitchUuid,
      dteUuid: this.dteUuid,
      // TWMS2020-3458: We indicate that the function should use an UFC by providing ufcFaultContactUuid.
      // The boolean will be ignored in the BE for now. The null-key will be removed in the next loop.
      ufcFaultContactUuid: this.useUFC ? this.ufcFaultContactUuid : null,
      useUFC: this.useUFC,
      circulationValveConfigurationMapping: this.circulationValveConfigurationMapping,
      flushableDevicePointUuids: this.flushableDevicePointUuids,
      temperatureSensorPwcDevicePointUuid: this.temperatureSensorPwcDevicePointUuid,
    };

    // delete all unset keys so the BE doesn't throw an error
    Object.keys(ret).filter((key) => !ret[key]).forEach((key) => delete ret[key]);
    return this.helper.formatModelForSaving(ret);
  }

  public isValid(args: { [key: string]: any } = {}): boolean {
    return this.helper.isModelValid(this, args);
  }
}
