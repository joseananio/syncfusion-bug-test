import {
  Component, Input, NgZone, OnChanges, OnDestroy, OnInit, SimpleChanges, Inject,
} from '@angular/core';
import { Subscription, timer } from 'rxjs';
import { DevicesOutputDto, ParameterDefinitionDto, ParameterService } from 'src/app/core/services';
import { AuthenticationService } from 'src/app/core/services/local-services';
import { equalsDeviceType } from 'src/app/shared/utils/device-utils';
import { DeviceParameter } from '../../core/services/model/deviceParameter';

interface DisplayParams extends ParameterDefinitionDto {
  value?: string;
  valueBoolean?: boolean;
}

@Component({
  selector: 'app-device-details-status',
  templateUrl: './device-details-status.component.html',
  styleUrls: ['./device-details-status.component.scss'],
})
export class DeviceDetailsStatusComponent implements OnInit, OnChanges, OnDestroy {
  constructor(
    private ngZone: NgZone,
    private parameterService: ParameterService,
    @Inject('AuthService') private authenticationService: AuthenticationService,
  ) { }

  @Input()
  device: DevicesOutputDto;

  @Input()
  deviceParameters: ParameterDefinitionDto[];

  displayParameters: DisplayParams[] = [];

  // TODO(schuster): Decrease polling interval to 1 second when backend performance allows this.
  private POLLING_INTERVAL = 2000;

  private MAX_FAILED_POLLING_ATTEMPTS = 4;

  private pollingTimer = timer(0, this.POLLING_INTERVAL);

  private timerSubscription: Subscription;

  private failedPollingAttempts = 0;

  ngOnInit(): void {
    // Subscription done outside angular zone to make e2e tests work.
    this.ngZone.runOutsideAngular(() => {
      this.timerSubscription = this.pollingTimer.subscribe((x) => {
        this.ngZone.run(() => {  // Return to angular zone.
          // Do not poll again before getting a reply, but try again after some time.
          if (this.failedPollingAttempts === 0 || this.failedPollingAttempts > this.MAX_FAILED_POLLING_ATTEMPTS) {
            this.getParameterValues();
          } else {
            this.failedPollingAttempts += 1;
          }
        });
      });
    });
  }

  ngOnDestroy(): void {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['deviceParameters']) {
      this.filterDisplayParameters();
    }
  }

  private filterDisplayParameters(): void {
    this.displayParameters = this.deviceParameters.filter(
      (parameter) => equalsDeviceType(parameter.deviceType, this.device.deviceTypeName)
          && parameter.accessAuthorization
          && parameter.accessAuthorization[this.authenticationService.getRole(true)]
          && parameter.twmsFeatures
          && parameter.twmsFeatures.display,
    );
  }

  private getParameterValues(): void {
    this.parameterService.getParameterValue(this.device.devicePointUUID).subscribe(
      (values) => {
        this.failedPollingAttempts = 0;
        this.displayParameters = this.mergeDeviceConfig(values, this.displayParameters);
      },
      (err) => {
        // Fail silently and keep polling
        console.error(err);
      },
    );
  }

  private mergeDeviceConfig(source: DeviceParameter [], target: DisplayParams[]): DisplayParams[] {
    return target.map(
      (parameter) => {
        const { value } = source.find(
          (candidate) => candidate.name === parameter.keyName,
        );
        return {
          ...parameter,
          value,
          valueBoolean: value === 'true',
        };
      },
    );
  }
}
