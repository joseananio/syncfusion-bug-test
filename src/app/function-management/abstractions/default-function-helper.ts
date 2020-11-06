import { FunctionsInput, FunctionTypes } from 'src/app/core/services';
import { FunctionsInputModel } from './functions-input-model';

export interface FunctionHelper {
  formatModelForSaving(model: FunctionsInput | FunctionsInputModel, args?: { [key: string]: any }): FunctionsInput;

  isModelValid(model: FunctionsInput | FunctionsInputModel, args?: { [key: string]: any }): boolean;

  shouldViewInclude(model: FunctionsInput | FunctionsInputModel, viewElement: string): boolean;
}

export class DefaultFunctionHelper implements FunctionHelper {
  public isModelValid(model: FunctionsInput | FunctionsInputModel, args: { [key: string]: any } = {}): boolean {
    return true;
  }

  public formatModelForSaving(model: FunctionsInputModel, args: { [key: string]: any } = {}): FunctionsInput {
    model.type = model.type.replace(/__.*/, '') as FunctionTypes;
    return model;
  }

  public shouldViewInclude(model: FunctionsInput | FunctionsInputModel, viewElement: string): boolean {
    return false;
  }
}
