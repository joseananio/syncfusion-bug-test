import {
  Component,
  Input,
  ViewChild,
  TemplateRef,
} from '@angular/core';

@Component({
  selector: 'app-progress-step',
  templateUrl: './progress-step.component.html',
  styleUrls: ['./progress-step.component.scss'],
})
export class ProgressStepComponent {
  /**
   * Title of the step.
   */
  @Input() headerText: string;

  /**
   * Template of the steps, content. Rendered in progress-stepper.
   */
  @ViewChild('viewTemplate')
  template: TemplateRef<any>;
}
