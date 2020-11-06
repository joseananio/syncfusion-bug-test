import { Component, OnInit, ViewChild } from '@angular/core';
import {
  UsersService, UserOutputDto, AuthorityCodes,
} from 'src/app/core/services';
import { DataManagerService, NotificationService } from 'src/app/core/services/local-services';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import {
  SelectionSettingsModel, GridComponent, ColumnModel,
} from '@syncfusion/ej2-angular-grids';
import { QuestionDialogComponent } from 'src/app/shared/components/modal-dialog/question-dialog/question-dialog.component';
import { LayoutModule } from 'src/app/shared/layout.module';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { UserDetailsComponent } from '../user-details/user-details.component';
import { UserAddComponent } from '../user-add/user-add.component';
import { FeedbackDialogComponent } from '../../shared/components/modal-dialog/feedback-dialog/feedback-dialog.component';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
})
export class UsersComponent implements OnInit {
  allUsers: UserOutputDto[];

  public userGridSelectionsOptions: SelectionSettingsModel;

  public pageSettings: Object;

  // TODO: Match hideAtMedia with params given in shared css class for bootstrap-userGrid
  allUsersColumnData: ColumnModel[] = [
    {
      field: 'loginName',
      headerText: _('USERS.LOGINNAME'),
      textAlign: 'Left',
      // hideAtMedia: LayoutModule.getHideAtMedia('md'),
    },
    {
      field: 'authorityTemplateName',
      headerText: _('USERS.GROUP'),
      textAlign: 'Left',
    },
    {
      field: 'firstName',
      headerText: _('USERS.FIRSTNAME'),
      textAlign: 'Left',
      hideAtMedia: LayoutModule.getHideAtMedia('md'),
    },
    {
      field: 'lastName',
      headerText: _('USERS.LASTNAME'),
      textAlign: 'Left',
      hideAtMedia: LayoutModule.getHideAtMedia('md'),
    },
    {
      field: 'email',
      headerText: _('USERS.EMAIL'),
      textAlign: 'Left',
      hideAtMedia: LayoutModule.getHideAtMedia('sm'),
    },
    {
      field: 'lastLoginTimestamp',
      headerText: _('USERS.LAST_LOGIN'),
      textAlign: 'Left',
      hideAtMedia: LayoutModule.getHideAtMedia('lg'),
      format: { type: 'dateTime', skeleton: 'short' },
      type: 'date',
    },
  ];

  @ViewChild('userGrid') public userGrid: GridComponent;

  public initialuserGridLoad = true;

  constructor(
    private usersService: UsersService,
    private dataManagerService: DataManagerService,
    private notificationService: NotificationService,
    private dialog: MatDialog,
  ) { }

  AuthorityCodes = AuthorityCodes;

  authorities: Set<string> = new Set();

  ngOnInit() {
    this.dataManagerService.getUserAuthorityDataManager().ready.then(
      (authorities) => {
        this.authorities = new Set(authorities['result'].authorityCodes);
      },
    ).catch(() => {
      this.notificationService.notify(_('GLOBAL.COULD_NOT_LOAD_PRIVILEGES'));
    });
    this.updateAllUsers();

    // Data userGrid settings
    this.userGridSelectionsOptions = {
      type: 'Single',
      mode: 'Both',
      enableToggle: false,
    };
    this.pageSettings = { pageSize: 10 };
  }

  private afterDialogClosed<T, R = any>(dialog: MatDialogRef<T, R>, forceUpdate?: boolean): MatDialogRef<T, R> {
    dialog.afterClosed().subscribe((data) => {
      // if is updated:
      // if (data) {
      if (forceUpdate) {
        this.updateAllUsers();
      }
    });
    return dialog;
  }

  public dataBound(): void {
    /* this.useruserGrid.autoFitColumns(); */
    /*    if (this.initialuserGridLoad) {
         this.initialuserGridLoad = false;
         const pager = document.getElementsByClassName('e-userGridpager');
         let topElement;
         if (this.userGrid.allowGrouping || this.userGrid.toolbar) {
           topElement = this.userGrid.allowGrouping ? document.getElementsByClassName('e-groupdroparea') :
             document.getElementsByClassName('e-toolbar');
         } else {
           topElement = document.getElementsByClassName('e-userGridheader');
         }
         this.userGrid.element.insertBefore(pager[0], topElement[0]);
       } */
  }

  private updateAllUsers(): void {
    this.usersService.getUsers().subscribe(
      (users: UserOutputDto[]) => {
        this.allUsers = users;
      },
    );
  }

  // TODO: Maybe wrap this in another component as method?
  private openFeedbackDialog<R = any>(feedBackMessage: string, params: Object): MatDialogRef<FeedbackDialogComponent, R> {
    return this.afterDialogClosed(
      this.dialog.open(
        FeedbackDialogComponent,
        {
          data: {
            params,
            message: feedBackMessage,
          },
        },
      ),
      true,
    );
  }

  public onAddUserClick<R = any>(): MatDialogRef<UserAddComponent, R> {
    return this.afterDialogClosed(
      this.dialog.open(UserAddComponent, {
        data: { users: this.allUsers },
        // This creates a dark background for dialogs:
        // backdropClass: 'deep-dark-dialog-backdrop',
      }),
      true,
    );
  }

  public onUserDetailsClick(selectedLoginName: string): void {
    this.afterDialogClosed(
      this.dialog.open(
        UserDetailsComponent,
        {
          data: {
            userLoginName: selectedLoginName,
            authorities: this.authorities,
          },
          maxWidth: LayoutModule.getBreakpoint('md'),
        },
      ),
      true,
    );
  }

  public onUserDeleteclick(loginName: string): void {
    this.dialog.open(QuestionDialogComponent, {
      data: {
        message: _('USERS.DELETE_USER_ALERT'),
        params: { loginName },
      },
    }).afterClosed().subscribe(
      (res) => {
        if (res) {
          this.usersService.setUserDisabledTimestamp({
            targetLoginName: loginName,
          }).subscribe(
            (ok) => {
              this.openFeedbackDialog(_('USERS.USER_DELETED_ALERT'), { loginName });
            },
            // TODO: Implement all error codes
            (err) => {
              let errorMessage: string;
              if (err.error.errorCode === 'DELETE_SELF') {
                errorMessage = _('USERS.CANT_DELETE_SELF_ALERT');
              } else {
                errorMessage = _('USERS.DELETE_USER_ERROR');
              }
              this.openFeedbackDialog(errorMessage, { loginName });
            },
          );
        }
      },
    );
  }
}
