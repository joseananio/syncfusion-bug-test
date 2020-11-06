import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { FunctionAddComponent } from './function-add.component';

xdescribe('FunctionAddComponent', () => {
  let component: FunctionAddComponent;
  let fixture: ComponentFixture<FunctionAddComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [FunctionAddComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FunctionAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
