import { Component, OnInit, Input } from '@angular/core';

/**
 * This component supports content injection by using the following special attributes on the content elements:
 *     [panel] - The content shown in the side bar below the viega yellow bar.
 *     [panel-mobile] - The content shown in the side bar below the viega yellow bar when the start page is in mobile mode.
 */
@Component({
    selector: 'viega-start-page',
    templateUrl: './start-page.component.html',
    styleUrls: ['./start-page.component.scss']
})
export class StartPageComponent {
    @Input()
    public headlineText: string;

    @Input()
    public subHeadlineText: string;

    @Input()
    public backgroundUrl: string;
}
