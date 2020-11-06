import {
  AfterViewInit, Component,

  ContentChildren, EventEmitter, Input,

  Output,

  QueryList,
} from '@angular/core';
import { ProgressStepComponent } from './progress-step/progress-step.component';

@Component({
  selector: 'app-progress-stepper',
  templateUrl: './progress-stepper.component.html',
  styleUrls: ['./progress-stepper.component.scss'],
})
export class ProgressStepperComponent implements AfterViewInit {
  /**
   * 0-based index of selected tab.
   */
  @Input() selectedStepIndex: number;

  /**
   * Event emitted after a tab has been selected.
   */
  @Output() selected = new EventEmitter();

  initialized = false;

  /**
   * List of child steps in the content DOM.
   */
  @ContentChildren(ProgressStepComponent)
  progressSteps: QueryList<ProgressStepComponent>;

  ngAfterViewInit() {
    // avoid ExpressionChangedAfterItHasBeenCheckedError
    setTimeout(() => {
      this.initialized = true;
    });
  }
}
