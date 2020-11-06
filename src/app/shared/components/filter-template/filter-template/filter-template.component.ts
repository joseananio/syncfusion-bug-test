/* eslint max-classes-per-file: 0 */
import {
  AfterViewInit, Component, EventEmitter, Inject, Input, Output, ViewChild,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { ListBoxComponent } from '@syncfusion/ej2-angular-dropdowns';
import { FieldSettingsModel } from '@syncfusion/ej2-dropdowns/src/drop-down-base/drop-down-base-model';
import { SystemService } from 'src/app/core/services/api/system.service';
import { AuthenticationService, NotificationService } from 'src/app/core/services/local-services';
import { InputDialogComponent, InputDialogData } from '../../modal-dialog/input-dialog/input-dialog.component';

/**
 * Collection of all possible filter settings to be stored in Templates.
 */
export interface FilterItem {
  functionFilter?: string;
  functionTypeFilter?: string;
  deviceTypeFilter?: string;
  deviceNameFilter?: string;
  measurementPointFilter?: string;
  dateStartFilter?: string;
  dateEndFilter?: string;
  leftYAxisUnitFilter?: string;
  leftDeviceSelectionFilter?: string;
  rightYAxisUnitFilter?: string;
  rightDeviceSelectionFilter?: string;
  statusFilter?: string;
}

/* export interface FilterTemplate {
  name: string;
  section: string;
  filters: {
    functionFilter?: string;
    functionTypeFilter?: string;
    deviceTypeFilter?: string;
    deviceNameFilter?: string;
    measurementPointFilter?: string;
    dateStartFilter?: string;
    dateEndFilter?: string;
    leftYAxisUnitFilter?: string;
    leftDeviceSelectionFilter?: string;
    rightYAxisUnitFilter?: string;
    rightDeviceSelectionFilter?: string;
    statusFilter?: string;
  };
} */

export class FilterTemplate {
  name: string;

  section: string;

  filters: FilterItem;

  constructor() {
    this.name = '';
    this.section = '';
    this.filters = {
      functionFilter: '',
      functionTypeFilter: '',
      deviceTypeFilter: '',
      deviceNameFilter: '',
      measurementPointFilter: '',
      dateStartFilter: '',
      dateEndFilter: '',
      leftYAxisUnitFilter: '',
      leftDeviceSelectionFilter: '',
      rightYAxisUnitFilter: '',
      rightDeviceSelectionFilter: '',
      statusFilter: '',
    };
  }
}

/**
 * Use binding [(activeFilters)] in template and extracting those typed filters you need.
 * Import interface FilterTemplate into your component using this class.
 */
@Component({
  selector: 'app-filter-template',
  templateUrl: './filter-template.component.html',
  styleUrls: ['./filter-template.component.scss'],
})
export class FilterTemplateComponent implements AfterViewInit {
  @ViewChild('listboxReference') listBoxReference: ListBoxComponent;

  listboxobj: ListBoxComponent;

  listBoxCreated = false;

  // No camel cases because expected to be more robust in backend.
  // Must remain unaltered throughout the product lifecycle and updates!
  filterTemplateApplicationKey = 'filtertemplates';

  currentUserName: string;

  listboxHeight = 80;

  selected: string = null;

  listBoxFields: FieldSettingsModel = {
    text: 'name',
    value: 'name',
  };

  listBoxItems = [{
    name: '',
  }];

  public selection = {
    mode: 'Single',
  };

  public enabled = true;

  initialFilterTemplate: FilterTemplate[] = [{
    name: _('PROTOCOLS.FILTER_TEMPLATE'),
    section: '',
    filters: {
      functionFilter: '',
      functionTypeFilter: '',
      deviceTypeFilter: '',
      deviceNameFilter: '',
      measurementPointFilter: '',
      dateStartFilter: '',
      dateEndFilter: '',
      leftYAxisUnitFilter: '',
      leftDeviceSelectionFilter: '',
      rightYAxisUnitFilter: '',
      rightDeviceSelectionFilter: '',
      statusFilter: '',
    },
  },
  ];

  templateDisplayList: FilterTemplate[] = {} as FilterTemplate[];

  templateList: FilterTemplate[] = [{
    name: _('PROTOCOLS.FILTER_TEMPLATE'),
    section: '',
    filters: {
      functionFilter: '',
      functionTypeFilter: '',
      deviceTypeFilter: '',
      deviceNameFilter: '',
      measurementPointFilter: '',
      dateStartFilter: '',
      dateEndFilter: '',
      leftYAxisUnitFilter: '',
      leftDeviceSelectionFilter: '',
      rightYAxisUnitFilter: '',
      rightDeviceSelectionFilter: '',
      statusFilter: '',
    },
  },
  ];

  constructor(
    @Inject('AuthService') private authService: AuthenticationService,
    private systemService: SystemService,
    private notificationSerivce: NotificationService,
    private dialog: MatDialog,
  ) { }

  @Input() activeFilter: FilterItem;

  @Input() protocolType: string;

  /**
   * Current section from where the FilterTemplateComponent is called.
   * Will filter all Templates to only show applicable filters of this section.
   */
  @Input() section: string;

  @Output() activeFilterChange: EventEmitter<FilterItem> = new EventEmitter();

  ngAfterViewInit() {
    // Get user name
    this.currentUserName = this.authService.getUserName();
    // Store the actual current section in the first sample filter template
    this.initialFilterTemplate[0].section = this.section;
    this.getStoredFilterTemplates();
  }

  onSelect(selectedEvent: any) {
    this.selected = selectedEvent.items[0].name;
    this.activeFilter = this.templateDisplayList.filter(
      (template) => template.name === this.selected,
    )[0].filters;
    this.emitChange();
  }

  onAddTemplate() {
    const inputDialogData: InputDialogData = {
      message: _('SHARED.TEMPLATE_NAME_QUESTION'),
      inputType: 'input',
    };
    const confirmDialog = this.dialog.open(
      InputDialogComponent,
      {
        data: inputDialogData,
      },
    );
    confirmDialog.afterClosed().subscribe((newTemplateName?: string) => {
      if (newTemplateName !== null) {
        const oldFilter = this.templateList.find((f) => f.name === newTemplateName);
        if (oldFilter) {
          return;
        }
        const newFilter: FilterTemplate = {
          name: newTemplateName,
          section: this.section,
          filters: this.activeFilter,
        };
        this.templateList.push(newFilter);
        this.refreshDropdownList();
        this.saveFilterTemplate();
      }
    });
  }

  onDeleteTemplate() {
    this.templateList = this.templateList.filter(
      (templateItem) => templateItem.name !== this.selected,
    );
    this.refreshDropdownList();
    this.saveFilterTemplate();
  }

  private initializePreferenceDB() {
    // TODO (Reger): Remove escaping once backend accepts unescaped json-strings
    let stringifiedNewFilterTemplateConfig = JSON.stringify(this.initialFilterTemplate).replace(/"/g, '\\"');
    // Backend needs further wrapping quotemarks
    stringifiedNewFilterTemplateConfig = `"${stringifiedNewFilterTemplateConfig}"`;
    this.systemService.setSystemPreference(
      this.filterTemplateApplicationKey,
      stringifiedNewFilterTemplateConfig,
    ).subscribe(
      (ok) => {
        this.enabled = true;
        this.getStoredFilterTemplates();
      },
      (err) => {
        this.enabled = false;
        this.notificationSerivce.notify(_('SHARED.COULD_NOT_LOAD_FILTER_TEMPLATES'));
        console.error(err);
      },
    );
  }

  getStoredFilterTemplates() {
    this.systemService.getSystemPreference(this.filterTemplateApplicationKey).subscribe(
      (preference) => {
        this.templateList = (JSON.parse(preference));
        // Sanitize misconfigured Json, hence keeping the parameterConfig clean
        this.templateList = this.templateList.filter(
          (templateItem) => templateItem.name !== undefined && templateItem.name !== '',
        );
        this.refreshDropdownList();
      },
      (error) => {
        // Assuming preference not existing yet, adding empty preference.
        if (error.status === 404) {
          this.initializePreferenceDB();
        }
      },
    );
  }

  saveFilterTemplate() {
    // TODO (Reger): Remove escaping once backend accepts unescaped json-strings
    let stringifiedFilterTemplateConfig = JSON.stringify(this.templateList).replace(/"/g, '\\"');
    // Backend needs further wrapping quotemarks
    stringifiedFilterTemplateConfig = `"${stringifiedFilterTemplateConfig}"`;
    this.systemService.setSystemPreference(
      this.filterTemplateApplicationKey,
      stringifiedFilterTemplateConfig,
    ).subscribe(
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      (ok) => { /* do nothing */ },
      (err) => {
        this.notificationSerivce.notify(_('SHARED.COULD_NOT_SAVE_FILTER_TEMPLATES'));
        console.error(err);
      },
    );
  }

  refreshDropdownList() {
    this.templateDisplayList = this.templateList.filter(
      (templateItem) => templateItem.section === this.section,
    );
    this.listBoxItems = this.templateDisplayList.map(
      (singleTemplate: FilterTemplate) => ([{ name: singleTemplate.name }][0]),
    );
    this.listBoxReference.dataSource = null;
    this.listBoxReference.fields = this.listBoxFields;
    this.listBoxReference.dataSource = this.listBoxItems;
    this.selected = null;
  }

  emitChange() {
    this.activeFilterChange.emit(this.activeFilter);
  }

  resetSelection() {
    this.selected = null;
    this.listBoxReference.value = [''];
    this.listBoxReference.refresh();
  }

  /**
   * Call from parent to reset the selection.
   */
  public reset() {
    this.resetSelection();
  }
}
