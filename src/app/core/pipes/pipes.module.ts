import { NgModule } from '@angular/core';
import { TranslateLocalizationArrayPipe } from './translate-localization-ary.pipe';

import { ReplacePipe } from './replace.pipe';

@NgModule({
  declarations: [ReplacePipe, TranslateLocalizationArrayPipe],
  exports: [ReplacePipe, TranslateLocalizationArrayPipe],
})
export class PipesModule {}
