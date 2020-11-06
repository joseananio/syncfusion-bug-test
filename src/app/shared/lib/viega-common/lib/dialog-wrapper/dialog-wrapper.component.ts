import { Component, OnInit, Input, Output, EventEmitter, HostBinding, ContentChild, TemplateRef, ViewChild } from '@angular/core';

/**
 * Basic design for viega dialogs in lightboxes.
 * Provides a header with a title and viega logo aswell as a close button.
 *
 * Note that this component is simply a visual wrapper. It is not a modal itself.
 *
 * This component supports content injection by using the following special attributes on the content elements:
 *     default content - Wrapped content.
 *     #header - If set, this will be injected as a replacement of the default header.
 */
@Component({
    selector: 'viega-dialog-wrapper',
    templateUrl: './dialog-wrapper.component.html',
    styleUrls: ['./dialog-wrapper.component.scss']
})
export class DialogWrapperComponent {
    @Input()
    public heading: string = "";

    @ContentChild('header')
    public headerTemplate: TemplateRef<any>;

    @Input()
    @HostBinding("class.logo-hidden")
    public hideLogo: boolean = true;

    @Input()
    public hideCloseButton: boolean = false;

    /** You may sometimes desire to overwrite the default overflow settings, like if you display long popups for example. */
    @Input()
    public overflowX: string = 'hidden';

    /** You may sometimes desire to overwrite the default overflow settings, like if you display long popups for example. */
    @Input()
    public overflowY: string = 'auto';

    @Output()
    public requestClose = new EventEmitter();

    constructor() {}

    public requestDialogCloseBound = this.requestDialogClose.bind(this);
    public requestDialogClose() {
        this.requestClose.emit();
    }
}
