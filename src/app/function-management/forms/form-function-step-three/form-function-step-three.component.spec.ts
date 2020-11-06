import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormFunctionStepThree } from './form-function-step-three.component';

xdescribe('FormFunctionStepThree', () => {
  let component: FormFunctionStepThree;
  let fixture: ComponentFixture<FormFunctionStepThree>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [FormFunctionStepThree],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormFunctionStepThree);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
