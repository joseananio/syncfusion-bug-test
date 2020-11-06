import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AbstractFormFunctionStepComponent } from './abstract-form-function-step.component';

xdescribe('AbstractFormFunctionStepComponent', () => {
  let component: AbstractFormFunctionStepComponent;
  let fixture: ComponentFixture<AbstractFormFunctionStepComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AbstractFormFunctionStepComponent],
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AbstractFormFunctionStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
