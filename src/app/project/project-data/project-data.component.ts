import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ProjectsService, ProjectBaseData, ImageService } from 'src/app/core/services';
import { ModalButtonData } from 'src/app/shared/components/modal-dialog/modal-dialog/modal-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { FeedbackDialogComponent } from 'src/app/shared/components/modal-dialog/feedback-dialog/feedback-dialog.component';
import { NotificationService } from 'src/app/core/services/local-services';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';

@Component({
  selector: 'app-project-data',
  templateUrl: './project-data.component.html',
  styleUrls: ['./project-data.component.scss'],
})
export class ProjectDataComponent implements OnInit {
  @ViewChild(NgForm) formViewChild;

  // TODO (Reger): Add parameters for readonly attributes (if existing in requirements)
  oldProjectFormData: string;

  isReadOnly: string;

  buttons: ModalButtonData[];

  projectFormData: ProjectBaseData = {
    projectResponsible: {},
    projectInstalledBy: {},
    name: '',
    place: '',
    postalCode: '',
    street: '',
  } as ProjectBaseData;

  namePattern = /^[a-zA-ZäëöüßÄËÖÜ ,.'-]+$/;

  patterns = {
    name: this.namePattern,
    firstName: this.namePattern,
    lastName: this.namePattern,
    title: /^[A-z.]{0,10}$/,
    street: this.namePattern,
  };

  public countBuildings = 0;

  public countAreas = 0;

  public countRooms = 0;

  public countSegments = 0;

  constructor(
    private projectsService: ProjectsService,
    private imageService: ImageService,
    private notificationService: NotificationService,
    private dialog: MatDialog,
  ) {
    this.isReadOnly = 'readonly';
  }

  ngOnInit() {
    // order is important
    this.buttons = [
      {
        name: _('GLOBAL.EDIT_BUTTON_TEXT'),
        type: 'secondary',
        eventName: 'edit',
        id: 'btn-edit',
        isDisabled: false,
      },
      {
        name: _('GLOBAL.SAVE_BUTTON_TEXT'),
        type: 'primary',
        eventName: 'create',
        id: 'btn-save',
        isDisabled: true,
      },
      {
        name: _('GLOBAL.CANCEL_BUTTON_TEXT'),
        type: 'cancel',
        eventName: 'cancel',
        id: 'btn-cancel',
        isDisabled: true,
      },
      {
        name: _('PROJECT.CHANGE_PICTURE'),
        type: 'primary',
        eventName: 'image',
        id: 'btn-upload-image',
        isDisabled: this.projectFormData === undefined,
      },
    ];

    this.oldProjectFormData = JSON.stringify(this.projectFormData);

    this.getProjectBaseSettings();
    this.getProjectStucture();
  }

  private getProjectBaseSettings(): void {
    this.projectsService.getProjectBaseData().subscribe(
      (baseData) => {
        this.projectFormData = baseData;
        this.oldProjectFormData = JSON.stringify(this.projectFormData);
      },
      (err) => {
        this.notificationService.notify(_('PROJECT.COULD_NOT_GET_PROJECT_SETTINGS'));
        console.error(err);
      },
    );
  }

  private getProjectStucture(): void {
    this.countBuildings = 0;
    this.countAreas = 0;
    this.countRooms = 0;
    this.countSegments = 0;

    this.projectsService.getProjectStructureData().subscribe(
      (data) => {
        if (Array.isArray(data.buildings)) {
          data.buildings.forEach((b) => {
            this.countBuildings += 1;
            if (Array.isArray(b.areas)) {
              b.areas.forEach((a) => {
                this.countAreas += 1;
                if (Array.isArray(a.rooms)) {
                  a.rooms.forEach((s) => {
                    this.countRooms += 1;
                    if (Array.isArray(s.segments)) {
                      this.countSegments += s.segments.length;
                    }
                  });
                }
              });
            }
          });
        }
      },
      (error) => {
        this.notificationService.notify(_('PROJECT.COULD_NOT_GET_PROJECT_STRUCTURE'));
        console.error(error);
      },
    );
  }

  private setProjectBaseSettings(): void {
    this.projectsService
      .createUpdateProjectBaseData(this.projectFormData)
      .subscribe(
        (ok) => {
          this.oldProjectFormData = JSON.stringify(this.projectFormData);
        },
        (err) => {
          this.notificationService.notify(_('PROJECT.COULD_NOT_SET_PROJECT_SETTINGS'));
          console.error(err);
        },
      );
  }

  async handlePictureUpload(e) {
    const allowedExtTypes = ['image/jpeg', 'image/gif', 'image/png'];
    let fileToUpload: File;
    fileToUpload = e.target.files[0];
    // TODO(Bernard): Use Swagger constant for maximum project image file size when available.
    if (fileToUpload.size > 25000000) {
      this.dialog.open(FeedbackDialogComponent, {
        data: { message: _('PROJECT.FILE_SIZE_TOO_LARGE') },
        width: '30%',
      });
      return;
    }
    if (allowedExtTypes.indexOf(fileToUpload.type) === -1) {
      this.dialog.open(FeedbackDialogComponent, {
        data: { message: _('PROJECT.FILE_NOT_SUPPORTED') },
        width: '30%',
      });
      return;
    }
    // update UI to display the selected image
    this.projectFormData.imageUrl = (await this.getBase64(
      fileToUpload,
    )) as string;
    // post the image to backend
    this.imageService.postImageForm(fileToUpload).subscribe(
      (response) => {
        this.projectFormData.imageUrl = response;
        fileToUpload = null;
        this.setProjectBaseSettings();
      },
      (error) => {
        this.notificationService.notify(_('PROJECT.COULD_NOT_SET_PROJECT_IMAGE'));
        console.error(error);
      },
    );
  }

  private getBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const encoded = reader.result.toString();
        resolve(encoded);
      };
      reader.onerror = (error) => reject(error);
    });
  }

  registerOnChange(fn: any): void {
    this.formViewChild.valueChanges.subscribe(fn);
  }

  registerOnTouched(fn: any): void {
    this.formViewChild = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    if (isDisabled) {
      this.formViewChild.disable();
    } else {
      this.formViewChild.enable();
    }
  }

  onChange(): void {
    // Get current form status and activate save button
    this.buttons[1].isDisabled = !this.isFormChanged() || !this.isFormVerified();
  }

  isFormChanged(): boolean {
    return this.isDeepObjectDifferent(this.projectFormData, this.oldProjectFormData);
  }

  isFormVerified(): boolean {
    return this.formViewChild.valid;
  }

  // TODO (Reger): Refactor into shared tools
  isDeepObjectDifferent(object: Object, oldJson: string): boolean {
    // Removing '"' from the strings allows comparison even after a type change from inputs, e.g. number to "numberVal"
    return (
      JSON.stringify(object).replace(/"/g, '') !== oldJson.replace(/"/g, '')
    );
  }

  onHandleClick(eventName: string) {
    switch (eventName) {
      case 'edit':
        this.buttons[0].isDisabled = true;
        this.buttons[2].isDisabled = false;
        this.isReadOnly = undefined;
        break;
      case 'create':
        this.setProjectBaseSettings();
        this.buttons[1].isDisabled = true;
        this.buttons[0].isDisabled = false;
        this.buttons[2].isDisabled = true;
        this.isReadOnly = 'readonly';
        break;
      case 'cancel':
        this.buttons[1].isDisabled = true;
        this.buttons[0].isDisabled = false;
        this.buttons[2].isDisabled = true;
        this.isReadOnly = 'readonly';
        this.getProjectBaseSettings();
        break;
      default:
        console.error(`Unknown click event "${eventName}"`);
        break;
    }
  }
}
