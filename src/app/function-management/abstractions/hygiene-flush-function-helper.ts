import { FunctionTypesEx } from '../functions-types';
import { DateTimeService } from '../../core/services/local-services';
import { DefaultFunctionHelper } from './default-function-helper';
import { FunctionsInput, FunctionTypes } from '../../core/services';
import { FunctionsInputModel } from './functions-input-model';

export class HygieneFlushHelper extends DefaultFunctionHelper {
  constructor(private dateSvc: DateTimeService) {
    super();
  }

  formatModelForSaving(model: FunctionsInputModel, args: { [key: string]: any } = {}): FunctionsInput {
    /*
     * No circulation input fields are necessary.
     */
    delete model.circulationValveConfigurationMapping;
    delete model.circulationInput;

    // dependOnTemperatureFlush: If no value has been set, don't pass object to BE
    if (!model.flushSchedule.dependOnTemperatureFlushPlan.flushIfTemperatureHigherThan) {
      delete model.flushSchedule.dependOnTemperatureFlushPlan;
    }

    /*
     * HygieneFlushNutzung is the only type of function where flushSchedule.dependOnStagnationFlushPlan is permitted
     */
    if (model.type !== FunctionTypesEx.HygieneFlushNutzung) {
      delete model.flushSchedule.dependOnStagnationFlushPlan;
    }

    /*
     * HygieneFlushCalendar is the only type of function where flushSchedule.weeklyFlushPlan is permitted
     */
    if (model.type !== FunctionTypesEx.HygieneFlushCalendar) {
      delete model.flushSchedule.weeklyFlushPlan;
    }

    // noFlushFrame: Disallow for HygieneFlushNutzung: TWMS2020-3329
    if (!model.flushSchedule.noFlushFrame.fromHourMinute && !model.flushSchedule.noFlushFrame.toHourMinute) {
      delete model.flushSchedule.noFlushFrame;
    }

    /*
     * HygieneFlushInterval is the only type of function where flushSchedule.fixIntervalFlushPlan is permitted.
     */
    if (model.type !== FunctionTypesEx.HygieneFlushInterval) {
      delete model.flushSchedule.fixIntervalFlushPlan;
    } else {
      // Firefox fails with the default dot notation
      const startDate = new Date(model.flushSchedule.fixIntervalFlushPlan.startDateUtc);
      const startDateUtc = this.dateSvc.toISOString(startDate);
      model.flushSchedule.fixIntervalFlushPlan = {
        ...model.flushSchedule.fixIntervalFlushPlan,
        startDateUtc: startDateUtc.substr(0, startDateUtc.indexOf('Z')), // this is quiet hacky. find out why new isoSTRING fails
      };
    }

    /*
     * model.type needs to be changed to dispose of our suffix
     */
    model.type = FunctionTypes.HygieneFlush;

    return model;
  }

  public isModelValid(model: FunctionsInput | FunctionsInputModel, args: { [key: string]: any } = {}): boolean {
    /*
    * Below step 2: Nothing specific here (yet)
    */
    if (args.activeStepIndex < 2) {
      return super.isModelValid(model, args);
    }

    /*
    * If "Rinse by temperature" box on dialogue page 3 is selected: Invalid unless temperature is set
    * If a sensor device point is selected, but the box isn't checked, ignore
    */
    if (model.temperatureSensorPwcDevicePointUuid
      && model.flushSchedule.dependOnTemperatureFlushPlan.activated
      && !model.flushSchedule.dependOnTemperatureFlushPlan.flushIfTemperatureHigherThan
    ) {
      return false;
    }

    switch (model.type) {
      case FunctionTypesEx.HygieneFlushInterval: {
        // FixIntervalFlushPlan needs to be set. The two parameters need to be valid.
        return !!model.flushSchedule.fixIntervalFlushPlan.intervalHours && !!model.flushSchedule.fixIntervalFlushPlan.startDateUtc;
      }
      case FunctionTypesEx.HygieneFlushNutzung: {
        if (model.flushSchedule.noFlushFrame.fromHourMinute) {
          return !!model.flushSchedule.noFlushFrame.toHourMinute;
        }
        return !model.flushSchedule.noFlushFrame.toHourMinute;
      }
      case FunctionTypesEx.HygieneFlushCalendar: {
        return !!Object.values(model.flushSchedule.weeklyFlushPlan.weekDays).find((arr) => arr.length > 0);
      }
      default:
        return true;
    }
  }

  public shouldViewInclude(model: FunctionsInput | FunctionsInputModel, viewElement: string): boolean {
    let types: string[] = [];

    switch (model.type) {
      case FunctionTypesEx.HygieneFlushCalendar:
        types = ['calendar', 'temperature'];
        break;
      case FunctionTypesEx.HygieneFlushNutzung:
        types = ['nutzung', 'noflushinterval'];
        break;
      case FunctionTypesEx.HygieneFlushInterval:
        types = ['interval', 'temperature', 'noflushinterval'];
        break;
      default:
        break;
    }
    return types.includes(viewElement);
  }
}
