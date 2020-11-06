import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProtocolsAutoLogFormEditComponent } from './protocol-auto-log-form-edit.component';

xdescribe('ProtocolsAutoLogFormEditComponent', () => {
  let component: ProtocolsAutoLogFormEditComponent;
  let fixture: ComponentFixture<ProtocolsAutoLogFormEditComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ProtocolsAutoLogFormEditComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProtocolsAutoLogFormEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
