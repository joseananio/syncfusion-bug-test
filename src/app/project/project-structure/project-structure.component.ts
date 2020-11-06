import {
  Component, HostListener, OnInit, ViewChild,
} from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import {
  AuthorityCodes,
  ControllerPointOutputDto, ControllerPointService,
  DevicePointOutputDto, DevicePointService,
  PointAddressService,
} from 'src/app/core/services';
import { DataManagerService, NotificationService } from 'src/app/core/services/local-services';
import {
  DeviceFunctionEditComponent,
  DeviceFunctionEditDialogData,
} from 'src/app/devices/device-function-edit/device-function-edit.component';
import { DeviceFunctionListComponent } from 'src/app/devices/device-function-list/device-function-list.component';
import { QuestionDialogComponent } from 'src/app/shared/components/modal-dialog/question-dialog/question-dialog.component';
import { ProjectTreeComponent, ProjectTreeNodeType } from 'src/app/shared/components/project-tree/project-tree.component';
import { LayoutModule } from 'src/app/shared/layout.module';
import { ProjectDeviceComponent } from './project-device/project-device.component';
import { ProjectUnitComponent } from './project-unit/project-unit.component';

@Component({
  selector: 'app-project-structure',
  templateUrl: './project-structure.component.html',
  styleUrls: ['./project-structure.component.scss'],
})

export class ProjectStructureComponent implements OnInit {
  @ViewChild('tree', { static: true })
  public tree: ProjectTreeComponent;

  constructor(
    private dialog: MatDialog,
    private dataManagerService: DataManagerService,
    private pointAddressService: PointAddressService,
    private devicePointService: DevicePointService,
    private controllerPointService: ControllerPointService,
    private notificationService: NotificationService,
  ) {
  }

  actionsBarFixed = false;

  AuthorityCodes = AuthorityCodes;

  authorities: Set<string> = new Set();

  ngOnInit() {
    this.dataManagerService.getUserAuthorityDataManager().ready.then(
      (authorities) => {
        // TODO (Reger): Get requirements where to import/export
        this.authorities = new Set(authorities['result'].authorityCodes);
      },
    ).catch(() => {
      this.notificationService.notify(_('GLOBAL.COULD_NOT_LOAD_PRIVILEGES'));
    });
  }

  @HostListener('window:scroll')
  onScroll() {
    const HEADER_HEIGHT = LayoutModule.isCurrentBreakpoint(['md', 'lg', 'xl']) ? 78 : 75;
    // IE uses a non-standard property here...
    this.actionsBarFixed = (window.scrollY >= HEADER_HEIGHT) || (window.pageYOffset >= HEADER_HEIGHT);
  }

  private afterDialogClosed(dialog: MatDialogRef<any>, forceUpdate?: boolean) {
    dialog.afterClosed().subscribe((backendCall) => {
      // subscribe to running call, if provided
      if (backendCall) {
        this.tree.showGlobalLoadingSpinner();
        backendCall.subscribe(
          () => {
            this.tree.refresh();
          },
          (error) => {
            console.error(error);
            this.tree.refresh();
          },
        );
      } else if (forceUpdate) {
        this.tree.refresh();
      }
    });
  }

  onNewNode() {
    if (this.tree.getSelectedNode()) {
      this.afterDialogClosed(
        this.dialog.open(ProjectUnitComponent, {
          data: {
            selectedItem: this.tree.getSelectedNode(),
            mode: 'new',
          },
          width: '70%',
        }),
      );
    }
  }

  onNewDevice() {
    if (this.tree.getSelectedNode()) {
      this.afterDialogClosed(
        this.dialog.open(ProjectDeviceComponent, {
          data: {
            selectedItem: this.tree.getSelectedNode().id,
            mode: 'new',
          },
          width: '70%',
        }),
      );
    }
  }

  onDuplicateNode() {
    // TODO: Implement this
  }

  onEditNode() {
    if (this.tree.getSelectedNode()) {
      if (this.currentIsDevice() || this.currentIsController()) {
        this.onEditDevice();
      } else if (this.currentIsAreaType()) {
        this.afterDialogClosed(
          this.dialog.open(ProjectUnitComponent, {
            data: {
              selectedItem: this.tree.getSelectedNode(),
              mode: 'edit',
            },
            width: '70%',
          }),
        );
      }
    }
  }

  private onEditDevice(): void {
    if (this.tree.getSelectedNode().type === ProjectTreeNodeType.Controller) {
      this.controllerPointService.getControllerPointByUuid(this.tree.getSelectedNode().id).subscribe(
        (device) => {
          this.spawnEditModal(device as ControllerPointOutputDto);
        },
        (err) => {
          this.notificationService.notify(_('PROJECT.COULD_NOT_GET_CONTROLLER_INFO'));
          console.error(err);
        },
      );
    } else {
      this.devicePointService.getDevicePointByUuid(this.tree.getSelectedNode().id).subscribe(
        (device: DevicePointOutputDto) => {
          this.spawnEditModal(device);
        },
        (err) => {
          this.notificationService.notify(_('PROJECT.COULD_NOT_GET_DEVICE_INFO'));
          console.error(err);
        },
      );
    }
  }

  private spawnEditModal(deviceToEdit: DevicePointOutputDto | ControllerPointOutputDto): void {
    if (this.tree.getSelectedNode()) {
      if (this.currentIsDevice() || this.currentIsController()) {
        this.afterDialogClosed(
          this.dialog.open(ProjectDeviceComponent, {
            data: {
              selectedItem: this.tree.getSelectedNode().id,
              mode: 'edit',
              device: deviceToEdit,
              authorities: this.authorities,
            },
            width: '70%',
          }),
          true,
        );
      } else {
        console.error('onEditDevice() has been called although this is no device.');
      }
    }
  }

  onRemoveNode() {
    if (this.tree.getSelectedNode()) {
      this.dialog.open(QuestionDialogComponent, {
        data: { message: _('PROJECT.REMOVE_DEVICE_ALERT'), params: { deviceName: this.tree.getSelectedNode().text } },
        width: '30%',
      }).afterClosed().subscribe(
        (res: boolean) => {
          if (res) {
            this.tree.showGlobalLoadingSpinner();
            if (this.currentIsDevice()) {
              this.devicePointService.deleteDevicePoint(this.tree.getSelectedNode().id).subscribe(
                (data) => {
                  this.tree.refresh();
                },
                (error) => {
                  this.handleNodeRemovalError(error);
                },
              );
            } else if (this.currentIsController()) {
              this.controllerPointService.setControllerPointDisabled(this.tree.getSelectedNode().id).subscribe(
                (data) => {
                  this.tree.refresh();
                },
                (error) => {
                  this.handleNodeRemovalError(error);
                },
              );
            } else if (this.currentIsAreaType()) {
              this.pointAddressService.deletePointAddress(this.tree.getSelectedNode().pointAddress).subscribe(
                (data) => {
                  this.tree.refresh();
                },
                (error) => {
                  this.handleNodeRemovalError(error);
                },
              );
            }
          }
        },
      );
    }
  }

  private handleNodeRemovalError(error): void {
    this.notificationService.notify(_('PROJECT.COULD_NOT_DELETE'));
    console.error(error);
    this.tree.refresh();
  }

  onFunctionOverview() {
    if (this.tree.getSelectedNode()) {
      this.dialog.open(DeviceFunctionListComponent, {
        data: this.tree.getSelectedNode().id,
        width: '50%',
      });
    }
  }

  onFunctionAdd() {
    if (this.tree.getSelectedNode()) {
      const deviceFunctionEditDialogData: DeviceFunctionEditDialogData = {
        device: {
          devicePointUUID: this.tree.getSelectedNode().id,
        },
      };
      this.dialog.open(DeviceFunctionEditComponent, {
        data: deviceFunctionEditDialogData,
        width: '50%',
      });
    }
  }

  currentIsProject() {
    return this.tree.getSelectedNode() && this.tree.getSelectedNode().type === ProjectTreeNodeType.Project;
  }

  currentIsAreaType() {
    return this.tree.getSelectedNode()
      && (this.tree.getSelectedNode().type === ProjectTreeNodeType.Building
        || this.tree.getSelectedNode().type === ProjectTreeNodeType.Area
        || this.tree.getSelectedNode().type === ProjectTreeNodeType.Room
        || this.tree.getSelectedNode().type === ProjectTreeNodeType.Segment
      );
  }

  currentIsBuiling() {
    return this.tree.getSelectedNode() && this.tree.getSelectedNode().type === ProjectTreeNodeType.Building;
  }

  currentIsArea() {
    return this.tree.getSelectedNode() && this.tree.getSelectedNode().type === ProjectTreeNodeType.Area;
  }

  currentIsRoom() {
    return this.tree.getSelectedNode() && this.tree.getSelectedNode().type === ProjectTreeNodeType.Room;
  }

  currentIsSegment() {
    return this.tree.getSelectedNode() && this.tree.getSelectedNode().type === ProjectTreeNodeType.Segment;
  }

  currentIsDevice() {
    return this.tree.getSelectedNode() && this.tree.getSelectedNode().type === ProjectTreeNodeType.Device;
  }

  currentIsController() {
    return this.tree.getSelectedNode() && this.tree.getSelectedNode().type === ProjectTreeNodeType.Controller;
  }

  public removeEnabled(): boolean {
    return this.tree.getSelectedNode()
      // do not remove root node
      && this.tree.getSelectedNode().type !== ProjectTreeNodeType.Project
      // only remove leaf nodes
      && (!this.tree.getSelectedNode().subChild || this.tree.getSelectedNode().subChild.length === 0);
  }
}
