import { Component, OnInit, Input } from '@angular/core';
// import { IImageData, ViegaImageDialogComponent, IImageDialogData } from '../viega-image-dialog/viega-image-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { IImageModalData, ImageModalComponent } from '../image-modal';

export interface IGalleryImage {
    imgSrc: string;
    thumbnailImgSrc: string;
    title: string;
    allowZoom: boolean;
    overlayText?: string;
}

@Component({
    selector: 'viega-image-gallery',
    templateUrl: './image-gallery.component.html',
    styleUrls: ['./image-gallery.component.scss']
})
export class ImageGalleryComponent {
    private _currentImage: IGalleryImage;

    @Input()
    public images: IGalleryImage[] = [];

    public get currentImage(): IGalleryImage {
        if (this.images === undefined || this.images.length === 0)
            return {
                imgSrc: "",
                thumbnailImgSrc: "",
                title: "",
                allowZoom: false,
            };
        else if (this._currentImage === undefined)
            return this.images[0];
        else
            return this._currentImage;
    }

    constructor(private dialog: MatDialog) {}

    public setCurrentImage(image: IGalleryImage) {
        this._currentImage = image;
    }

    public zoomImage(image: IGalleryImage) {
        if (!image.allowZoom)
            return;

        const dialogData: IImageModalData = {
            images: this.images
                .filter((galleryImage: IGalleryImage) => galleryImage.allowZoom)
                .map((galleryImage: IGalleryImage) => {
                    return {
                        imgSrc: galleryImage.imgSrc,
                        imgAlt: galleryImage.title
                    };
                }),
            currentIndex: this.images.indexOf(this.currentImage)
        };

        this.dialog.open(ImageModalComponent, {
            backdropClass: "deep-dark-dialog-backdrop",
            data: dialogData
        });
    }
}
