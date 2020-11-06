import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeviceDetailsFirmwareUpdateComponent } from './device-details-firmware-update.component';

xdescribe('DeviceDetailsFirmwareUpdateComponent', () => {
  let component: DeviceDetailsFirmwareUpdateComponent;
  let fixture: ComponentFixture<DeviceDetailsFirmwareUpdateComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [
        DeviceDetailsFirmwareUpdateComponent,
      ],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeviceDetailsFirmwareUpdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
