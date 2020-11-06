import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { of } from 'rxjs';
import { ControllerOverviewComponent } from './controller-overview.component';
import { ViegaCommonModule } from '../../shared/lib/viega-common/lib/viega-common.module';
import { DevicesService, DevicesOutputDto } from '../../core/services';

xdescribe('ControllerOverviewComponent', () => {
  let component: ControllerOverviewComponent;
  let fixture: ComponentFixture<ControllerOverviewComponent>;
  const mockDeviceList: DevicesOutputDto[] = [
    {
      uuid: 'mockUUID',
    },
    {
      uuid: 'mockUUID1',
    },
  ];

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ViegaCommonModule],
      declarations: [ControllerOverviewComponent],
      providers: [
        { provide: DevicesService, useValue: deviceServiceStub },
      ],
    }).compileComponents();
  }));

  const deviceServiceStub = {
    getDevices: jasmine.createSpy('getDevices').and.returnValue(of(mockDeviceList)),
  };

  beforeEach(() => {
    fixture = TestBed.createComponent(ControllerOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
