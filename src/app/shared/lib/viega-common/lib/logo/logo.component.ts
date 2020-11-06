import { Component, OnInit, Input } from '@angular/core';

@Component({
    selector: 'viega-logo',
    templateUrl: './logo.component.html',
    styleUrls: ['./logo.component.scss']
})
export class LogoComponent implements OnInit {
    @Input()
    public disableShadow: boolean;

    constructor() {}

    public ngOnInit() {

    }
}
