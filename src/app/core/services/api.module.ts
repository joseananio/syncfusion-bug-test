import { NgModule, ModuleWithProviders, SkipSelf, Optional } from '@angular/core';
import { Configuration } from './configuration';
import { HttpClient } from '@angular/common/http';


import { ActivationService } from './api/activation.service';
import { ControllerService } from './api/controller.service';
import { ControllerPointService } from './api/controllerPoint.service';
import { DevicePointService } from './api/devicePoint.service';
import { DeviceUpdateService } from './api/deviceUpdate.service';
import { DevicesService } from './api/devices.service';
import { DteFunctionTestService } from './api/dteFunctionTest.service';
import { FlushService } from './api/flush.service';
import { FunctionTestService } from './api/functionTest.service';
import { ImageService } from './api/image.service';
import { ItemReportsService } from './api/itemReports.service';
import { ItemReportsFilterService } from './api/itemReportsFilter.service';
import { ItemReportsServiceService } from './api/itemReportsService.service';
import { ManagementService } from './api/management.service';
import { MessagesService } from './api/messages.service';
import { ParameterService } from './api/parameter.service';
import { PointAddressService } from './api/pointAddress.service';
import { ProjectsService } from './api/projects.service';
import { SessionsService } from './api/sessions.service';
import { SystemService } from './api/system.service';
import { UpdateService } from './api/update.service';
import { UsersService } from './api/users.service';
import { ValuesService } from './api/values.service';

@NgModule({
  imports:      [],
  declarations: [],
  exports:      [],
  providers: [
    ActivationService,
    ControllerService,
    ControllerPointService,
    DevicePointService,
    DeviceUpdateService,
    DevicesService,
    DteFunctionTestService,
    FlushService,
    FunctionTestService,
    ImageService,
    ItemReportsService,
    ItemReportsFilterService,
    ItemReportsServiceService,
    ManagementService,
    MessagesService,
    ParameterService,
    PointAddressService,
    ProjectsService,
    SessionsService,
    SystemService,
    UpdateService,
    UsersService,
    ValuesService ]
})
export class ApiModule {
    public static forRoot(configurationFactory: () => Configuration): ModuleWithProviders<ApiModule> {
        return {
            ngModule: ApiModule,
            providers: [ { provide: Configuration, useFactory: configurationFactory } ]
        };
    }

    constructor( @Optional() @SkipSelf() parentModule: ApiModule,
                 @Optional() http: HttpClient) {
        if (parentModule) {
            throw new Error('ApiModule is already loaded. Import in your base AppModule only.');
        }
        if (!http) {
            throw new Error('You need to import the HttpClientModule in your AppModule! \n' +
            'See also https://github.com/angular/angular/issues/20575');
        }
    }
}
