import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeviceInstallationConfirmationComponent } from './device-installation-confirmation.component';

xdescribe('DeviceInstallationConfirmationComponent', () => {
  let component: DeviceInstallationConfirmationComponent;
  let fixture: ComponentFixture<DeviceInstallationConfirmationComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [DeviceInstallationConfirmationComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeviceInstallationConfirmationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
