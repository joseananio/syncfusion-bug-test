import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from './button.component';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
    imports: [
        CommonModule,
        MatButtonModule
    ],
    declarations: [
        ButtonComponent
    ],
    exports: [
        ButtonComponent
    ]
})
export class ButtonModule { }
