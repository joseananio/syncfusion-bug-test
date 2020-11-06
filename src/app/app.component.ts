import { registerLocaleData } from '@angular/common';
import de from '@angular/common/locales/de';
import en from '@angular/common/locales/en';
import {
  Component, HostBinding, OnDestroy, OnInit,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { L10n, loadCldr, setCulture } from '@syncfusion/ej2-base';
import { version } from 'package.json';
import { Subscription } from 'rxjs';


declare let require: any;

/* eslint-disable @typescript-eslint/no-var-requires */
loadCldr(
  require('cldr-data/supplemental/numberingSystems.json'),
  require('cldr-data/main/de/ca-gregorian.json'),
  require('cldr-data/main/en/ca-gregorian.json'),
  require('cldr-data/main/de/numbers.json'),
  require('cldr-data/main/en/numbers.json'),
  require('cldr-data/main/de/timeZoneNames.json'),
  require('cldr-data/main/en/timeZoneNames.json'),
  require('cldr-data/supplemental/weekData.json'),
);
/* eslint-enable @typescript-eslint/no-var-requires */

interface MenuItem {
  id?: string;
  text: string;

  /**
   * A URL or callback function.
   */
  action: string | (() => void);

  /**
   * Indicates to only show an entry in mobile mode.
   */
  mobileViewOnly?: boolean;

  show?: () => boolean;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
  // Add frontend version to app-root node
  @HostBinding('attr.app-version') appVersion = version;

  public controllersInErrorStateCount: number;

  public loggedIn: boolean;

  public controllerErrorMessages = {
    '=1': _('APP.GLOBAL_ERROR_MESSAGE_SINGULAR'),
    other: _('APP.GLOBAL_ERROR_MESSAGE_PLURAL'),
  };

  private loginStateSubscription: Subscription;

  public topMenuItems: MenuItem[] = [
  ];

  constructor(
    private router: Router,
    private dialog: MatDialog,
    private translate: TranslateService,
  ) {
  }

  ngOnInit() {
    this.setLocalisation();
    this.translate.onLangChange.subscribe((params: LangChangeEvent) => {
      sessionStorage.setItem('locale', params.lang);
      this.loadLocalization(params.lang);
    });
  }

  ngOnDestroy() {
    if (this.loginStateSubscription) {
      this.loginStateSubscription.unsubscribe();
    }
  }

  private setLocalisation() {
    registerLocaleData(en);
    registerLocaleData(de);
    this.translate.addLangs(['de', 'en']);
    // If someone uses a third language in the browser, English is most likely the best fallback.
    this.translate.setDefaultLang('en');
    const storedLocale = sessionStorage.getItem('locale');
    const browserLang = this.translate.getBrowserLang();
    this.translate.use(storedLocale || browserLang);
  }

  private loadLocalization(language: string) {
    // Add field for software version to language file.
    _('_META.VERSION');

    // Load other languages when needed.
    // Lazy-loading is not possible since it it not possible to merge a new language into the
    // already loaded localization.
    const keys = [
      _('DATERANGEPICKER.PLACE_HOLDER'),
      _('DATERANGEPICKER.START_LABEL'),
      _('DATERANGEPICKER.END_LABEL'),
      _('DATERANGEPICKER.APPLY_TEXT'),
      _('DATERANGEPICKER.CANCEL_TEXT'),
      _('DATERANGEPICKER.SELECTED_TEXT'),
      _('DATERANGEPICKER.DAYS'),
      _('DATERANGEPICKER.CUSTOM_RANGE'),
      _('DATEPICKER.DATE_PLACE_HOLDER'),
      _('DATEPICKER.TODAY'),
      _('GRID.EMPTY_RECORD'),
      _('GRID.ITEM'),
      _('GRID.ITEMS'),
      _('GRID.FILTER_BUTTON'),
      _('GRID.CLEAR_BUTTON'),
      _('PAGER.CURRENT_PAGE_INFO'),
      _('PAGER.TOTAL_ITEMS_INFO'),
      _('PAGER.TOTAL_ITEM_INFO'),
      _('PAGER.FIRST_PAGE_TOOLTIP'),
      _('PAGER.LAST_PAGE_TOOLTIP'),
      _('PAGER.NEXT_PAGE_TOOLTIP'),
      _('PAGER.PREVIOUS_PAGE_TOOLTIP'),
      _('PAGER.NEXT_PAGER_TOOLTIP'),
      _('PAGER.PREVIOUS_PAGER_TOOLTIP'),
      _('PAGER.PAGER_DROP_DOWN'),
      _('PAGER.PAGER_ALL_DROP_DOWN'),
      _('PAGER.ALL'),
      _('DROPDOWN.NO_RECORDS_TEMPLATE'),
      _('DROPDOWN.ACTION_FAILURE_TEMPLATE'),
    ];
    this.translate.get(keys).subscribe((strings) => {
      setCulture(language);
      L10n.load({
        [language]: {
          daterangepicker: {
            placeholder: strings['DATERANGEPICKER.PLACE_HOLDER'],
            startLabel: strings['DATERANGEPICKER.START_LABEL'],
            endLabel: strings['DATERANGEPICKER.END_LABEL'],
            applyText: strings['DATERANGEPICKER.APPLY_TEXT'],
            cancelText: strings['DATERANGEPICKER.CANCEL_TEXT'],
            selectedDays: strings['DATERANGEPICKER.SELECTED_TEXT'],
            days: strings['DATERANGEPICKER.DAYS'],
            customRange: strings['DATERANGEPICKER.CUSTOM_RANGE'],
          },
          datepicker: {
            placeholder: strings['DATEPICKER.DATE_PLACE_HOLDER'],
            today: strings['DATEPICKER.TODAY'],
          },
          datetimepicker: {
            placeholder: strings['DATEPICKER.DATE_PLACE_HOLDER'],
            today: strings['DATEPICKER.TODAY'],
          },
          grid: {
            EmptyRecord: strings['GRID.EMPTY_RECORD'],
            Item: strings['GRID.ITEM'],
            Items: strings['GRID.ITEMS'],
            FilterButton: strings['GRID.FILTER_BUTTON'],
            ClearButton: strings['GRID.CLEAR_BUTTON'],
          },
          pager: {
            currentPageInfo: strings['PAGER.CURRENT_PAGE_INFO'],
            totalItemsInfo: strings['PAGER.TOTAL_ITEMS_INFO'],
            totalItemInfo: strings['PAGER.TOTAL_ITEM_INFO'],
            firstPageTooltip: strings['PAGER.FIRST_PAGE_TOOLTIP'],
            lastPageTooltip: strings['PAGER.LAST_PAGE_TOOLTIP'],
            nextPageTooltip: strings['PAGER.NEXT_PAGE_TOOLTIP'],
            previousPageTooltip: strings['PAGER.PREVIOUS_PAGE_TOOLTIP'],
            nextPagerTooltip: strings['PAGER.NEXT_PAGER_TOOLTIP'],
            previousPagerTooltip: strings['PAGER.PREVIOUS_PAGER_TOOLTIP'],
            pagerDropDown: strings['PAGER.PAGER_DROP_DOWN'],
            pagerAllDropDown: strings['PAGER.PAGER_ALL_DROP_DOWN'],
            All: strings['PAGER.ALL'],
          },
          dropdowns: {
            noRecordsTemplate: strings['DROPDOWN.NO_RECORDS_TEMPLATE'],
            actionFailureTemplate: strings['DROPDOWN.ACTION_FAILURE_TEMPLATE'],
          },
        },
      });
    });
  }

  public isFunction(variable: any) {
    return typeof variable === 'function';
  }
}
