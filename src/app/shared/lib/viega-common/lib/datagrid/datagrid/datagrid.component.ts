import { Component, OnInit, Input } from '@angular/core';
import { GridComponent } from '@syncfusion/ej2-angular-grids';
import { setCulture, L10n } from '@syncfusion/ej2-base';

setCulture('de-DE');

L10n.load({
  'de-DE': {
    grid: {
      EmptyRecord: 'Keine Daten vorhanden',
      GroupDropArea: 'Ziehen Sie einen Spaltenkopf hier, um die Gruppe ihre Spalte',
      UnGroup: 'Klicken Sie hier, um die Gruppierung aufheben',
      EmptyDataSourceError:
        'DataSource darf bei der Erstauslastung nicht leer sein, da Spalten aus der dataSource im AutoGenerate Spaltenraster',
      Item: 'Artikel',
      Items: 'Artikel',
    },
    pager: {
      currentPageInfo: '{0} von {1} Seiten',
      totalItemsInfo: '({0} Einträge)',
      firstPageTooltip: 'Zur ersten Seite',
      lastPageTooltip: 'Zur letzten Seite',
      nextPageTooltip: 'Zur nächsten Seite',
      previousPageTooltip: 'Zurück zur letzten Seit',
      nextPagerTooltip: 'Zum nächsten Pager',
      previousPagerTooltip: 'Zum vorherigen Pager',
      pagerDropDown: 'Einträge pro Seite',
      pagerAllDropDown: 'Einträge',
      All: 'Alle',
    },
  },
});

/**
 * Table displaying data with specified columns.
 * Allows sorting, paging.
 * Binds to local data object.
 * Use 'ColumnData' input to select data and style the grid.
 */
@Component({
  selector: 'viega-datagrid',
  templateUrl: './datagrid.component.html',
  styleUrls: ['./datagrid.component.scss'],
})
export class DatagridComponent implements OnInit {
  constructor() {}

  /**
   * Columns to be displayed.
   * 'columns.field' must match property in Data object or cell will be blank.
   */
  @Input()
  public columns: ColumnData[] = null;

  /**
   * Data Input.
   * Needs to be object of keys and values.
   */
  @Input()
  public data: { [key: string]: any } = [
    {
      'Empty Table': 'There is no data to display.',
    },
  ];

  @Input()
  /**
   * Language of Syncfusion translations.
   * 'en-US' is available without modifications, any other language must be defined in this component additionally.
   * A partial German translation has been implemented viega-datagrid with 'i10n.load'.
   * [see syncfusion docs]{@link https://ej2.syncfusion.com/angular/documentation/grid/global-local/#loading-translations}
   */
  public locale = 'de-DE';

  /**
   * Defines if column is sortable.
   * Column will show an arow indicating sorting after initial mouse click.
   */
  @Input()
  public allowSorting = true;

  /**
   * Defines if table is paginated in groups of 10 entries.
   */
  @Input()
  public allowPaging = true;

  @Input()
  public pageSettings = { pageSize: 10 };

  ngOnInit() {}
}

/**
 * An interface for viega-datagrid input 'columns'.
 */
export interface ColumnData {
  /**
   * Data field to be displayed. Field must exist in input 'data'.
   */
  field: string;
  /**
   * Column header text of displayed data field.
   */
  headerText: string;
  /**
   * Width of columns. Defaults to '100%'
   */
  width?: string | number;
  /**
   * default 'Left', optional
   */
  textAlign?: string;
  /**
   * Format of syncfusion datagrid column, e.g. 'yMd' for dates, optional.
   * [See Syncfusion documentation]{@link https://ej2.syncfusion.com/angular/documentation/grid/columns/#format}
   */
  format?: string;
  /**
   * Template to include html into a cell.
   * [See Syncfusion documentation]{@link https://www.syncfusion.com/forums/135103/creating-dynamic-hyperlink-in-grid-control-using-column-template}
   */
  template?: string;
  /**
   * You can toggle column visibility based on media queries which are defined at the
   * hideAtMedia. The hideAtMedia accepts valid Media Queries.
   *
   * Example: hideAtMedia='(min-width: 700px)'
   */
  hideAtMedia?: string;
}
