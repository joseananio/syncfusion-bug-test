import { Component, OnInit, Input, EventEmitter, Output, ContentChild, TemplateRef, QueryList, ViewChildren, ElementRef, ViewChild } from '@angular/core';

export interface IScrollboxItemSelectedEvent {
    selectedItem: any;
}

@Component({
    selector: 'viega-item-scrollbox',
    templateUrl: './item-scrollbox.component.html',
    styleUrls: ['./item-scrollbox.component.scss']
})
export class ItemScrollboxComponent implements OnInit {
    private static bufferWidth: number = 30;

    private _items: any[];
    public get items(): any[] {
        return this._items;
    }

    @Input()
    public set items(newValue: any[]) {
        if (this._items !== newValue) {
            this._items = newValue;
            this.scrollOffset = 0;
        }
    }

    @Input()
    public selectedItem: any;

    @Input()
    public itemPadding: string = "1em";

    @Output()
    public itemSelected = new EventEmitter<IScrollboxItemSelectedEvent>();

    @ContentChild(TemplateRef)
    public listItemTemplate: TemplateRef<any>;

    @ViewChildren("items")
    public itemElements: QueryList<any>;

    public scrollOffset: number = 0;

    constructor(private element: ElementRef) {}

    public ngOnInit(): void {}

    public item_click(event: MouseEvent, item: any) {
        const listElement = this.element.nativeElement as HTMLElement;
        const itemElement = event.target as HTMLElement;

        const listWidth = listElement.offsetWidth - itemElement.offsetWidth / 2;
        const itemLeft = itemElement.offsetLeft;
        const itemCenter = itemLeft + itemElement.offsetWidth / 2;

        const lastItemElement = this.itemElements.last.nativeElement as HTMLElement;
        const totalScrollWidth = lastItemElement.offsetLeft + lastItemElement.offsetWidth - listWidth;

        const xOffset = Math.max(0, Math.min(itemCenter - listWidth / 2, totalScrollWidth));
        this.scrollTo(xOffset);

        this.selectedItem = item;
        this.itemSelected.emit({ selectedItem: item });
    }

    private scrollTo(xOffset: number) {
        this.scrollOffset = xOffset;
    }
}
