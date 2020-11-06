import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProtocolsFunctionsComponent } from './protocols-functions.component';

xdescribe('ProtocolsFunctionsComponent', () => {
  let component: ProtocolsFunctionsComponent;
  let fixture: ComponentFixture<ProtocolsFunctionsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ProtocolsFunctionsComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProtocolsFunctionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
