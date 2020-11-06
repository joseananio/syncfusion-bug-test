import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface IImageModalData {
    images: IImageData[];
    currentIndex: number;
}

export interface IImageData {
    imgSrc: string;
    imgAlt: string;
}

@Component({
    selector: 'viega-image-modal',
    templateUrl: './image-modal.component.html',
    styleUrls: ['./image-modal.component.scss']
})
export class ImageModalComponent {
    public currentImageIndex: number = 0;

    public get images(): IImageData[] {
        return this.dialogData.images;
    }

    public get currentImage(): IImageData {
        return this.images[this.currentImageIndex];
    }

    constructor(public dialogRef: MatDialogRef<ImageModalComponent>,
                @Inject(MAT_DIALOG_DATA) public dialogData: IImageModalData) {
        this.currentImageIndex = dialogData.currentIndex;
    }

    public nextImage() {
        if (this.currentImageIndex === this.images.length - 1)
            this.currentImageIndex = 0;
        else
            this.currentImageIndex++;
    }
}
