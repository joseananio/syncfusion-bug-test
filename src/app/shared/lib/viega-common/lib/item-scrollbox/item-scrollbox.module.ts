import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ItemScrollboxComponent } from './item-scrollbox.component';

@NgModule({
    imports: [
        CommonModule
    ],
    declarations: [
        ItemScrollboxComponent
    ],
    exports: [
        ItemScrollboxComponent
    ]
})
export class ItemScrollboxModule { }
