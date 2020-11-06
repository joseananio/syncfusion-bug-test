import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { APIS } from './api/api';
import { LocalServicesModule } from './local-services';

@NgModule({
  declarations: [],
  imports: [CommonModule, LocalServicesModule],
  providers: APIS
})
export class ServicesModule {}
