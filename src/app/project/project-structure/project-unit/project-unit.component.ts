import {
  Component, Inject, OnInit, ViewChild,
} from '@angular/core';
import { NgForm } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import {
  PointAddressCreateInput,
  PointAddressEditInput, PointAddressService,
} from 'src/app/core/services';
import { ModalButtonData } from 'src/app/shared/components/modal-dialog/modal-dialog/modal-dialog.component';
import { Node, ProjectTreeNodeType } from 'src/app/shared/components/project-tree/project-tree.component';

export interface InputDialogData {
  selectedItem: Node;
  mode: string;
}

@Component({
  selector: 'app-project-unit',
  templateUrl: './project-unit.component.html',
  styleUrls: ['./project-unit.component.scss'],
})
export class ProjectUnitComponent implements OnInit {
  @ViewChild(NgForm) formView;

  public title = '';

  public modalButtons: ModalButtonData[] = [
    {
      name: this.data.mode === 'edit' ? _('GLOBAL.SAVE_BUTTON_TEXT') : _('GLOBAL.CREATE_BUTTON_TEXT'),
      type: 'primary',
      eventName: 'create',
      isDisabled: true,
    },
    {
      name: _('GLOBAL.CANCEL_BUTTON_TEXT'),
      type: 'cancel',
      eventName: 'close',
      isDisabled: false,
    },
  ];

  public formData: { id: string; name: string; type: string};

  constructor(private dialogRef: MatDialogRef<ProjectUnitComponent>,
              @Inject(MAT_DIALOG_DATA) public data: InputDialogData,
              private pointAddressService: PointAddressService) {
  }

  ngOnInit() {
    this.formData = {
      id: '',
      name: '',
      type: '',
    };
    const item: PointAddressCreateInput = this.data.selectedItem.pointAddress;
    let name = '';
    if (this.data.selectedItem.type === ProjectTreeNodeType.Project) {
      if (this.data.mode === 'new') {
        name = '';
        this.title = _('PROJECT.CREATE_BUILDING_TITLE');
      }
    } else if (this.data.selectedItem.type === ProjectTreeNodeType.Building) {
      if (this.data.mode === 'edit') {
        name = item.building;
        this.title = _('PROJECT.EDIT_BUILDING_TITLE');
      } else {
        name = '';
        this.title = _('PROJECT.CREATE_AREA_TITLE');
      }
    } else if (this.data.selectedItem.type === ProjectTreeNodeType.Area) {
      if (this.data.mode === 'edit') {
        name = item.area;
        this.title = _('PROJECT.EDIT_AREA_TITLE');
      } else {
        name = '';
        this.title = _('PROJECT.CREATE_ROOM_TITLE');
      }
    } else if (this.data.selectedItem.type === ProjectTreeNodeType.Room) {
      if (this.data.mode === 'edit') {
        name = item.room;
        this.title = _('PROJECT.EDIT_ROOM_TITLE');
      } else {
        name = '';
        this.title = _('PROJECT.CREATE_SEGMENT_TITLE');
      }
    } else if (this.data.selectedItem.type === ProjectTreeNodeType.Segment) {
      if (this.data.mode === 'edit') {
        name = item.segment;
        this.title = _('PROJECT.EDIT_SEGMENT_TITLE');
      } else {
        name = '';
        this.title = _('PROJECT.CREATE_DEVICE_TITLE');
      }
    }
    this.formData.name = name;
  }

  onButtonClicked(eventName: string): void {
    switch (eventName) {
      case 'close': {
        this.onCloseEvent();
        break;
      }
      case 'create': {
        this.onCreateEvent();
        break;
      }
      default: {
        this.onCloseEvent();
        break;
      }
    }
  }

  private onCloseEvent(): void {
    this.dialogRef.close();
  }

  private onCreateEvent(): void {
    if (this.data.mode === 'new') {
      let post: PointAddressCreateInput = {};
      if (this.data.selectedItem.type === ProjectTreeNodeType.Project) {
        post.building = this.formData.name;
      } else {
        post = {
          ...this.data.selectedItem.pointAddress,
        };

        if (this.data.selectedItem.type === ProjectTreeNodeType.Building) {
          post.area = this.formData.name;
        } else if (this.data.selectedItem.type === ProjectTreeNodeType.Area) {
          post.room = this.formData.name;
        } else if (this.data.selectedItem.type === ProjectTreeNodeType.Room) {
          post.segment = this.formData.name;
        }
      }

      this.dialogRef.close(this.pointAddressService.createPointAddress(post));
    }
    if (this.data.mode === 'edit') {
      const post: PointAddressEditInput = {
        ...this.data.selectedItem.pointAddress,
      };

      if (this.data.selectedItem.type === ProjectTreeNodeType.Building) {
        post.newBuilding = this.formData.name;
      } else if (this.data.selectedItem.type === ProjectTreeNodeType.Area) {
        post.newBuilding = post.building;
        post.newArea = this.formData.name;
      } else if (this.data.selectedItem.type === ProjectTreeNodeType.Room) {
        post.newBuilding = post.building;
        post.newArea = post.area;
        post.newRoom = this.formData.name;
      } else if (this.data.selectedItem.type === ProjectTreeNodeType.Segment) {
        post.newBuilding = post.building;
        post.newArea = post.area;
        post.newRoom = post.room;
        post.newSegment = this.formData.name;
      }

      this.dialogRef.close(this.pointAddressService.setPointAddress(post));
    }
  }

  onChange(): void {
    this.modalButtons[0].isDisabled = !this.isFormValid();
  }

  private isFormValid() {
    return this.formView.valid;
  }
}
