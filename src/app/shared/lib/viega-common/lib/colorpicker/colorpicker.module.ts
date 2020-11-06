import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ColorpickerComponent } from './colorpicker.component';

@NgModule({
    imports: [
        CommonModule
    ],
    declarations: [
        ColorpickerComponent
    ],
    exports: [
        ColorpickerComponent
    ]
})
export class ColorpickerModule { }
