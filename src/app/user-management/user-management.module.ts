import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { GridModule } from '@syncfusion/ej2-angular-grids';
import { ModalDialogModule } from '../shared/components/modal-dialog/modal-dialog.module';
import { ViegaCommonModule } from '../shared/lib/viega-common/lib/viega-common.module';
import { UserAddComponent } from './user-add/user-add.component';
import { UserDetailsComponent } from './user-details/user-details.component';
import { UserManagementRoutingModule } from './user-management-routing.module';
import { UsersComponent } from './users/users.component';
import { ValidateEqualDirective } from './validate-equal.directive';

@NgModule({
  declarations: [
    UsersComponent,
    UserDetailsComponent,
    UserAddComponent,
    ValidateEqualDirective,
  ],
  imports: [
    CommonModule,
    UserManagementRoutingModule,
    ViegaCommonModule,
    ModalDialogModule,
    FormsModule,
    GridModule,
    ReactiveFormsModule,
    TranslateModule,
  ],
})
export class UserManagementModule {}
