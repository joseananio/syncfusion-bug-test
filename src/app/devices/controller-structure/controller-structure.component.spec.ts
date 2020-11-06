import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { ControllerStructureComponent } from './controller-structure.component';

xdescribe('ControllerStructureComponent', () => {
  let component: ControllerStructureComponent;
  let fixture: ComponentFixture<ControllerStructureComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ControllerStructureComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ControllerStructureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
