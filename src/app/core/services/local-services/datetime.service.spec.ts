import { TestBed } from '@angular/core/testing';

import { DateTimeService } from './datetime.service';

describe('DateTimeService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: DateTimeService = TestBed.inject(DateTimeService);
    expect(service).toBeTruthy();
  });

  it('toISOString() should work for date only', () => {
    const service: DateTimeService = TestBed.inject(DateTimeService);
    const result = service.toISOString(new Date('1987-04-02Z'));
    expect(result).toBe('1987-04-02T00:00:00.000000Z');
  });

  it('toISOString() should work for datetime', () => {
    const service: DateTimeService = TestBed.inject(DateTimeService);
    const result = service.toISOString(new Date('1987-04-02T12:34:56Z'));
    expect(result).toBe('1987-04-02T12:34:56.000000Z');
  });

  it('toISOString() should throw on invalid date', () => {
    const service: DateTimeService = TestBed.inject(DateTimeService);
    const invalidDate = new Date('2020-31-02');
    expect(() => {
      service.toISOString(invalidDate);
    }).toThrow(new RangeError('Invalid time value'));
  });
});
