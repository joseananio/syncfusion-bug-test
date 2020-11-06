import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { ControllerDetailsConfigurationComponent } from './controller-details-configuration.component';

xdescribe('ControllerDetailsConfigurationComponent', () => {
  let component: ControllerDetailsConfigurationComponent;
  let fixture: ComponentFixture<ControllerDetailsConfigurationComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ControllerDetailsConfigurationComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ControllerDetailsConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
