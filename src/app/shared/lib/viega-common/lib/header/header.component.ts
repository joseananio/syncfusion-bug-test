import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';

export interface IMobileMenuStateChanged {
    newMenuState: boolean;
}

export type PageTitleMode = 'desktop-only' | 'mobile-only' | 'always' | 'never';
export type ForceMode = 'desktop' | 'mobile' | false;

/**
 * Represents a default two-row viega header supporting both desktop and mobile modes.
 *
 * This component supports content injection by using the following special attributes on the content elements:
 *     [menu-items] - An element which may act as a container for a set of menu items which should be displayed in the top right
 *                    section of the header. Use <ul> and <li> tags for auto styling. Visible in desktop mode only.
 *     [content] - Injected as the primary content of the header.
 *     [mobile-panel-content] - Injected as the primary content of the mobile menu. Visible in mobile mode only.
 *     [mobile-panel-bottom] - Injected at the bottom of the mobile menu usually representing a list of menu items.
 *                             Use <ul> and <li> tags for auto styling. Visible in mobile mode only.
 */
@Component({
  selector: 'viega-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
    @Input()
    public titleHref: string = '/';

    @Input()
    public logoRouterLink: any = ['/'];

    @Input()
    public logoRouterLinkQueryParams: {};

    /**
     * The application title which is shown in the top left position of the header.
     * However, most applications use the default title "Viega Deutschland" here instead.
     */
    @Input()
    public appTitle: string;

    @Input()
    public pageTitle: string;

    /**
     * Configures when @see pageTitle should be visible.
     */
    @Input()
    public pageTitleMode: PageTitleMode = 'mobile-only';

    @Input()
    public disableBurgerMenu: boolean;

    /**
     * Whether a certain display mode should be enforced. By default the design of the header will
     * automatically switch between desktop and mobile view depending on the page's resolution.
     */
    @Input()
    public forceMode: ForceMode = false;

    public isMobileMenuExpanded: boolean;

    @Output()
    public mobileMenuStateChanged = new EventEmitter<IMobileMenuStateChanged>();

    public setSidebarStatus(newStatus: boolean) {
        this.isMobileMenuExpanded = newStatus;
        this.mobileMenuStateChanged.emit({ newMenuState: newStatus });
    }
}
