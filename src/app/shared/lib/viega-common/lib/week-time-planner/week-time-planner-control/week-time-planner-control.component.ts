import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';

export interface WeekTimePlannerControlI18n {
  VOLUME: string;
  TIME: string;
  TITLE: string;
}
export interface SpulStopData {
  option: SpulOption;
  value: number;
  unit: string;
}
export enum SpulOption {
  VOLUME = 'volume',
  TIME = 'time',
}

@Component({
  selector: 'viega-week-time-planner-control',
  templateUrl: './week-time-planner-control.component.html',
  styleUrls: ['./week-time-planner-control.component.scss'],
})
export class WeekTimePlannerControlComponent implements OnInit {
  @Input() public title: string;

  @Input() public isActive = true;

  @Input()
  public spulStopData: SpulStopData;

  @Input() i18n: WeekTimePlannerControlI18n;

  @Output() change = new EventEmitter<SpulStopData>();

  public spulVolumeInput: number;

  public spulTimeInput: number;

  public activeSpulOption: SpulOption = SpulOption.VOLUME;

  public spulOptionUnits = {
    volume: 'l/min',
    time: 's',
  };

  constructor() {}

  ngOnInit() {
    const { option, unit, value } = this.spulStopData;
    this.activeSpulOption = option;
    if (this.spulOptionUnits.time === unit) {
      this.spulTimeInput = value;
    } else {
      this.spulVolumeInput = value;
    }
  }

  public handleCalendarChanges() {
    const spulData: SpulStopData = {
      option: this.activeSpulOption,
      unit: this.spulOptionUnits[this.activeSpulOption],
      value: this.getSpulValue(),
    };
    this.change.emit(spulData);
  }

  public onActiveSpulOption(option: string) {
    this.activeSpulOption = option as SpulOption;
    this.handleCalendarChanges();
    this.spulVolumeInput = null;
    this.spulTimeInput = null;
  }

  public handleSpulInputChange(spulOption: string, event: Event) {
    this.handleCalendarChanges();
  }

  public getSpulValue() {
    return this.activeSpulOption === SpulOption.VOLUME
      ? this.spulVolumeInput
      : this.spulTimeInput;
  }
}
