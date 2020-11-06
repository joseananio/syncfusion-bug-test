import { Component } from '@angular/core';
import { EventTypes } from 'src/app/core/services';
import { OpenNotificationsComponent } from '../open-notifications/open-notifications.component';

@Component({
  selector: 'app-event-notifications',
  templateUrl: '../open-notifications/open-notifications.component.html',
  styleUrls: ['../open-notifications/open-notifications.component.scss'],
})

export class EventNotificationsComponent extends OpenNotificationsComponent {
  /**
   * @override
   */
  public configureMessageQueryParameters(): void {
    this.query.addParams('EventTypes', EventTypes.EVENT);
  }

  /**
   * @override
   */
  public showAcknowledgementColumn(): boolean {
    return false;
  }
}
