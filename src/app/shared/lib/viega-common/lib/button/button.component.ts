import { Component, OnInit, Input, HostBinding } from '@angular/core';

export type ButtonType = 'primary' | 'secondary' | 'cancel' | 'back' | 'back-mini';

@Component({
    selector: 'viega-button',
    templateUrl: './button.component.html',
    styleUrls: ['./button.component.scss']
})
export class ButtonComponent {
    private static readonly TypeToIconMap: { [buttonType: string]: string } = {
        'primary': 'right_thick-01',
        'secondary': '',
        'back': 'left_thick-01',
        'back-mini': 'left_thick-01',
        'cancel': 'cross-01',
    };
    private static readonly TypeToIconLeftAlignMap: { [buttonType: string]: boolean } = {
        'back': true,
        'cancel': true,
    };

    public matColor: string = 'primary';

    @Input()
    public enableIcon: boolean = true;

    @Input()
    public isDisabled: boolean = false;

    @HostBinding('attr.disabled')
    public get disabled(): string {
        return this.isDisabled ? 'disabled' : undefined;
    }

    @Input()
    public type: ButtonType = 'primary';

    private _icon: string;
    public get icon(): string {
        return this._icon;
    }

    @Input()
    public set icon(newValue: string) {
        this._icon = newValue;
    }

    public get internalIcon(): string {
        if (this._icon)
            return this._icon;
        else
            return ButtonComponent.TypeToIconMap[this.type];
    }

    private _isIconLeftAligned: boolean;
    public get isIconLeftAligned(): boolean {
        return this._isIconLeftAligned;
    }

    @Input()
    public set isIconLeftAligned(newValue: boolean) {
        this._isIconLeftAligned = newValue;
    }

    public get internalIsIconLeftAligned(): boolean {
        if (this._isIconLeftAligned !== undefined)
            return this._isIconLeftAligned;
        else
            return ButtonComponent.TypeToIconLeftAlignMap[this.type];
    }

    public click(event: MouseEvent) {
        if (this.isDisabled) {
          event.stopImmediatePropagation();
          // also prevent form submissions not directly connect to button
          event.preventDefault();
        }
    }
}
