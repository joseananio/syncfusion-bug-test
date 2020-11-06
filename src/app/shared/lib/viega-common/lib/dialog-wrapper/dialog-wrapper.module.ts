import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogWrapperComponent } from './dialog-wrapper.component';
import { LogoModule } from '../logo/logo.module';
import { IconButtonModule } from '../icon-button/icon-button.module';

@NgModule({
    imports: [
        CommonModule,
        LogoModule,
        IconButtonModule,
    ],
    declarations: [
        DialogWrapperComponent
    ],
    exports: [
        DialogWrapperComponent
    ]
})
export class DialogWrapperModule { }
