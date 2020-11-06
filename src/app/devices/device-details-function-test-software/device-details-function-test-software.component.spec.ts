import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeviceDetailsFunctionTestSoftwareComponent } from './device-details-function-test-software.component';

xdescribe('DeviceDetailsFunctionTestSoftwareComponent', () => {
  let component: DeviceDetailsFunctionTestSoftwareComponent;
  let fixture: ComponentFixture<DeviceDetailsFunctionTestSoftwareComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [DeviceDetailsFunctionTestSoftwareComponent],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeviceDetailsFunctionTestSoftwareComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
