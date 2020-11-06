import { FunctionTypes } from 'src/app/core/services';
import { CirculationFunctionHelper } from './circulation-function-helper';
import { ThermalDisinfectionHelper } from './thermal-disinfect-function-helper';
import { DefaultFunctionHelper, FunctionHelper } from './default-function-helper';
import { HygieneFlushHelper } from './hygiene-flush-function-helper';
import { DateTimeService } from '../../core/services/local-services';
import { FunctionTypesEx } from '../functions-types';

export class FunctionHelperFactory {
  static helpers: Map<FunctionTypes | string, FunctionHelper> = new Map();

  static default: FunctionHelper = new DefaultFunctionHelper();

  static dateSvc: DateTimeService;

  static setDateService(dateSvc: DateTimeService) {
    FunctionHelperFactory.dateSvc = dateSvc;
  }

  static get(type: FunctionTypes | string): FunctionHelper {
    const hlp = FunctionHelperFactory.helpers;

    if (hlp.has(type)) {
      return hlp.get(type);
    }

    switch (type) {
      case FunctionTypes.Circulation:
      case FunctionTypesEx.Circulation:
        hlp.set(type, new CirculationFunctionHelper());
        return hlp.get(type);
      case FunctionTypes.ThermalDisinfection:
      case FunctionTypesEx.ThermalDisinfection:
        hlp.set(type, new ThermalDisinfectionHelper());
        return hlp.get(type);
      case FunctionTypes.HygieneFlush:
      case FunctionTypesEx.HygieneFlushInterval:
      case FunctionTypesEx.HygieneFlushCalendar:
      case FunctionTypesEx.HygieneFlushNutzung:
        hlp.set(type, new HygieneFlushHelper(FunctionHelperFactory.dateSvc));
        return hlp.get(type);
      default: return FunctionHelperFactory.default;
    }
  }

  static getHelper(type: FunctionTypes | string): FunctionHelper {
    return FunctionHelperFactory.get(type);
  }

  public shouldViewInclude(viewElement: string): boolean {
    return false;
  }
}
