import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormFunctionStepTwo } from './form-function-step-two.component';

xdescribe('FormFunctionStepTwo', () => {
  let component: FormFunctionStepTwo;
  let fixture: ComponentFixture<FormFunctionStepTwo>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [FormFunctionStepTwo],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormFunctionStepTwo);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
