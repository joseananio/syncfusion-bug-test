import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import {
  EventTypes,
  DeviceUpdateFailedStatus,
  FlushPipeType,
  HygieneCleansingFailedDeviceReason,
  ThermalDisinfectionFailedDeviceReason,
  ThermalDisinfectionFailedReason,
  ThermalDisinfectionResetDeviceFailedReason,
} from 'src/app/core/services';
import { DateTimeService } from 'src/app/core/services/local-services/datetime.service';

@Injectable({
  providedIn: 'root',
})
export class MessageToolsService {
  // TODO(schuster): Resolve the following enums in nested fields: FunctionTypes, TemperatureLevelCirculation, OutputDataType,
  //   TemperatureLevelCirculation

  // Map enum parameters to their enum.
  private static MESSAGE_PART_ENUMS = {
    eventType: EventTypes,
    deviceUpdateFailedStatus: DeviceUpdateFailedStatus,
    flushPipeType: FlushPipeType,
    hygieneCleansingFailedDeviceReason: HygieneCleansingFailedDeviceReason,
    thermalDisinfectionFailedDeviceReason: ThermalDisinfectionFailedDeviceReason,
    thermalDisinfectionFailedReason: ThermalDisinfectionFailedReason,
    thermalDisinfectionResetDeviceFailedReason: ThermalDisinfectionResetDeviceFailedReason,
  };

  constructor(
    private translateService: TranslateService,
    private dateTimeService: DateTimeService,
  ) {
  }

  public renderMessageDescription(messageDescription: string): string {
    return messageDescription
      .replace(/(\\r)?\\n/g, '')  // remove line breaks
      .replace(/\\"/g, '"');  // render quotes
  }

  /**
   * Parses a message parameter string and returns an object of message parameters.
   */
  public getMessageParameters(parameters: Object): Object {
    const result = typeof parameters === 'object' ? parameters : {};
    const PLACEHOLDER = '-';
    // control rendering of list parameters
    const arrayToString = function arrayToString(this: any[]) { return this.join('", "'); };

    Object.keys(result).forEach((key) => {
      if (result[key] !== undefined && result[key] !== null && MessageToolsService.MESSAGE_PART_ENUMS[key]) {
        // Handle rendering of enum field

        let enumKey: string;
        if (Number.isInteger(result[key])) {
          // legacy DBs can contain enum index numbers
          const objectKeys = Object.keys(key);
          // Yes, we are relying on key order here. This is actually okay today - even in IE11.
          enumKey = objectKeys ? objectKeys[result[key]] : PLACEHOLDER;
        } else {
          enumKey = result[key];
        }
        // Using the synchronous interface instead of get() is a tiny cheat. But keeping the data
        // flow synchronous here make things way easier.
        result[key] = this.translateService.instant(enumKey);
      } else if (this.dateTimeService.isISOString(result[key])) {
        // Take care of proper timestamp rendering

        const timeStamp = new Date(result[key]);
        const locale = this.translateService.currentLang;
        result[key] = `${timeStamp.toLocaleDateString(locale)} ${timeStamp.toLocaleTimeString(locale)}`;
      } else if (result[key] instanceof Array) {
        // Take care of proper array rendering

        result[key].toString = arrayToString;
      }
    });

    return result;
  }
}
