import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectDeviceComponent } from './project-device.component';

xdescribe('ProjectDeviceComponent', () => {
  let component: ProjectDeviceComponent;
  let fixture: ComponentFixture<ProjectDeviceComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ProjectDeviceComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectDeviceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
