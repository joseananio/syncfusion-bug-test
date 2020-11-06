import { DeviceTypeName } from 'src/app/core/services';

export const RESETABLE_DEVICE_TYPES = new Set<string>([
  DeviceTypeName.WallE,
  DeviceTypeName.BeatE,
  DeviceTypeName.ZirkE,
  DeviceTypeName.DTE,
  DeviceTypeName.Rulantica,
  'Controller',
]);

export const LOCATABLE_DEVICE_TYPES = new Set<string>([
  DeviceTypeName.WallE,
  DeviceTypeName.BeatE,
  DeviceTypeName.ZirkE,
  DeviceTypeName.Rulantica,
]);

/**
 * Device types that provide a wall outlet.
 * Beat-E is not included here, because the user cannot get in touch with the flushing water.
 */
export const WALL_OUTLET_DEVICE_TYPES = new Set<string>([
  DeviceTypeName.WallE,
  DeviceTypeName.Rulantica,
  DeviceTypeName.RulanticaT,
]);

/**
 * An unsharp comparision of device type names. This takes synonymous names and inconsistent casing
 * into account.
 */
export function equalsDeviceType(left: string, right: string): boolean {
  // For the Hyplus type the casing is not consistent - so let's convert everything to lower case.
  return left.toLowerCase() === right.toLowerCase()
         || (left === DeviceTypeName.Rulantica && right === 'Europapark')
         || (left === 'Europapark' && right === DeviceTypeName.Rulantica);
}
