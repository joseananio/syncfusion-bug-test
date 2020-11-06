import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class DateTimeService {
  /**
   * A version of Date.toISOString() that provides six instead of three decimal places for the
   * seconds portion.
   */
  public toISOString(dateTime: Date): string {
    return `${dateTime.toISOString().substr(0, 23)}000Z`;
  }

  public isISOString(potentialDate: string): boolean {
    return (typeof potentialDate === 'string') && !!potentialDate.match(/^\d\d\d\d-\d\d-\d\dT\d\d:\d\d:\d\d(\.\d+)?Z$/);
  }

  /**
   * Removes the given number of days from a Date object.
   * If the start or end of daylight saving times falls into this range, the time of day remains
   * constant.
   */
  public subtractDays(dateTime: Date, daysToRemove: number): Date {
    const result = new Date(dateTime);
    result.setDate(result.getDate() - daysToRemove);

    return result;
  }

  /**
   * Adds the given number of days from a Date object.
   * If the start or end of daylight saving times falls into this range, the time of day remains
   * constant.
   */
  public addDays(dateTime: Date, daysToAdd: number): Date {
    const result = new Date(dateTime);
    result.setDate(result.getDate() + daysToAdd);

    return result;
  }

  /**
   * Removes the time portion from a Date object.
   */
  public stripTime(dateTime: Date): Date {
    return new Date(dateTime.getFullYear(), dateTime.getMonth(), dateTime.getDate());
  }

  /**
   * Parse a cronJobTimeStr in form 'm h dom mon dow'.
   */
  public parseCronJobTimeStr(cronJobTimeStr: string): string {
    // m h  dom mon dow
    const cron = cronJobTimeStr.split(' ');
    let subTrigger;
    if (cron[3] !== '*') {
      subTrigger = 'yearly';
    } else if (cron[2] !== '*') {
      subTrigger = 'monthly';
    } else if (cron[4] !== '*') {
      subTrigger = 'weekly';
    } else {
      subTrigger = 'daily';
    }
    return subTrigger;
  }
}
