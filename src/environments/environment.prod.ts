export const environment = {
  production: true,

  // Optional features
  includeDeviceMainenance: true,  // TODO: Remove flag if we plan not to disable this again
  includeControllerOverview: false,
  allowGridFiltering: false,
  includeWireSensDevicePoints: true,  // TODO: Remove when no longer needed for testing
  includeCanFirmwareUpdate: true,  // TODO: Remove flag if we plan not to disable this again
  allowUnsignedDeviceFirmwareFiles: true,  // TODO: Disable for real-world use
  ignoreMessageAuthorityFlags: true,  // TODO: Disable when flags set correctly in the backend
  hideViewedTime: true,
};
