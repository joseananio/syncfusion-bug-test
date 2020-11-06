import { Component, OnInit, Input, Output, HostListener, EventEmitter, ElementRef, ViewChild, forwardRef } from '@angular/core';
import { ValueAccessor } from '../shared/ValueAccessor';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { isNumber } from 'util';

export interface ISliderValueChangeEvent {
    newValue: number;
}

@Component({
    selector: 'viega-slider',
    templateUrl: './slider.component.html',
    styleUrls: ['./slider.component.scss'],
    providers: [{
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => SliderComponent),
        multi: true
    }]
})
export class SliderComponent extends ValueAccessor<number> implements OnInit {
    private handleOrigin: number;
    private dragStart: number;
    private maxHandleOffset: number;
    private _min: number = 0;
    private _max: number = 1;

    @Input()
    public increment: number = 1;

    @Input()
    public inputId: string;

    @Input()
    public get isDisabled(): boolean {
        return this.disabled;
    }

    public set isDisabled(isDisabled: boolean) {
        this.disabled = isDisabled;
    }

    public get max(): number {
        return this._max;
    }

    @Input()
    public set max(newValue: number) {
        this._max = newValue;
        this.setHandlePosFromValue(this.value);
    }

    public get min(): number {
        return this._min;
    }

    @Input()
    public set min(newValue: number) {
        this._min = newValue;
        this.setHandlePosFromValue(this.value);
    }

    /**
     * Whether clicking on the slider's bar allows the user to set a specific value directly.
     */
    @Input()
    public isSkipAllowed: boolean = true;

    @Output()
    public valueChange = new EventEmitter<ISliderValueChangeEvent>();

    @ViewChild("track")
    public trackElement: ElementRef;

    @ViewChild("handle", { static: true })
    public handleElement: ElementRef;

    public isDragging: boolean = false;

    public writeValue(value: number) {
        super.writeValue(value);
        this.setHandlePosFromValue(value);
    }

    public constructor(private element: ElementRef) {
        super();
    }

    public ngOnInit(): void {
        this.setHandlePosFromValue(this.value);
    }

    @HostListener("mousedown", ['$event'])
    public onMouseDown(event: MouseEvent) {
        if (event.which !== 1)
            return;

        const isFromHandle = event.target === this.handleElement.nativeElement;
        if (!this.isSkipAllowed && !isFromHandle)
            return;

        this.initDrag(event.pageX, isFromHandle);
        this.performDrag(event.pageX);
    }

    @HostListener("window:mousemove", ['$event'])
    public onMouseMove(event: MouseEvent) {
        if (!this.isDragging)
            return;

        this.performDrag(event.pageX);
        event.preventDefault();
    }

    @HostListener("window:mouseup", ['$event'])
    public onMouseUp(event: MouseEvent) {
        if (event.which !== 1 || !this.isDragging)
            return;

        this.endDrag();
        event.preventDefault();
    }

    @HostListener("touchstart", ['$event'])
    public onTouchStart(event: any) {
        const touch: Touch = event.touches[0];

        const isFromHandle = event.target === this.handleElement.nativeElement;
        if (!this.isSkipAllowed && !isFromHandle)
            return;

        this.initDrag(touch.pageX, isFromHandle);
    }

    @HostListener("touchmove", ['$event'])
    public onTouchMove(event: any) {
        const isMultitouch = event.touches.length > 1;
        if (isMultitouch)
            return;

        const touch: Touch = event.touches[0];
        this.performDrag(touch.pageX);
    }

    @HostListener("touchend", ['$event'])
    public onTouchEnd(event: any) {
        this.endDrag();
    }

    @HostListener("touchcancel", ['$event'])
    public onTouchCancel(event: any) {
        this.endDrag();
    }

    @HostListener("keydown", ['$event'])
    public onKeyDown(event: KeyboardEvent) {
        switch (event.key) {
            case 'ArrowLeft':
                this.value = Math.max(this.value - this.increment, this.min);
                this.valueChange.emit({ newValue: this.value });
                break;
            case 'ArrowRight':
                this.value = Math.min(this.value + this.increment, this.max);
                this.valueChange.emit({ newValue: this.value });
                break;
            case 'Home':
                this.value = this.min;
                this.valueChange.emit({ newValue: this.value });
                break;
            case 'End':
                this.value = this.max;
                this.valueChange.emit({ newValue: this.value });
                break;
            default:
                return;
        }

        event.preventDefault();
        this.setHandlePosFromValue(this.value);
    }

    private initDrag(pageX: number, fromHandle: boolean) {
        if (this.disabled)
            return;

        this.dragStart = pageX;
        this.isDragging = true;

        if (fromHandle)
            this.handleOrigin = (this.handleElement.nativeElement as HTMLElement).offsetLeft;
        else {
            const trackRect = (this.trackElement.nativeElement as HTMLElement).getBoundingClientRect();
            this.handleOrigin = pageX - trackRect.left - this.handleElement.nativeElement.offsetWidth / 2;
        }

        this.refreshMaxHandleOffset();
    }

    private performDrag(pageX: number) {
        if (!this.isDragging)
            return;

        const dragDelta = pageX - this.dragStart;
        let newHandlePos = this.handleOrigin + dragDelta;
        newHandlePos = Math.max(newHandlePos, 0);
        newHandlePos = Math.min(newHandlePos, this.maxHandleOffset);
        const valuePercentage = newHandlePos / this.maxHandleOffset;
        const value = this.min + ((this.max - this.min) * valuePercentage);

        // TODO: consider debouncing to not slow down old computers
        this.value = value;
        this.valueChange.emit({ newValue: value });

        this.setHandlePosFromValue(value);
    }

    private endDrag() {
        this.isDragging = false;
    }

    private setHandlePosFromValue(value: number) {
        value = Math.max(this.min, value);
        value = Math.min(this.max, value);

        const valuePercentage = (value - this.min) / (this.max - this.min);
        this.setHandlePos(valuePercentage);
    }

    private setHandlePos(percentage: number) {
        const cssPercentage = percentage * 100;
        const handleSize = (this.handleElement.nativeElement as HTMLElement).offsetWidth;
        this.handleElement.nativeElement.style.left = `calc(${cssPercentage}% - ${handleSize * percentage}px)`;
    }

    private refreshMaxHandleOffset() {
        const track = this.trackElement.nativeElement as HTMLElement;
        const handle = this.handleElement.nativeElement as HTMLElement;
        const trackWidth = track.getBoundingClientRect().width - handle.offsetWidth;
        this.maxHandleOffset = trackWidth;
    }

    public setDisabledState?(isDisabled: boolean) {
        super.setDisabledState(isDisabled);
    }
}
