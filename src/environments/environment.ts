// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,

  // Include the maintenance tab in the device details
  includeDeviceMainenance: true,
  // Include controller overview tab
  includeControllerOverview: true,
  allowGridFiltering: true,
  // Include WireSens device points - for development and testing only
  includeWireSensDevicePoints: true,
  // Include firmware update button for CAN devices
  includeCanFirmwareUpdate: true,
  // Allow unsigned *.bin files as device firmware for development. In production only *.tar files are going
  // to be used.
  allowUnsignedDeviceFirmwareFiles: true,
  // The VIEW_EVENT_TYPE_* authority flags are currently not set correctly in the backend. So lets
  // ignore them.
  ignoreMessageAuthorityFlags: true,
  // Hide the "viewedTime" of notifications. The backend has this feature, but we don't do anything with it.
  hideViewedTime: true,
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
