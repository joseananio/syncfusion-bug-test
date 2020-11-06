import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { UnitInputComponent } from './unit-input.component';
import { SliderModule } from '../slider/slider.module';

@NgModule({
    imports: [
        CommonModule,
        SliderModule,
        FormsModule,
    ],
    declarations: [
        UnitInputComponent
    ],
    exports: [
        UnitInputComponent
    ]
})
export class UnitInputModule { }
