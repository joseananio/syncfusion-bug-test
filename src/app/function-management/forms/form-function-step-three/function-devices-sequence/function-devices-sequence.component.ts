import {
  Component, Input, Output, EventEmitter,
} from '@angular/core';
import { DevicePointOutputDto } from 'src/app/core/services';

@Component({
  selector: 'app-function-devices-sequence',
  templateUrl: 'function-devices-sequence.component.html',
  styleUrls: ['./function-devices-sequence.component.scss'],
})
export class FunctionDevicesSequenceComponent {
  @Input() public devices: DevicePointOutputDto[];

  @Output() public dropped = new EventEmitter();

  constructor() { }

  public onDropDevice(event): void {
    this.dropped.emit(event);
  }
}
