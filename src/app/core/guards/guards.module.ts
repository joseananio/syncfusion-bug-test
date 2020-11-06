import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthGuard } from './auth.guard';
import { ActivationGuard } from './activation.guard';
import { NonActivationGuard } from './non-activation.guard';
import { PasswordResetGuard } from './password-reset.guard';

@NgModule({
  declarations: [],
  imports: [CommonModule],
  providers: [AuthGuard, ActivationGuard, NonActivationGuard, PasswordResetGuard],
  exports: [],
})
export class GuardsModule {}
