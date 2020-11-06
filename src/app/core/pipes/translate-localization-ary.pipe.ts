import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import {
  DynamicLocalisationData,
} from '../../shared/components/modal-dialog/generated-dynamic-dialog/subcomponents/abstract-modular.component';

/**
 * Pipe for generic dialogue data.
 * value.format from backend contains the values to be inserted into the strings.
 * value.default gives an english standard translation.
 */
@Pipe({ name: 'translateLocaliationData' })
export class TranslateLocalizationArrayPipe implements PipeTransform {
  constructor(private translateService: TranslateService) {}

  transform(value: DynamicLocalisationData): string {
    let ret: string = value.default;
    if (value.i18N) {
      const key = value.i18N.toUpperCase();
      const translation = this.translateService.instant(key);
      if (translation && translation.length > 0 && key !== translation) {
        ret = translation;
      }
    }
    if (Array.isArray(value.formats)) {
      for (let index = 0; index < value.formats.length; index += 1) {
        ret = ret.replace(`{${index}}`, value.formats[index]);
      }
    }
    return ret;
  }
}
