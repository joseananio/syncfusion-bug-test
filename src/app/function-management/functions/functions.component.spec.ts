import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { ViegaCommonModule } from '../../shared/lib/viega-common/lib/viega-common.module';
import { FlushService } from '../../core/services';
import { FunctionsComponent } from './functions.component';

xdescribe('FunctionsComponent', () => {
  let component: FunctionsComponent;
  let fixture: ComponentFixture<FunctionsComponent>;

  const flushServiceStub = {
    startDynamicFlushing: jasmine.createSpy('startDynamicFlushing'),
    startThermalDisinfection: jasmine.createSpy('startThermalDisinfection'),
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule, ViegaCommonModule],
      declarations: [FunctionsComponent],
      providers: [{ provide: FlushService, useValue: flushServiceStub }],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FunctionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
