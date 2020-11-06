import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardAddComponentComponent } from './dashboard-add-component.component';

xdescribe('DashboardAddComponentComponent', () => {
  let component: DashboardAddComponentComponent;
  let fixture: ComponentFixture<DashboardAddComponentComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [DashboardAddComponentComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardAddComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
