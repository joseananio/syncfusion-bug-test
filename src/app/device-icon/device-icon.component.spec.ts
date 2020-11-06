import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeviceIconComponent } from './device-icon.component';

xdescribe('DeviceIconComponent', () => {
  let component: DeviceIconComponent;
  let fixture: ComponentFixture<DeviceIconComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [DeviceIconComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeviceIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
