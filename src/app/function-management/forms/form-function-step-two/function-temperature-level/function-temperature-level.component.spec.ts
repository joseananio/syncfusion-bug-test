import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { FunctionTemperatureLevelComponent } from './function-temperature-level.component';

xdescribe('FunctionTemperatureLevelComponent', () => {
  let component: FunctionTemperatureLevelComponent;
  let fixture: ComponentFixture<FunctionTemperatureLevelComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [FunctionTemperatureLevelComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FunctionTemperatureLevelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
