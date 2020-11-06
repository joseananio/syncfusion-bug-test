import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { WeekTimePlannerControlComponent } from './week-time-planner-control.component';

xdescribe('WeekTimePlannerControlComponent', () => {
  let component: WeekTimePlannerControlComponent;
  let fixture: ComponentFixture<WeekTimePlannerControlComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [WeekTimePlannerControlComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WeekTimePlannerControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
