import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type NotificationOperation = 'PIN' | 'UNPIN';

export interface Notification {
  message: string;
  messageParameters?: Object;
  statusCode?: number;
  operation?: NotificationOperation;
}

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private notificationSource = new BehaviorSubject<Notification>(null);

  private notificationObservable = this.notificationSource.asObservable();

  constructor() { }

  public notify(error: Notification | string, messageParameters? : Object): void {
    const notificationObject: Notification = (typeof error === 'string')
      ? {
        message: error as string,
        messageParameters,
      }
      : error as Notification;

    this.notificationSource.next(notificationObject);
  }

  public getNextNotification(): Notification {
    return this.notificationSource.value;
  }

  public getNotificationObservable(): Observable<Notification> {
    return this.notificationObservable;
  }
}
