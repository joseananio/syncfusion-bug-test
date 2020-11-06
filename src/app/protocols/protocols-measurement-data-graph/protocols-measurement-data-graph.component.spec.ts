import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { of } from 'rxjs';
import {
  DevicePointOutputDto, DevicePointService, DevicesOutputDto, DevicesService,
} from '../../core/services';
import { ViegaCommonModule } from '../../shared/lib/viega-common/lib/viega-common.module';
import { ProtocolsModule } from '../protocols.module';
import { ProtocolsMeasurementDataGraphComponent } from './protocols-measurement-data-graph.component';

xdescribe('ProtocolsMeasurementDataGraphComponent', () => {
  let component: ProtocolsMeasurementDataGraphComponent;
  let fixture: ComponentFixture<ProtocolsMeasurementDataGraphComponent>;
  const mockDeviceList = {} as DevicesOutputDto[];
  const mockDevicePointList = {} as DevicePointOutputDto[];

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [

      ],
      imports: [
        ViegaCommonModule,
        FormsModule,
        ProtocolsModule,
      ],
      providers: [
        { provide: DevicesService, useValue: deviceServiceStub },
        { provide: DevicePointService, useValue: devicePointServiceStub },
      ],
    }).compileComponents();
  }));

  const deviceServiceStub = {
    getDevices: jasmine.createSpy('getDevices').and.returnValue(of(mockDeviceList)),
  };

  const devicePointServiceStub = {
    getDevicePoints: jasmine.createSpy('getDevicePoints').and.returnValue(of(mockDevicePointList)),
  };

  beforeEach(() => {
    fixture = TestBed.createComponent(ProtocolsMeasurementDataGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
