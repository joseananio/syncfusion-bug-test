import { Injectable } from '@angular/core';
import { FunctionsInput } from 'src/app/core/services';

export interface SetTemperatureValueInputDto {
  target: string;
  value: string;
  deviceUUId;
}
@Injectable({
  providedIn: 'root',
})
export class FunctionTemperatureServiceService {
  private temperatureValues: any = {};

  targetValues = {
    DefaultNoUfc: 'FUNCTIONS.TEMPERATURE_LEVEL_1',
    UfcLower: 'FUNCTIONS.TEMPERATURE_LEVEL_2',
    UfcLowest: 'FUNCTIONS.TEMPERATURE_LEVEL_3',
    UfcManualConfig: 'FUNCTIONS.TEMPERATURE_LEVEL_4',

  };

  constructor() {}

  setTemperatureValue(input: SetTemperatureValueInputDto) {
    if (input.value) {
      if (!this.temperatureValues[input.deviceUUId]) {
        this.temperatureValues[input.deviceUUId] = {};
      }
      this.temperatureValues[input.deviceUUId][input.target] = input.value || {};
    } else if (this.temperatureValues[input.deviceUUId]) {
      this.temperatureValues[input.deviceUUId][input.target] = undefined;
    }
  }

  getTemperatureValues() {
    return this.temperatureValues;
  }

  buildTemperatureFromModel(model: FunctionsInput) {
    const tempMappings = model.circulationValveConfigurationMapping || {};
    const deviceIds = Object.keys(tempMappings);
    deviceIds.forEach((id) => {
      const targetObject = tempMappings[id]['targetTemperatureMapping'];
      const targetLevel = Object.keys(targetObject);
      targetLevel.forEach((level1) => {
        const input: SetTemperatureValueInputDto = { deviceUUId: id, target: this.targetValues[level1], value: targetObject[level1] };
        this.setTemperatureValue(input);
      });
    });
  }
}
