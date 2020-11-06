import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GuardsModule } from './guards/guards.module';
import { InterceptorsModule } from './interceptors/interceptors.module';
import { PipesModule } from './pipes/pipes.module';
import { ServicesModule } from './services/services.module';
import { ApiModule } from './services';
import { apiConfigFactory } from './api-config-factory';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    GuardsModule,
    InterceptorsModule,
    PipesModule,
    ServicesModule,
    ApiModule.forRoot(apiConfigFactory),
  ],
  exports: [GuardsModule, InterceptorsModule, ServicesModule, PipesModule],
})
export class CoreModule {}
