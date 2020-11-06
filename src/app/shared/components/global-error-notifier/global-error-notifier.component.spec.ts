import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { GlobalErrorNotifierComponent } from './global-error-notifier.component';

xdescribe('GlobalErrorNotifierComponent', () => {
  let component: GlobalErrorNotifierComponent;
  let fixture: ComponentFixture<GlobalErrorNotifierComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [GlobalErrorNotifierComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GlobalErrorNotifierComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
