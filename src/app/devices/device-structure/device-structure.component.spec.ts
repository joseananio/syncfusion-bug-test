import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeviceStructureComponent } from './device-structure.component';

xdescribe('DeviceStructureComponent', () => {
  let component: DeviceStructureComponent;
  let fixture: ComponentFixture<DeviceStructureComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [DeviceStructureComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeviceStructureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
