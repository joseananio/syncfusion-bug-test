import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { DevicePointBasicInfoComponent } from './device-point-basic-info.component';

xdescribe('DevicePointBasicInfoComponent', () => {
  let component: DevicePointBasicInfoComponent;
  let fixture: ComponentFixture<DevicePointBasicInfoComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [DevicePointBasicInfoComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DevicePointBasicInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  xit('should create', () => {
    expect(component).toBeTruthy();
  });
});
