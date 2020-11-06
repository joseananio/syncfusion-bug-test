import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { AlarmDashboardComponent } from './alarm-dashboard.component';

xdescribe('AlarmDashboardComponent', () => {
  let component: AlarmDashboardComponent;
  let fixture: ComponentFixture<AlarmDashboardComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [AlarmDashboardComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AlarmDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  xit('should create', () => {
    expect(component).toBeTruthy();
  });
});
