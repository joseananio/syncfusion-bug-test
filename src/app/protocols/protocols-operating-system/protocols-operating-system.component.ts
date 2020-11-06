import { Component } from '@angular/core';
import { EventTypes } from 'src/app/core/services';
import { Query } from '@syncfusion/ej2-data';
import { ProtocolsFunctionsComponent } from '../protocols-functions/protocols-functions.component';

@Component({
  selector: 'app-protocols-operating-system',
  templateUrl: '../protocols-functions/protocols-functions.component.html',
  styleUrls: ['../protocols-functions/protocols-functions.component.scss'],
})
export class ProtocolsOperatingSystemComponent extends ProtocolsFunctionsComponent {
  /**
   * @override
   */
  public section = 'operating-system';

  /**
   * @override
   */
  protected getEventTypeNames(): string[] {
    return [
      EventTypes.SYSTEMEVENT,
      EventTypes.SYSTEMFAULT,
    ];
  }

  protected createQuery(): Query {
    const query = super.createQuery();
    query.where('ErrorCode', 'greaterthanorequal', 1);

    return query;
  }

  /**
   * @override
   */
  protected getCsvBaseFileName(): string {
    return 'Betriebssystem-Protokoll.csv';
  }
}
