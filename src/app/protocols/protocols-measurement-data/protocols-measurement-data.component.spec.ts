import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProtocolsMeasurementDataComponent } from './protocols-measurement-data.component';

xdescribe('ProtocolsMeasurementDataComponent', () => {
  let component: ProtocolsMeasurementDataComponent;
  let fixture: ComponentFixture<ProtocolsMeasurementDataComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ProtocolsMeasurementDataComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProtocolsMeasurementDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
