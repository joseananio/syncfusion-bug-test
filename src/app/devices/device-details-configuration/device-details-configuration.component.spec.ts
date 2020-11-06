import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeviceDetailsConfigurationComponent } from './device-details-configuration.component';

xdescribe('DeviceDetailsConfigurationComponent', () => {
  let component: DeviceDetailsConfigurationComponent;
  let fixture: ComponentFixture<DeviceDetailsConfigurationComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [DeviceDetailsConfigurationComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeviceDetailsConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
