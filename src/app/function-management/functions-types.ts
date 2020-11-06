import { DevicePointOutputDto, FunctionTypes } from 'src/app/core/services';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';

export interface LocalFunctionType {
  name: string;
  id: string;
  details: string[];
  message?: string;
  disabled: boolean;
}

export interface DevicePointOutputDtoWithStatus extends DevicePointOutputDto {
  isChecked?: boolean;
  isDisabled?: boolean;
}

export const noDeviceNeutrum: DevicePointOutputDto = { name: _('FUNCTIONS.NO_DEVICE_NEUTRAL'), uuid: null };
export const noDeviceMale: DevicePointOutputDto = { name: _('FUNCTIONS.NO_DEVICE_MALE'), uuid: null };

/* */
export const defaultDevices: DeviceGroups = {
  circulationDevices: [],
  dteDevices: [noDeviceNeutrum],
  flushableDevices: [],
  keySwitchDevices: [noDeviceMale],
  temperatureSensors: [noDeviceMale],
};

/**
 * Devices are filtered into categories for sub views in an object.
 * Temperature devices for optional model.temperatureSensorPwcDevicePointUuid temperature sensor selection.
 */
export interface DeviceGroups {
  all?: DevicePointOutputDto[];
  circulationDevices: DevicePointOutputDto[];
  dteDevices: DevicePointOutputDtoWithStatus[];
  flushableDevices: DevicePointOutputDtoWithStatus[];
  keySwitchDevices: DevicePointOutputDtoWithStatus[];
  temperatureSensors: DevicePointOutputDto[];
}

export const FunctionTypesEx = Object.freeze({
  HygieneFlushInterval: `${FunctionTypes.HygieneFlush}__interval`,
  HygieneFlushCalendar: `${FunctionTypes.HygieneFlush}__calendar`,
  HygieneFlushNutzung: `${FunctionTypes.HygieneFlush}__nutzung`,
  ThermalDisinfection: FunctionTypes.ThermalDisinfection,
  Circulation: FunctionTypes.Circulation,
});
