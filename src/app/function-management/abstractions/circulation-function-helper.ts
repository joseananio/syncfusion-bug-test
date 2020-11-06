import {
  FunctionsInput,
  TemperatureLevelCirculation,
} from 'src/app/core/services';
import { FunctionsInputModel } from './functions-input-model';
import { DefaultFunctionHelper } from './default-function-helper';

export class CirculationFunctionHelper extends DefaultFunctionHelper {
  public static getTemperatureLevelEnum(idx: string | number | TemperatureLevelCirculation): TemperatureLevelCirculation {
    switch (idx) {
      default:
      case 1:
      case TemperatureLevelCirculation.DefaultNoUfc:
        return TemperatureLevelCirculation.DefaultNoUfc;
      case 2:
      case TemperatureLevelCirculation.UfcLower:
        return TemperatureLevelCirculation.UfcLower;
      case 3:
      case TemperatureLevelCirculation.UfcLowest:
        return TemperatureLevelCirculation.UfcLowest;
      case 4:
      case TemperatureLevelCirculation.UfcManualConfig:
        return TemperatureLevelCirculation.UfcManualConfig;
    }
  }

  public static getTemperatureLevel(lvl: any) {
    const lvlConverted = parseInt(lvl, 10);
    switch (lvlConverted) {
      case 2: return TemperatureLevelCirculation.UfcLower;
      case 3: return TemperatureLevelCirculation.UfcLowest;
      case 4: return TemperatureLevelCirculation.UfcManualConfig;
      default: return TemperatureLevelCirculation.DefaultNoUfc;
    }
  }

  public isModelValid(model: FunctionsInput | FunctionsInputModel, args: { [key: string]: any } = {}): boolean {
    switch (args.activeStepIndex) {
      /*
      * Form step 2 - device and temperature selection
      */
      case 1: {
        const circulationUUids = Object.keys(model.circulationValveConfigurationMapping);

        // if not circulation devices are selected: DTEUUid needs to be set
        if (circulationUUids.length === 0) {
          return !!model.dteUuid;
        }

        // all circulation functions need to have the first level set
        const validCirculationUUids = circulationUUids.filter((deviceUuid) => {
          const mapping = model.circulationValveConfigurationMapping[deviceUuid];
          return mapping && mapping.targetTemperatureMapping && mapping.targetTemperatureMapping.DefaultNoUfc;
        });

        return circulationUUids.length === validCirculationUUids.length;
      }

      /*
      * Form step 3
      */
      case 2: {
        if (!model.dteUuid || !model.circulationInput || !model.circulationInput.temperatureLevelObject) {
          return false;
        }

        // Level 4 - UfcManualConfig: Both values need to be set
        if (TemperatureLevelCirculation.UfcManualConfig === model.circulationInput.temperatureLevelObject.temperatureLevel) {
          return !!model.circulationInput.temperatureLevelObject.pwhTemperatureCelsius
            && !!model.circulationInput.temperatureLevelObject.pwhcTemperatureCelsius;
        }

        // not custom: Any one needs to be set
        return !!model.circulationInput.temperatureLevelObject.temperatureLevel;
      }
      /*
      * Form step 1: name and function type selection
      */
      default: return super.isModelValid(model, args);
    }
  }

  public formatModelForSaving(model: FunctionsInputModel) {
    // without DTE: Reset circulation input
    if (!model.dteUuid) {
      model.circulationInput.temperatureLevelObject.temperatureLevel ||= TemperatureLevelCirculation.DefaultNoUfc;

      // make it an else if because we can save one compare here. These values will only be relevant for DTE cases
    } else if (model.circulationInput.temperatureLevelObject.temperatureLevel !== TemperatureLevelCirculation.UfcManualConfig) {
      delete model.circulationInput.temperatureLevelObject.pwhTemperatureCelsius;
      delete model.circulationInput.temperatureLevelObject.pwhcTemperatureCelsius;
    }

    delete model.flushableDevicePointUuids;
    delete model.flushSchedule;

    return super.formatModelForSaving(model);
  }

  public shouldViewInclude(model: FunctionsInput | FunctionsInputModel, viewElement: string): boolean {
    return ['circulation', 'dte', 'noflushing'].includes(viewElement);
  }
}
