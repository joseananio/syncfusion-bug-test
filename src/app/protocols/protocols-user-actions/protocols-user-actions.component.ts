import { Component } from '@angular/core';
import { Query } from '@syncfusion/ej2-data';
import { ProtocolsFunctionsComponent } from '../protocols-functions/protocols-functions.component';

@Component({
  selector: 'app-protocols-user-actions',
  templateUrl: '../protocols-functions/protocols-functions.component.html',
  styleUrls: ['../protocols-functions/protocols-functions.component.scss'],
})
export class ProtocolsUserActionsComponent extends ProtocolsFunctionsComponent {
  /**
   * @override
   */
  public section = 'user-action';

  /**
   * @override
   */
  protected getEventTypeNames(): string[] {
    return [];
  }

  /**
   * @override
   */
  protected createQuery(): Query {
    const query = super.createQuery();
    // a negative error code indicates a user action
    query.where('ErrorCode', 'lessthanorequal', -1);

    return query;
  }

  /**
   * @override
   */
  protected getCsvBaseFileName(): string {
    return 'Benutzeraktionen-Protokoll.csv';
  }
}
