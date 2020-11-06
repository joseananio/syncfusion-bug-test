import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconButtonComponent } from './icon-button.component';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
    imports: [
        CommonModule,
        MatButtonModule
    ],
    declarations: [
        IconButtonComponent
    ],
    exports: [
        IconButtonComponent
    ]
})
export class IconButtonModule { }
