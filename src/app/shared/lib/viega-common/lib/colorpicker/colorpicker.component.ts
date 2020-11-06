import { Component, OnInit, HostListener, ElementRef, Input, ViewChild, HostBinding, Output, EventEmitter } from '@angular/core';

export interface IColorPickerValueChangeEvent {
    newHtmlColor: string;
}

// TODO: add ngModel support
@Component({
  selector: 'viega-colorpicker',
  templateUrl: './colorpicker.component.html',
  styleUrls: ['./colorpicker.component.scss']
})
export class ColorpickerComponent implements OnInit {
    private static readonly KeyCodeReturn = 13;
    private static readonly htmlColorRegex = new RegExp('#(\\d{3}|\\d{6})');

    private _htmlColor: string;

    public get htmlColor(): string {
        return this._htmlColor;
    }

    @Input()
    public set htmlColor(newValue: string) {
        if (this._htmlColor !== newValue) {
            this._htmlColor = newValue;
            this.setColorIfValid(newValue);
        }
    }

    @Input()
    public label: string;

    @Input()
    public predefinedColors: string[];

    public inputValue: string;
    public hueColor: string;

    public hueValue: number = 0;
    public saturationValue: number;
    public lightnessValue: number;

    @HostBinding('class.active')
    public isDialogVisible: boolean = false;
    public dialogPositionX: number;
    public dialogPositionY: number;

    @ViewChild('dialog')
    public dialogElement: ElementRef;

    public slMarkerX: number;
    public slMarkerY: number;
    public hueMarkerPos: number;

    @ViewChild('spectrum')
    public spectrumElement: ElementRef;

    @ViewChild('hue')
    public hueElement: ElementRef;

    @Output()
    public valueChanged = new EventEmitter<IColorPickerValueChangeEvent>();

    public isDraggingSL: boolean = false;
    public isDraggingHue: boolean = false;

    constructor(private element: ElementRef) {}

    public ngOnInit() {}

    @HostListener('window:click', ['$event'])
    public onClick(event: MouseEvent) {
        const element = this.element.nativeElement as HTMLElement;
        const isClickIntoPicker = event.target === element || element.contains(event.target as Node);
        if (!isClickIntoPicker)
            return;

        const dialogElement = this.dialogElement.nativeElement as HTMLElement;
        const isClickIntoDialog = event.target === dialogElement || dialogElement.contains(event.target as Node);
        if (isClickIntoDialog)
            return;

        if (!this.isDialogVisible)
            this.showDialog();
        else
            this.hideDialog();
    }

    @HostListener('window:resize', ['$event'])
    public onResize(event) {
        if (this.isDialogVisible)
            this.repositionDialog();
    }

    @HostListener('touchstart', ['$event'])
    public onTouchStart(event: any) {
        this.initDrag(event.target);
    }

    @HostListener('window:touchmove', ['$event'])
    public onTouchMove(event: any) {
        const isMultitouch = event.touches.length > 1;
        if (isMultitouch)
            return;

        const touch: Touch = event.touches[0];
        this.performDrag(touch.pageX, touch.pageY);
    }

    @HostListener('touchend', ['$event'])
    public onTouchEnd(event: any) {
        this.endDrag();
    }

    @HostListener('touchcancel', ['$event'])
    public onTouchCancel(event: any) {
        this.endDrag();
    }

    public spectrum_MouseDown(event: MouseEvent) {
        if (event.which !== 1)
            return;

        this.initDragSL(event.pageX, event.pageY);
    }

    public spectrum_TouchStart(event: TouchEvent) {
        const isMultitouch = event.touches.length > 1;
        if (isMultitouch)
            return;

        const touch: Touch = event.touches[0];
        this.initDragSL(touch.pageX, touch.pageY);
    }

    public hue_MouseDown(event: MouseEvent) {
        if (event.which !== 1)
            return;

        this.initDragHue(event.pageX, event.pageY);
    }

    public hue_TouchStart(event: TouchEvent) {
        const isMultitouch = event.touches.length > 1;
        if (isMultitouch)
            return;

        const touch: Touch = event.touches[0];
        this.initDragHue(touch.pageX, touch.pageY);
    }

    @HostListener('window:mousedown', ['$event'])
    public onMouseDown(event: MouseEvent) {
        this.initDrag(event.target);
    }

    @HostListener('window:mouseup', ['$event'])
    public onMouseUp(event: MouseEvent) {
        this.endDrag();
    }

    @HostListener('window:mousemove', ['$event'])
    public onMouseMove(event: MouseEvent) {
        if (event.which !== 1)
            return;

        this.performDrag(event.pageX, event.pageY);
    }

    private initDrag(eventTarget) {
        const element = this.element.nativeElement as HTMLElement;
        const isClickIntoPicker = eventTarget === element || element.contains(eventTarget as Node);
        if (!isClickIntoPicker)
            this.hideDialog();
    }

    private initDragHue(pageX: number, pageY: number) {
        this.isDraggingHue = true;
        document.body.style.userSelect = 'none';

        this.performDrag(pageX, pageY);
    }

    private initDragSL(pageX: number, pageY: number) {
        this.isDraggingSL = true;
        document.body.style.userSelect = 'none';

        this.performDrag(pageX, pageY);
    }

    private performDrag(pageX: number, pageY: number) {
        if (this.isDraggingSL) {
            this.dragSaturationAndLightness(pageX, pageY);
            event.stopImmediatePropagation();
            event.preventDefault();
        } else if (this.isDraggingHue) {
            this.dragHue(pageY);
            event.stopImmediatePropagation();
            event.preventDefault();
        }
    }

    private endDrag() {
        if (this.isDraggingSL || this.isDraggingHue) {
            this.isDraggingSL = false;
            this.isDraggingHue = false;
            document.body.style.userSelect = 'initial';
        }
    }

    public input_KeyUp(event: KeyboardEvent) {
        if (event.keyCode === ColorpickerComponent.KeyCodeReturn)
            this.hideDialog();

        this.input_Change(event);
    }

    public input_Change(event: Event) {
        const newValue = (event.target as HTMLInputElement).value;
        this.inputValue = newValue;
        this.setColorIfValid(newValue);
    }

    private showDialog() {
        this.inputValue = this.htmlColor;

        this.repositionDialog();
        this.setMarkersFromColor();
        this.isDialogVisible = true;
    }

    private hideDialog() {
        this.isDialogVisible = false;
    }

    private repositionDialog() {
        const htmlElement = this.element.nativeElement as HTMLElement;
        const elementBoundingRect = htmlElement.getBoundingClientRect();

        const dialogElement = this.dialogElement.nativeElement as HTMLElement;
        const dialogWidth = dialogElement.offsetWidth;
        const dialogHeight = dialogElement.offsetHeight;

        const body = document.body;
        const html = document.documentElement;
        // browser compatibility is a nightmare here
        const bodyWidth = Math.max(body.scrollWidth, body.offsetWidth, html.clientWidth, html.scrollWidth, html.offsetWidth);
        const bodyHeight = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight);

        this.dialogPositionX = elementBoundingRect.right + 10;
        this.dialogPositionY = elementBoundingRect.top;

        if (this.dialogPositionX + dialogWidth > bodyWidth)
            this.dialogPositionX -= dialogWidth + elementBoundingRect.width + 20;

        if (this.dialogPositionY + dialogHeight > bodyHeight)
            this.dialogPositionY -= dialogHeight - elementBoundingRect.height;
    }

    private dragSaturationAndLightness(pageX: number, pageY: number) {
        const element = this.spectrumElement.nativeElement as HTMLElement;
        const elementRect = element.getBoundingClientRect();

        const dragWidth = element.offsetWidth - 6;
        const dragHeight = element.offsetHeight - 6;

        let offsetX = pageX - elementRect.left;
        offsetX = Math.max(0, Math.min(dragWidth, offsetX));
        let offsetY = pageY - elementRect.top;
        offsetY = Math.max(0, Math.min(dragHeight, offsetY));

        this.slMarkerX = Math.max(0, Math.min(dragWidth, offsetX - 2));
        this.slMarkerY = Math.max(0, Math.min(dragHeight, offsetY - 2));

        const xPercentage = offsetX / dragWidth;
        const yPercentage = offsetY / dragHeight;

        this.saturationValue = xPercentage;
        this.lightnessValue = 1 - yPercentage;

        this.setColorFromMarkers();
    }

    private dragHue(pageY: number) {
        const element = this.hueElement.nativeElement as HTMLElement;
        const elementRect = element.getBoundingClientRect();

        const dragHeight = element.offsetHeight - 4;
        let offsetY = pageY - elementRect.top;
        offsetY = Math.max(0, Math.min(dragHeight, offsetY));

        this.hueMarkerPos = Math.max(0, Math.min(dragHeight, offsetY - 2));
        const percentage = offsetY / dragHeight;
        this.hueValue = percentage;

        this.setColorFromMarkers();
    }

    public setColorIfValid(htmlColor: string) {
        const hsvColor = ColorpickerComponent.hex2hsv(htmlColor);
        const isValidColor = hsvColor !== null;
        if (!isValidColor)
            return;

        this.hueValue = hsvColor.h;
        this.saturationValue = hsvColor.s;
        this.lightnessValue = hsvColor.v;

        this.setMarkersFromColor();

        this.inputValue = htmlColor;
        this._htmlColor = htmlColor;
        this.valueChanged.emit({ newHtmlColor: htmlColor });
    }

    private setColorFromMarkers() {
        this._htmlColor = ColorpickerComponent.hsv2hex(this.hueValue * 360, this.saturationValue, this.lightnessValue);

        this.hueColor = `hsl(${this.hueValue * 360}, 100%, 50%)`;
        this.inputValue = this._htmlColor;
        this.valueChanged.emit({ newHtmlColor: this._htmlColor });
    }

    private setMarkersFromColor() {
        this.setSlMarkerFromHsv();
        this.setHueMarkerFromHsv();
    }

    private setSlMarkerFromHsv() {
        const element = this.spectrumElement.nativeElement as HTMLElement;
        const dragWidth = element.offsetWidth - 8;
        const dragHeight = element.offsetHeight - 8;

        this.slMarkerX = dragWidth * this.saturationValue;
        this.slMarkerY = dragHeight * (1 - this.lightnessValue);
    }

    private setHueMarkerFromHsv() {
        const element = this.hueElement.nativeElement as HTMLElement;
        const dragHeight = element.offsetHeight - 4;

        this.hueMarkerPos = dragHeight * this.hueValue;
        this.hueColor = `hsl(${this.hueValue * 360}, 100%, 50%)`;
    }

    private static hsv2hex(h: number, s: number, v: number): string {
        let r;
        let g;
        let b;
        let p = (h % 360) / 60;

        const c = v * s;
        const x = c * (1 - Math.abs(p % 2 - 1));
        r = g = b = v - c;

        p = ~~p;
        r += [c, x, 0, 0, x, c][p];
        g += [x, c, c, x, 0, 0][p];
        b += [0, 0, x, c, c, x][p];

        const rVal = Math.floor(r * 255);
        const gVal = Math.floor(g * 255);
        const bVal = Math.floor(b * 255);
        return '#' + (16777216 | bVal | (gVal << 8) | (rVal << 16)).toString(16).slice(1);
    }

    private static shortHexColorRegex: RegExp = new RegExp('^#?([a-f\\d])([a-f\\d])([a-f\\d])$', 'i');
    private static hexColorRegex: RegExp = new RegExp('^#?([a-f\\d]{2})([a-f\\d]{2})([a-f\\d]{2})$', 'i');
    private static hex2hsv(hexColor: string): { h: number, s: number, v: number } {
        // Expand shorthand form (e.g. '03F') to full form (e.g. '0033FF')
        hexColor = hexColor.replace(ColorpickerComponent.shortHexColorRegex,
            (m, red, green, blue) => red + red + green + green + blue + blue);

        const result = ColorpickerComponent.hexColorRegex.exec(hexColor);
        if (!result)
            return null;

        const r = parseInt(result[1], 16) / 255;
        const g = parseInt(result[2], 16) / 255;
        const b = parseInt(result[3], 16) / 255;

        let h;
        let s;
        const v = Math.max(r, g, b);
        const diff = v - Math.min(r, g, b);

        if (diff === 0) {
            h = s = 0;
        } else {
            s = diff / v;
            const rr = (v - r) / 6 / diff + 1 / 2;
            const gg = (v - g) / 6 / diff + 1 / 2;
            const bb = (v - b) / 6 / diff + 1 / 2;

            if (r === v)
                h = bb - gg;
            else if (g === v)
                h = (1 / 3) + rr - bb;
            else if (b === v)
                h = (2 / 3) + gg - rr;

            if (h < 0)
                h += 1;
            else if (h > 1)
                h -= 1;
        }

        return { h, s, v };
    }
}
