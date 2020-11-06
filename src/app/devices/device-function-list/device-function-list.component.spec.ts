import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { DeviceFunctionListComponent } from './device-function-list.component';

xdescribe('DeviceFunctionsComponent', () => {
  let component: DeviceFunctionListComponent;
  let fixture: ComponentFixture<DeviceFunctionListComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [DeviceFunctionListComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeviceFunctionListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
