import {
  Component, OnInit, ViewChild,
} from '@angular/core';
import {
  ColumnModel, CellSelectEventArgs, TextWrapSettingsModel, FilterSettingsModel,
} from '@syncfusion/ej2-angular-grids';
import { RowExpandedEventArgs, RowExpandingEventArgs, TreeGridComponent } from '@syncfusion/ej2-angular-treegrid';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import data from './data.json';

@Component({
  selector: 'app-devices',
  templateUrl: './devices.component.html',
  styleUrls: ['./devices.component.scss'],
})
export class DevicesComponent implements OnInit {
  wrapSettings: TextWrapSettingsModel = {
    wrapMode: 'Both',
  };

  columns: ColumnModel[] = [
    { field: 'ipAddress', headerText: _('DEVICES.IP_ADDRESS') },
  ];

  public gridDataSource = data;

  public filterSettings: FilterSettingsModel = {};

  public lssActive = false;

  @ViewChild('treegrid')
  public treeGrid: TreeGridComponent;

  public stateLoading = false;

  collapsedNodes: string[] = [];

  constructor() { }

  ngOnInit() {
    setTimeout(() => {
      this.gridDataSource = data;
    }, 100);
  }

  public getStatus(item: any) {
    return {
      text: item.status,
      class: `status-${item.status}`,
    };
  }

  public onDeviceAction(event: CellSelectEventArgs): void {
    // TODO
  }

  public onNodeCollapsed(args: RowExpandingEventArgs): void {
    // this.collapsedNodes.add(args.data['uuid']);
  }

  public onNodeExpanded(args: RowExpandedEventArgs) {
    // this.collapsedNodes.delete(args.data['uuid']);
  }
}
