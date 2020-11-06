import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeviceDetailsMaintenanceComponent } from './device-details-maintenance.component';

xdescribe('DeviceDetailsMaintenanceComponent', () => {
  let component: DeviceDetailsMaintenanceComponent;
  let fixture: ComponentFixture<DeviceDetailsMaintenanceComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [DeviceDetailsMaintenanceComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeviceDetailsMaintenanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
