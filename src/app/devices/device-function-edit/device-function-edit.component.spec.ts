import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeviceFunctionEditComponent } from './device-function-edit.component';

xdescribe('DeviceFunctionEditComponent', () => {
  let component: DeviceFunctionEditComponent;
  let fixture: ComponentFixture<DeviceFunctionEditComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [DeviceFunctionEditComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeviceFunctionEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
