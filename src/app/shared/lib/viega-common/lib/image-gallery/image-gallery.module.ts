import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageGalleryComponent } from './image-gallery.component';
import { IconButtonModule } from '../icon-button/icon-button.module';
import { MatDialogModule } from '@angular/material/dialog';
import { ImageModalModule } from '../image-modal/image-modal.module';

@NgModule({
    imports: [
        CommonModule,
        IconButtonModule,
        MatDialogModule,
        ImageModalModule,
    ],
    declarations: [
        ImageGalleryComponent
    ],
    exports: [
        ImageGalleryComponent
    ]
})
export class ImageGalleryModule { }
