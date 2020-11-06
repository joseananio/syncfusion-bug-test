import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { DevicePointConfigHeaderComponent } from './device-point-config-header.component';

xdescribe('DevicePointConfigHeaderComponent', () => {
  let component: DevicePointConfigHeaderComponent;
  let fixture: ComponentFixture<DevicePointConfigHeaderComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [DevicePointConfigHeaderComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DevicePointConfigHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
