import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { LoginPageComponent } from './login-page/login-page.component';
import { ViegaCommonModule } from '../shared/lib/viega-common/lib/viega-common.module';
import { LoginFormComponent } from './login-form/login-form.component';
import { SetPasswordFormComponent } from './set-password-form/set-password-form.component';

@NgModule({
  declarations: [LoginFormComponent, LoginPageComponent, SetPasswordFormComponent],
  imports: [CommonModule, FormsModule, ViegaCommonModule, TranslateModule],
})
export class LoginPageModule { }
