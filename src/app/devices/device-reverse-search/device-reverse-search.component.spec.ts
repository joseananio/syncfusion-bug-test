import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeviceReverseSearchComponent } from './device-reverse-search.component';

xdescribe('DeviceReverseSearchComponent', () => {
  let component: DeviceReverseSearchComponent;
  let fixture: ComponentFixture<DeviceReverseSearchComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [
        DeviceReverseSearchComponent,
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeviceReverseSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
