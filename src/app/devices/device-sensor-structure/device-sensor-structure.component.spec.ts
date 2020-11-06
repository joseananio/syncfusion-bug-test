import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeviceSensorStructureComponent } from './device-sensor-structure.component';

xdescribe('DeviceSensorStructureComponent', () => {
  let component: DeviceSensorStructureComponent;
  let fixture: ComponentFixture<DeviceSensorStructureComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [
        DeviceSensorStructureComponent,
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeviceSensorStructureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
