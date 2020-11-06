import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BackgroundImageDirective } from './componentBackground.directive';

@NgModule({
  declarations: [BackgroundImageDirective],
  imports: [
    CommonModule,
  ],
  exports: [BackgroundImageDirective],
})
export class DirectivesModule { }
