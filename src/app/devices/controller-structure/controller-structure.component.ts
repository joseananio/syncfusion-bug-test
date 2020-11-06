import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ModalButtonData } from 'src/app/shared/components/modal-dialog/modal-dialog/modal-dialog.component';
import { ProjectTreeItem } from 'src/app/shared/components/project-tree/project-tree.component';
import {
  ControllerPointService,
} from 'src/app/core/services';
import { NotificationService } from 'src/app/core/services/local-services';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';

@Component({
  selector: 'app-controller-structure',
  templateUrl: './controller-structure.component.html',
  styleUrls: ['./controller-structure.component.scss'],
})
export class ControllerStructureComponent implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<ControllerStructureComponent>,
    @Inject(MAT_DIALOG_DATA) public device: any,
    private controllerPointSerivce: ControllerPointService,
    private notificationService: NotificationService,
  ) {
    this.modalButtons = [
      {
        name: _('GLOBAL.SAVE_BUTTON_TEXT'),
        type: 'primary',
        eventName: 'save',
        isDisabled: true,
      },
      {
        name: _('GLOBAL.CANCEL_BUTTON_TEXT'),
        type: 'cancel',
        eventName: 'close',
      },
    ];
  }

  public selectedControllerPointId: string;

  public stateLoading = false;

  public stateNoData = false;

  public modalButtons: ModalButtonData[];

  public controllerPoints: ProjectTreeItem[];

  ngOnInit() {
    this.getModyules();
  }

  private getModyules(): void {
    this.stateLoading = true;
    this.stateNoData = false;
    this.controllerPointSerivce.getAllControllerPoints().subscribe(
      (result) => {
        this.controllerPoints = result.filter(
          // filtering out controllers without a point address mitigates a bug allowing this to occur
          (data) => !data.disabledTimestamp && !data.controller_UUID && data.pointAddress_UUID,
        ) as ProjectTreeItem[];  // cast needed since uuid is (theoretically) optional in ControllerOutputDto
        this.stateLoading = false;
        this.stateNoData = !this.controllerPoints.length;
      },
      (error) => {
        this.notificationService.notify(_('GLOBAL.COULD_NOT_INITIALIZE'));
        console.error(error);
        this.dialogRef.close(false);
      },
    );
  }

  onNodeSelect(event): void {
    this.selectedControllerPointId = event.nodeData.id;
    this.modalButtons[0].isDisabled = false;
  }

  onButtonEvent(eventName: string): void {
    switch (eventName) {
      case 'close': {
        this.dialogRef.close(false);
        break;
      }
      case 'save': {
        this.installControllerToControllerPoint({
          controllerId: this.device.device.uuid,
          controllerPointId: this.selectedControllerPointId,
        });
        break;
      }
      default: {
        console.error(
          'ERROR: Function add component: onButtonEvent triggered with unhandled event name',
        );
      }
    }
  }

  private installControllerToControllerPoint(input: {
    controllerPointId: string;
    controllerId: string;
  }): void {
    this.controllerPointSerivce
      .installControllerToControllerPoint({
        controllerUUID: input.controllerId,
        controllerPointUUID: input.controllerPointId,
      })
      .subscribe(
        (x) => {
          this.dialogRef.close(true);
        },
        (err) => {
          console.error(err);
          this.notificationService.notify(_('DEVICES.COULD_NOT_ASSIGN_TO_CONTROLLER_POINT'));
        },
      );
  }
}
