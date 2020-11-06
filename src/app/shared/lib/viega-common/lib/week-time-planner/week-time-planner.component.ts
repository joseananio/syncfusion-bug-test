import {
  Component,
  Input,
  Output,
  EventEmitter,
  AfterContentInit,
} from '@angular/core';
import { getTimeStepArray, toDoubleDigit } from './helper';
import {
  SpulStopData,
  SpulOption,
  WeekTimePlannerControlI18n,
} from './week-time-planner-control/week-time-planner-control.component';

interface WeekDayI18nInput {
  key: WeekPlanDay;
  text: string;
}

export interface WeekTimePlannerInternationalization {
  RINSE_TIME_1: string;
  RINSE_TIME_2: string;
  ACTIVATE: string;
  WEEK_DAYS: WeekDayI18nInput[];
  CONTROLLER?: WeekTimePlannerControlI18n;
}
export enum WeekPlanDay {
  mon = 'mon',
  tue = 'tue',
  wed = 'wed',
  thu = 'thu',
  fri = 'fri',
  sat = 'sat',
  sun = 'sun',
}
export interface WeekPlanEntry {
  day: WeekPlanDay | string;
  display?: string;
  startTime?: string;
  endTime?: string;
  valid?: boolean;
}

export interface SpulCalendarModel {
  isActive: boolean;
  entries: WeekPlanEntry[];
  spulStop: {
    option: SpulOption;
    value: number;
    unit: string;
  };
}

@Component({
  selector: 'viega-week-time-planner',
  templateUrl: './week-time-planner.component.html',
  styleUrls: ['./week-time-planner.component.scss'],
  // encapsulation: ViewEncapsulation.None,
})
export class WeekTimePlannerComponent implements AfterContentInit {
  @Input()
  public set isDisabled(isDisabled: boolean) {
    this.isPlannerActive = isDisabled;
  }

  public get isDisabled(): boolean {
    return this.isPlannerActive;
  }

  @Input()
  public calendarData: SpulCalendarModel;

  @Input() showSpulData = false;

  @Input() showActivator = false;

  @Input() public showSecondColumn = true;

  @Input() public i18n: WeekTimePlannerInternationalization;

  @Output() change = new EventEmitter<SpulCalendarModel>();

  public isPlannerActive = true;

  public watermark = '--';

  public isSpulStopOverrideSet = false;

  public timeArray: string[];

  public backUpPlannerEntries: WeekPlanEntry[] = [];

  public entries: WeekPlanEntry[] = [];

  ngAfterContentInit() {
    this.generateCalendar();
  }

  generateCalendar() {
    this.entries = this.calendarData.entries;

    this.i18n.WEEK_DAYS.forEach((day) => {
      const entry = this.entries.find((e) => e.day === day.key);
      if (!entry) {
        this.entries.push({
          day: day.key,
          display: day.text,
          startTime: null,
          endTime: null,
        });
      } else {
        entry.display = entry.display || day.text;
      }
    });

    const times = getTimeStepArray(30).map(
      (date) => `${toDoubleDigit(date.getHours())}:${toDoubleDigit(date.getMinutes())}`,
    );
    this.timeArray = [this.watermark, ...times];
    this.handleCalendarChanges();
  }

  public handleTimeChange(
    timeType: string,
    planEntry: WeekPlanEntry,
    event: any,
  ) {
    this.entries = this.entries.map((entry) => {
      if (entry.day === planEntry.day && event.value === this.watermark) {
        if (timeType === 'startTime') {
          entry.startTime = null;
        } else {
          entry.endTime = null;
        }
      }
      return entry;
    });
    this.handleCalendarChanges();
  }

  public validateCalendar() {
    this.entries = this.entries.map((entry) => {
      // all fieds should be optional
      entry.valid = true;
      return entry;
    });
  }

  public onSpulStopChange(spulData: SpulStopData) {
    this.calendarData.spulStop = {
      ...spulData,
    };

    this.handleCalendarChanges();
  }

  public handleCalendarChanges() {
    this.validateCalendar();
    const { option, value } = this.calendarData.spulStop;

    this.isSpulStopOverrideSet = option && !!value && this.showSpulData;

    if (this.isSpulStopOverrideSet) {
      this.backUpPlannerEntries = [];
      this.entries.forEach((entry) => {
        entry.endTime = null;
        this.backUpPlannerEntries.push({ ...entry });
      });
    } else if (this.backUpPlannerEntries.length > 0) {
      this.entries.forEach((entry, i) => entry.endTime = this.backUpPlannerEntries[i].endTime);
    }
    this.returnCalendar();
  }

  // change event emitter
  returnCalendar() {
    const data = {
      ...this.calendarData,
      entries: this.calendarData.entries,
      isActive: this.isPlannerActive,
    };

    this.change.emit(data);
  }
}
