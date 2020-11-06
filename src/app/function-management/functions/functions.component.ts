import { FeedbackDialogComponent } from 'src/app/shared/components/modal-dialog/feedback-dialog/feedback-dialog.component';
import {
  Component, OnInit, AfterViewInit, ViewChild, EventEmitter,
} from '@angular/core';
import {
  ManagementService, FunctionDto, AuthorityCodes, FunctionTypes,
} from 'src/app/core/services';
import { DataManagerService, NotificationService } from 'src/app/core/services/local-services';
import { SelectionSettingsModel, PageSettingsModel } from '@syncfusion/ej2-grids';
import { GridComponent, ColumnModel } from '@syncfusion/ej2-angular-grids';
import { MatDialog } from '@angular/material/dialog';
import { QuestionDialogComponent } from 'src/app/shared/components/modal-dialog/question-dialog/question-dialog.component';
import { IToggleButtonValueChangeEvent } from 'src/app/shared/lib/viega-common/lib/toggle-button';
import { finalize } from 'rxjs/operators';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { ThermalDisinfectModalComponent } from '../thermal-disinfect-modal/thermal-disinfect-modal.component';
import { FunctionAddComponent } from '../function-add/function-add.component';
import { LayoutModule } from '../../shared/layout.module';

interface FunctionDtoExt extends FunctionDto {
  typeDisplayText?: string;
}
@Component({
  selector: 'app-functions',
  templateUrl: './functions.component.html',
  styleUrls: ['./functions.component.scss'],
})
export class FunctionsComponent implements OnInit, AfterViewInit {
  public gridData: FunctionDtoExt[] = [];

  @ViewChild('functionGrid') public functionGrid: GridComponent;

  public funcGridSelectionOptions: SelectionSettingsModel = {
    type: 'Single',
    mode: 'Both',
    enableToggle: false,
  };

  public pageSettings: PageSettingsModel = {
    pageSize: 10,
  };

  activeHeaderText = _('FUNCTIONS.ACTIVE');

  nameHeaderText = _('FUNCTIONS.NAME');

  functionTypeHeaderText = _('FUNCTIONS.FUNCTION');

  possibleActionsText = _('FUNCTIONS.POSSIBLE_ACTIONS');

  // table columns
  public funcTableColumns: ColumnModel[] = [
    {
      field: 'name',
      headerText: _('FUNCTIONS.NAME'),
      textAlign: 'Left',
    },
    {
      field: 'typeName',
      headerText: _('FUNCTIONS.FUNCTION'),
      textAlign: 'Left',
    },
    {
      field: 'numberOfFlushableDevicePoints',
      headerText: _('FUNCTIONS.NUMBER_OF_DEVICES'),
      textAlign: 'Left',
      hideAtMedia: LayoutModule.getHideAtMedia('md'),
    },
    /* TODO: Disabled:
    {
      field: 'remark',
      headerText: 'Info',
      textAlign: 'Left',
    },
    */
    {
      field: 'lastRunDate',
      headerText: _('FUNCTIONS.LAST_RUN_DATE'),
      textAlign: 'Left',
      format: { type: 'dateTime', skeleton: 'short' },
      hideAtMedia: LayoutModule.getHideAtMedia('lg'),
    },
  ];

  public stateLoading = false;

  AuthorityCodes = AuthorityCodes;

  authorities: Set<string> = new Set();

  authoritiesRequest;

  constructor(
    private mgmtService: ManagementService,
    private dataManagerService: DataManagerService,
    private notificationService: NotificationService,
    private dialog: MatDialog,
  ) {}

  ngOnInit() {
    this.authoritiesRequest = this.dataManagerService.getUserAuthorityDataManager().ready;
    this.getAllFunctions();
  }

  ngAfterViewInit() {
    this.authoritiesRequest.then((authorities: string[]) => {
      this.authorities = new Set(authorities['result'].authorityCodes);
    }).catch(() => {
      this.notificationService.notify(_('GLOBAL.COULD_NOT_LOAD_PRIVILEGES'));
    });
  }

  private getAllFunctions(): void {
    this.stateLoading = true;
    this.mgmtService
      .getAllFunctions()
      .pipe(finalize(() => { this.stateLoading = false; }))
      .subscribe((functions) => {
        this.gridData = functions.map((functionItem) => ({
          ...functionItem,
          typeName: this.translateFunctionType(functionItem),
          lastRunDate: this.lastRun(functionItem),
        }));
      });
  }

  private lastRun(functionItem: FunctionDto): Date {
    let timestamp = null;
    if (functionItem.flushSchedule && functionItem.flushSchedule.lastExecutionPwcTimestamp) {
      timestamp = new Date(functionItem.flushSchedule.lastExecutionPwcTimestamp);
    }
    if (functionItem.flushSchedule && functionItem.flushSchedule.lastExecutionPwhTimestamp) {
      const timestamp2 = new Date(functionItem.flushSchedule.lastExecutionPwhTimestamp);
      if (timestamp2 > timestamp) {
        timestamp = timestamp2;
      }
    }
    return timestamp;
  }

  private translateFunctionType(functionItem: FunctionDto) {
    if (functionItem.type === FunctionTypes.HygieneFlush) {
      return this.translateHygieneFlushFunction(functionItem);
    }
    const defs = {
      [FunctionTypes.Circulation]: _('FUNCTIONS.FUNCTION_NAMES.CIRCULATION'),
      [FunctionTypes.ThermalDisinfection]: _('FUNCTIONS.FUNCTION_NAMES.THERMAL_DISINFECTION'),
    };
    return defs[functionItem.type] || functionItem.type;
  }

  // Note: same checks are used in function-add.component.ts
  private translateHygieneFlushFunction(functionItem: FunctionDto) {
    if (functionItem.flushSchedule) {
      if (functionItem.flushSchedule.weeklyFlushPlan) {
        return _('FUNCTIONS.FUNCTION_NAMES.HYGIENE_FLUSH_CALENDAR');
      }
      if (functionItem.flushSchedule.fixIntervalFlushPlan && functionItem.flushSchedule.fixIntervalFlushPlan.startDateUtc) {
        return _('FUNCTIONS.FUNCTION_NAMES.HYGIENE_FLUSH_INTERVAL');
      }
      return _('FUNCTIONS.FUNCTION_NAMES.HYGIENE_FLUSH_USAGE');
    }
    return functionItem.type;
  }

  public isCirculationFunction(data: FunctionDtoExt) {
    return this.authorities.has(AuthorityCodes.EXECUTEFUNCTION) && data.type === FunctionTypes.Circulation;
  }

  public getButtonColumnWidth(): number {
    const CELL_PADDING = 42;
    const CELL_SIZE = 42;
    return (
      CELL_PADDING
      + [AuthorityCodes.EXECUTEFUNCTION, AuthorityCodes.UPDATEDEVICEPOINTGROUPFUNCTION, AuthorityCodes.DELETEDEVICEPOINTGROUPFUNCTION]
        .map((authority) => +this.authorities.has(authority) * CELL_SIZE)
        .reduce((acc, curr) => acc + curr)
    );
  }

  // syncfusion handlers

  public onDataBound(): void {
    if (this.functionGrid) {
      this.functionGrid.autoFitColumns();
    }
  }

  // general handlers

  /**
   * Called when the toggle button is pressed
   * this should call activation endpoint for the specific row.
   *
   * @param event EventEmitter<IToggleButtonValueChangeEvent>Event.
   * @param functionName
   */
  public onToggleActivationBtnClick(event: EventEmitter<IToggleButtonValueChangeEvent>, functionName: string): void {
    if (event) {
      this.mgmtService.resetDisabledTimestamp(functionName).subscribe(
        () => {
          this.getAllFunctions();
        },
        (err) => {
          this.handleActivationToggleError(err);
        },
      );
    } else {
      this.mgmtService
        .setDisabledTimestamp({
          devicePointGroupFunctionName: functionName,
          disabledTimestamp: null, // disable NOW
        })
        .subscribe(
          () => {
            this.getAllFunctions();
          },
          (err) => {
            this.handleActivationToggleError(err);
          },
        );
    }
  }

  private handleActivationToggleError(error): void {
    this.getAllFunctions();
    this.notificationService.notify(_('FUNCTIONS.COULD_NOT_ENABLE_FUNCTION'));
    console.error(error);
  }

  public onFunctionPlayClick(event: MouseEvent, data: FunctionDto): void {
    event.stopPropagation();

    // A thermal disinfection is very different from all other functions. So there is a dedicated dialog for it.
    const dialogParameters = [
      {
        data,
        dialog: ThermalDisinfectModalComponent,
      },
      {
        data: { message: _('FUNCTIONS.SHOULD_FUNCTION_BE_STARTED_NOW'), params: { functionName: data.name } },
        dialog: QuestionDialogComponent,
      },
    ];
    const dialogRef = this.dialog.open(dialogParameters[data.type === FunctionTypes.ThermalDisinfection ? 0 : 1].dialog as any, {
      data: dialogParameters[data.type === FunctionTypes.ThermalDisinfection ? 0 : 1].data,
      hasBackdrop: true,
      disableClose: true,
    });
    if (data.type !== FunctionTypes.ThermalDisinfection) {
      dialogRef.afterClosed().subscribe((result) => {
        if (result === true) {
          this.executeFunctionNow(data.name);
        }
      });
    }
  }

  private executeFunctionNow(name: string): void {
    this.mgmtService.executeFunctionTest(name).subscribe(
      (ok) => {
        // TODO (Reger): This endpoint resolves if flushing is done, hence message should be part tense.
        this.dialog.open(FeedbackDialogComponent, {
          data: {
            message: _('FUNCTIONS.EXECUTION_DONE_FEEDBACK'),
            params: {
              name,
            },
          },
        });
      },
      (err) => {
        console.error(`Error executing function ${name}.`);
        console.error(err);
        this.notificationService.notify({
          message: _('FUNCTIONS.EXECUTION_FAILED_FEEDBACK'),
          messageParameters: { name },
        });
      },
    );
  }

  public onFunctionEditClick(event: MouseEvent, data: FunctionDto): void {
    event.stopPropagation();
    this.dialog
      .open(FunctionAddComponent, {
        data,
        width: '70%',
      })
      .afterClosed()
      .subscribe((res) => {
        this.getAllFunctions();
      });
  }

  /**
   * Remove a function. Listens to success events from modal.
   *
   * @param event
   * @param data
   */
  public onFunctionRemoveClick(event: MouseEvent, data: FunctionDto): void {
    event.stopPropagation();

    this.dialog
      .open(QuestionDialogComponent, {
        data: { message: _('FUNCTIONS.FUNCTION_DELETE_WARNING') },
        width: '30%',
      })
      .afterClosed()
      .subscribe((res) => {
        if (res) {
          this.mgmtService.deleteFunction(data.name).subscribe(
            (response) => {
              this.getAllFunctions();
            },
            (error) => {
              this.notificationService.notify(_('FUNCTIONS.COULD_NOT_DELETE_FUNCTION'));
              console.error(error);
              this.getAllFunctions();
            },
          );
        }
      });
  }

  public onOpenNewFuncDialogClick(): void {
    const dialogRef = this.dialog.open(FunctionAddComponent, {
      width: '70%',
    });

    const succEvt = dialogRef.componentInstance.onSaveSuccess.subscribe(() => {
      this.getAllFunctions();
    });

    const failEvt = dialogRef.componentInstance.onSaveFail.subscribe((error) => { /* do nothing */ });

    dialogRef.afterClosed().subscribe(
      () => { /* do nothing */ },
      () => { /* do nothing */ },
      () => {
        succEvt.unsubscribe();
        failEvt.unsubscribe();
      },
    );
  }

  public canToggleCyclicFunctionExecution(deviceFunction: FunctionDto): boolean {
    return (
      this.authorities.has(AuthorityCodes.SETDEVICEPOINTGROUPFUNCTIONDISABLED)
      && this.authorities.has(AuthorityCodes.RESETDEVICEPOINTGROUPFUNCTIONDISABLED)
      && (deviceFunction.type === FunctionTypes.HygieneFlush || deviceFunction.type === FunctionTypes.Circulation)
    );
  }
}
