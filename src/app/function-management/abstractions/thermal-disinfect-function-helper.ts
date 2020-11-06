import { FunctionsInput } from 'src/app/core/services';
import { DefaultFunctionHelper } from './default-function-helper';
import { FunctionsInputModel } from './functions-input-model';

export class ThermalDisinfectionHelper extends DefaultFunctionHelper {
  formatModelForSaving(model: FunctionsInputModel, args: { [key: string]: any } = {}) {
    // FunctionTypesEx.ThermalDisinfection:
    delete model.flushSchedule;
    delete model.circulationInput;
    return super.formatModelForSaving(model);
  }

  public shouldViewInclude(model: FunctionsInput | FunctionsInputModel, viewElement: string): boolean {
    return ['thermal', 'circulationDevice', 'dte', 'keySwitch', 'temperature', 'noflushing'].includes(viewElement);
  }
}
