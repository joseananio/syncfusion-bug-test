import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StartPageComponent } from './start-page.component';

@NgModule({
    imports: [
        CommonModule
    ],
    declarations: [
        StartPageComponent
    ],
    exports: [
        StartPageComponent
    ]
})
export class StartPageModule { }
