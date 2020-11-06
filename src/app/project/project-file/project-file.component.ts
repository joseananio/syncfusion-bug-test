import {
  Component, OnInit, ViewChild, ElementRef, Inject,
} from '@angular/core';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { MatDialog } from '@angular/material/dialog';
import {
  ActivationManagerService, NotificationService, DataManagerService, AuthenticationService,
} from 'src/app/core/services/local-services';
import { ProjectsService, ActivationStatusSlim, AuthorityCodes } from 'src/app/core/services';
import { ModalButtonData } from 'src/app/shared/components/modal-dialog/modal-dialog/modal-dialog.component';
import { QuestionDialogComponent } from 'src/app/shared/components/modal-dialog/question-dialog/question-dialog.component';
import { FeedbackDialogComponent } from 'src/app/shared/components/modal-dialog/feedback-dialog/feedback-dialog.component';

interface AuthorizedModalButtonData extends ModalButtonData {
  requiredAuthority: AuthorityCodes;
  onClick: Function;
}

@Component({
  selector: 'app-project-file',
  templateUrl: './project-file.component.html',
  styleUrls: ['./project-file.component.scss'],
})
export class ProjectFileComponent implements OnInit {
  @ViewChild('fileInput')
  fileInput: ElementRef;

  private authorities: Set<string> = new Set();

  buttons: AuthorizedModalButtonData[] = [
    {
      name: _('PROJECT.IMPORT'),
      type: 'primary',
      eventName: 'import',
      id: 'btn-import',
      requiredAuthority: AuthorityCodes.IMPORTPROJECT,
      onClick: () => {
        this.fileInput.nativeElement.click();
      },
    },
    {
      name: _('PROJECT.EXPORT'),
      type: 'primary',
      eventName: 'export',
      id: 'btn-export',
      requiredAuthority: AuthorityCodes.EXPORTPROJECT,
      onClick: () => {
        this.exportProject();
      },
    },
    {
      name: _('PROJECT.RESET'),
      type: 'primary',
      eventName: 'reset',
      id: 'btn-reset',
      // This is correct. Project reset authority is controlled by the project creation flag.
      requiredAuthority: AuthorityCodes.CREATEPROJECT,
      onClick: () => {
        this.doReset();
      },
    },
  ];

  constructor(private projectsService: ProjectsService,
              private dialog: MatDialog,
              private activationManagerService: ActivationManagerService,
              private dataManagerService: DataManagerService,
              @Inject('AuthService') private authenticationService: AuthenticationService,
              private notificationService: NotificationService) { }

  ngOnInit() {
    this.dataManagerService.getUserAuthorityDataManager().ready.then(
      (authorities) => {
        this.authorities = new Set(authorities['result'].authorityCodes);
      },
    ).catch(() => {
      this.notificationService.notify(_('GLOBAL.COULD_NOT_LOAD_PRIVILEGES'));
    });
  }

  public isDisabled(button) {
    return !this.authorities.has(button.requiredAuthority);
  }

  private doReset() {
    this.dialog.open(QuestionDialogComponent, {
      data: { message: _('PROJECT.RESET_DATA_ALERT') },
      width: '30%',
    }).afterClosed().subscribe(
      (answer) => {
        if (answer) {
          this.projectsService.resetProjectStructure().subscribe(
            (ok) => {
              window.location.reload();
            },
            (err) => {
              this.notificationService.notify(_('PROJECT.COULD_NOT_RESET'));
            },
          );
        }
      },
    );
  }

  private exportProject() {
    this.activationManagerService.getActivationStatus().subscribe(
      (activationStatus: ActivationStatusSlim) => {
        const now = new Date();
        const fileName = `${now.toISOString().substr(0, 10)} ${now.toLocaleTimeString()} ${activationStatus.projectMetaData.name}.bin`;
        const url = `api/v1/Projects/export/${encodeURIComponent(fileName)}?sid=${this.authenticationService.getSessionId()}`;
        window.open(url, '_blank');
      },
      () => {
        this.reportExportError();
      },
    );
  }

  importProjectFile(e): void {
    const projectFile: File = e.target.files[0];
    this.dialog.open(QuestionDialogComponent, {
      data: {
        title: _('PROJECT.IMPORT_MODAL_TITLE'),
        message: _('PROJECT.IMPORT_DATA_COMFIRMATION'),
      },
      width: '30%',
    }).afterClosed().subscribe(
      (answer) => {
        if (answer) {
          this.projectsService.importProjectFileForm(projectFile).subscribe(
            (done) => {
              this.dialog.open(FeedbackDialogComponent, {
                data: { message: _('PROJECT.IMPORT_DATA_SUCCESSFUL') },
                width: '30%',
              }).afterClosed().subscribe(() => {
                window.location.href = '/';
              });
            },
            (error) => {
              console.error(error);
              this.dialog.open(FeedbackDialogComponent, {
                data: { message: _('PROJECT.IMPORT_DATA_ERROR') },
                width: '30%',
              });
            },
          );
        }
      },
    );
  }

  private reportExportError() {
    this.notificationService.notify(_('PROJECT.EXPORT_CONFIG_FAILED'));
  }
}
