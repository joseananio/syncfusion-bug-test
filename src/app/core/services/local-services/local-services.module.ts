import { NgModule } from '@angular/core';
import { AuthenticationService } from './authentication.service';
import { StorageService } from './storage.service';
import { LocalStorageService } from './local-storage.service';
import { ActivationManagerService } from './activation-manager.service';
import { NotificationService } from './notification.service';

@NgModule({
  declarations: [],
  imports: [],
  providers: [
    {
      provide: 'AuthService',
      useClass: AuthenticationService,
    },
    {
      provide: StorageService,
      useClass: LocalStorageService,
    },
    {
      provide: ActivationManagerService,
      useClass: ActivationManagerService,
    },
    {
      provide: NotificationService,
      useClass: NotificationService,
    },
  ],
})
export class LocalServicesModule {}
