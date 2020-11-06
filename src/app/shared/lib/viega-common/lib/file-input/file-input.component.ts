import { Component, OnInit, Input, EventEmitter, HostListener, Output } from '@angular/core';

export interface IFileInputValueChangeEvent {
    localFile: ILocalFile;
}

export interface ILocalFile {
    filename: string;
    type: string;
    resultData: any;
}

export type DisplayMode = 'input-box' | 'dragdrop-zone';
export type DataType = 'binary' | 'text';

// TODO: make ngModel compatible
@Component({
    selector: 'viega-file-input',
    templateUrl: './file-input.component.html',
    styleUrls: ['./file-input.component.scss']
})
export class FileInputComponent {
    @Input()
    public localFile: ILocalFile;

    @Input()
    public placeholderText: string;

    /**
     * Sets the visual display mode.
     *   'input-box' - A regular input box.
     *   'dragdrop-zone' - A mere drag & drop box without any visual representation.
     */
    @Input()
    public mode: DisplayMode = 'input-box';

    /**
     * Defines the method how data should be read from the input file.
     */
    @Input()
    public dataType: DataType = 'binary';

    @Input()
    public mimeType: string = '*';

    @Output()
    public fileSelected = new EventEmitter<IFileInputValueChangeEvent>();

    public isDraggingOver: boolean;

    public get isImageFile() {
        return this.localFile.type.startsWith('image/');
    }

    constructor() {}

    @HostListener('dragenter', ['$event'])
    public onDragEnter(event: DragEvent) {
        event.preventDefault();
    }

    @HostListener('dragover', ['$event'])
    public onDragOver(event: DragEvent) {
        this.isDraggingOver = true;
        event.preventDefault();
    }

    @HostListener('dragleave', ['$event'])
    public onDragLeave(event: DragEvent) {
        this.isDraggingOver = false;
    }

    @HostListener('drop', ['$event'])
    public onDrop(event: DragEvent) {
        event.preventDefault();

        const localFile = event.dataTransfer.files[0];
        this.readFile(localFile);

        this.isDraggingOver = false;
    }

    public chooseFile(event: any) {
        if (event.target.files.length) {
          const localFile = event.target.files[0];
          this.readFile(localFile);
        }
    }

    private readFile(localFile: any) {
        const reader = new FileReader();
        reader.onload = (loadEvent) => {
            const selectedLocalFile: ILocalFile = {
                filename: localFile.name,
                type: localFile.type,
                resultData: reader.result
            };

            this.localFile = selectedLocalFile;
            this.fileSelected.emit({ localFile: selectedLocalFile });
        };

        if (this.dataType === 'text')
            reader.readAsText(localFile);
        else if (this.dataType === 'binary')
            reader.readAsDataURL(localFile);
    }

    public labelClick(event: Event) {
        if (this.mode === 'dragdrop-zone')
            event.preventDefault();
    }
}
