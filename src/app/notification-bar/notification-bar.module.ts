import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NotificationBarComponent } from './notification-bar.component';

@NgModule({
  declarations: [NotificationBarComponent],
  imports: [CommonModule, FormsModule],
  exports: [NotificationBarComponent],
})
export class NotificationBarModule {}
