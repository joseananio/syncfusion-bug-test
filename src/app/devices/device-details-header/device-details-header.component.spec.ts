import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeviceDetailsHeaderComponent } from './device-details-header.component';

xdescribe('DeviceDetailsHeaderComponent', () => {
  let component: DeviceDetailsHeaderComponent;
  let fixture: ComponentFixture<DeviceDetailsHeaderComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [DeviceDetailsHeaderComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeviceDetailsHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
