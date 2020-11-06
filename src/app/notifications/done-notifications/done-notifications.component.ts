import { Component } from '@angular/core';
import { EventTypes } from 'src/app/core/services';
import { OpenNotificationsComponent } from '../open-notifications/open-notifications.component';

/**
 * Shows all acknowledged and fixed notifications.
 * Inherits from OpenNotificationsComponent.
 */
@Component({
  selector: 'app-done-notifications',
  templateUrl: '../open-notifications/open-notifications.component.html',
  styleUrls: ['../open-notifications/open-notifications.component.scss'],
})
export class DoneNotificationsComponent extends OpenNotificationsComponent {
  /**
   * @override
   */
  public configureMessageQueryParameters(): void {
    this.query
      .where('FixedByUuid', 'notequal', null)  // fixed messages only
      .addParams(
        'EventTypes',
        [
          EventTypes.ALARM,
          EventTypes.DISRUPTION,
          EventTypes.MAINTENANCE,
        ].join('|'),
      );
  }

  /**
   * @override
   */
  public showAcknowledgementColumn(): boolean {
    return false;
  }
}
