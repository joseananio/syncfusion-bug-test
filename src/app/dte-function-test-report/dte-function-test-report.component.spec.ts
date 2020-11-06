import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DteFunctionTestReportComponent } from './dte-function-test-report.component';

xdescribe('DteFunctionTestReportComponent', () => {
  let component: DteFunctionTestReportComponent;
  let fixture: ComponentFixture<DteFunctionTestReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DteFunctionTestReportComponent],
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DteFunctionTestReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
