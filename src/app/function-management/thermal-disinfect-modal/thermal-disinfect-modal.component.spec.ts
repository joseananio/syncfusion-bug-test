import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { ThermalDisinfectModalComponent } from './thermal-disinfect-modal.component';

xdescribe('ThermalDisinfectModalComponent', () => {
  let component: ThermalDisinfectModalComponent;
  let fixture: ComponentFixture<ThermalDisinfectModalComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ThermalDisinfectModalComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ThermalDisinfectModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
