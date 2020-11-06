import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeviceDetailsFunctionTestHardwareComponent } from './device-details-function-test-hardware.component';

xdescribe('DeviceDetailsFunctionTestComponent', () => {
  let component: DeviceDetailsFunctionTestHardwareComponent;
  let fixture: ComponentFixture<DeviceDetailsFunctionTestHardwareComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [DeviceDetailsFunctionTestHardwareComponent],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeviceDetailsFunctionTestHardwareComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
