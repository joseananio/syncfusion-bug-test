import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormFunctionStepOne } from './form-function-step-one.component';

xdescribe('FormFunctionStepOne', () => {
  let component: FormFunctionStepOne;
  let fixture: ComponentFixture<FormFunctionStepOne>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [FormFunctionStepOne],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormFunctionStepOne);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
