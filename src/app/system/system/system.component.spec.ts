import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { of } from 'rxjs';
import { ViegaCommonModule } from '../../shared/lib/viega-common/lib/viega-common.module';
import { TabViewModule } from '../../shared/components/tab-view/tab-view.module';
import { SystemComponent } from './system.component';
import { ControllerOverviewComponent } from '../controller-overview/controller-overview.component';
import { SystemSettingsComponent } from '../system-settings/system-settings.component';
import { DevicesOutputDto, DevicesService } from '../../core/services';

xdescribe('SystemComponent', () => {
  let component: SystemComponent;
  let fixture: ComponentFixture<SystemComponent>;
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
      imports: [
        TabViewModule,
        ViegaCommonModule,
        RouterTestingModule.withRoutes([]),
      ],
      declarations: [
        SystemComponent,
        ControllerOverviewComponent,
        SystemSettingsComponent,
      ],
      providers: [
        { provide: DevicesService, useValue: deviceServiceStub },
      ],
    }).compileComponents();
  }));

  const deviceServiceStub = {
    getDevices: jasmine.createSpy('getDevices').and.returnValue(of(mockDeviceList)),
  };

  beforeEach(() => {
    fixture = TestBed.createComponent(SystemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
