import {
  Component, EventEmitter, Inject, OnInit, Output, ViewChild,
} from '@angular/core';
import { NgForm } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { AuthorityTemplateNames, UserOutputDto, UsersService } from 'src/app/core/services';
import { UserCreateInput } from '../../core/services/model/userCreateInput';
import { UserFormComponent } from '../user-form.component';

export interface InputDialogData {
  users: UserOutputDto[];
}

@Component({
  selector: 'app-user-add',
  templateUrl: './user-add.component.html',
  styleUrls: ['./user-add.component.scss'],
})

/**
 * UserAddComponent is used as modal dialog in userComponent.
 */
export class UserAddComponent extends UserFormComponent implements OnInit {
  // Forms don't need an element identifier, all forms get as follows.
  @ViewChild(NgForm) formViewChild;

  @ViewChild('userNameVal') userNameElement;
  // @ViewChild('form', { static: false }) form:NgForm;

  @Output()
  public closeEvent = new EventEmitter<string>();

  // Initialize class by interface:
  public userAddForm: UserCreateInput;

  constructor(
    public dialogRef: MatDialogRef<UserAddComponent>,
    @Inject(MAT_DIALOG_DATA) private data: InputDialogData,
    private usersService: UsersService,
    protected dialog: MatDialog,
  ) {
    super(dialog, dialogRef);
  }

  ngOnInit() {
    this.userAddForm = {
      loginName: '',
      password: null,
      passwordConfirmation: null,
      lastName: '',
      firstName: '',
      email: null,
      authorityTemplateName: AuthorityTemplateNames.GUESTS,
    };
  }

  public removeReadonly(event): void {
    event.target.removeAttribute('readonly');
  }

  public onUserRoleSelect(role: AuthorityTemplateNames): void {
    this.userAddForm.authorityTemplateName = role;
  }

  protected saveChanges() {
    this.createUser();
  }

  public onChange(): void {
    this.reValidatePasswords();
    // Auto-generate username if input is not used so far
    if (this.userNameElement.pristine) {
      const first = this.userAddForm.firstName.replace(/\s/g, '_');
      const last = this.userAddForm.lastName.replace(/\s/g, '_');
      this.userAddForm.loginName = `${first}.${last}`;
    }
    // Get current form status and activate save button
    this.buttons[1].isDisabled = !this.isFormVerified();
  }

  private isFormVerified(): boolean {
    return this.formViewChild.valid;
  }

  private createUser(): void {
    const user = (item: UserOutputDto) => item.email === this.userAddForm.email;
    if (this.data.users.some(user)) {
      this.openFeedbackDialog(_('USERS.EMAIL_EXISTS'), { newUsername: this.userAddForm.loginName });
      return;
    }
    this.usersService.createUser(this.userAddForm).subscribe(
      (resp: UserOutputDto) => {
        this.closeEvent.emit('success');
        this.closeDialog();
        const msg = _('USERS.CREATE_USER_SUCCESS');
        this.openFeedbackDialog(msg, { loginName: resp.loginName });
      },
      (err) => {
        let newUserName: string;
        if (this.userAddForm.loginName === '') {
          newUserName = _('USERS.LOGINNAME');
        } else {
          newUserName = this.userAddForm.loginName;
        }
        let errorMessage: string;
        if (err.error.errorCode === 'DUPLICATED_LOGIN_NAME') {
          errorMessage = _('USERS.USER_ALREADY_EXISTS');
        } else {
          errorMessage = _('USERS.CREATE_USER_ERROR');
        }
        this.openFeedbackDialog(errorMessage, { newUserName });
      },
    );
  }
}
