import {
  ChangeDetectorRef, Component,
  ComponentFactoryResolver,
  EventEmitter, Input,
  OnChanges, OnInit,
  Output, ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { BehaviorSubject } from 'rxjs';
import { NotificationService } from 'src/app/core/services/local-services';
import { ImageService } from '../../core/services/api/image.service';
import { DeleteImageInput } from '../../core/services/model/deleteImageInput';
import { DashboardItemComponent } from '../dashboard-item/dashboard-item.component';
import { DeviceListComponent } from '../device-list/device-list.component';
import { DashboardHelper } from '../helper';
import { DashboardConfigItem, Device } from './dashboard-overview/dashboard-overview.component';

// TODO (Reger): Implement method allowing to remove items
// TODO (Reger): Check if backend warns for too large files. Implement compression
// TODO (Reger): Handle both, unassigned devices and empty device points in dashboard, deviceList and items.
// TODO (Reger): Handle already placed items to make dropdown only show not placed devices.
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit, OnChanges {
  @Input() dashboardItems: Device[];

  @Input() backgroundImageDataUri = '';

  @Output() saveConfig: EventEmitter<any> = new EventEmitter();

  @ViewChild('dashboard', { read: ViewContainerRef })
  dashboard: ViewContainerRef;

  public editText: string = _('GLOBAL.EDIT_BUTTON_TEXT');

  public isEditing = false;

  private backgroundImageFile: File;

  private deviceListViewContainerRef: any;

  private deviceListDropDownPosition: {
    leftPercentage?: number;
    topPercentage?: number;
  } = {};

  private windowWidth?: number;

  private windowHeight?: number;

  private editingSub: BehaviorSubject<boolean>;

  deviceListInstance: any;

  constructor(
    private componentFactoryResolver: ComponentFactoryResolver,
    private cdr: ChangeDetectorRef,
    private imgSvc: ImageService,
    private notificationService: NotificationService,
    private route: ActivatedRoute,
  ) {
    this.editingSub = new BehaviorSubject<boolean>(true);
  }

  ngOnChanges() {
    this.drawDashboardItems();
  }

  ngOnInit() {
    this.windowHeight = window.innerHeight;
    this.windowWidth = window.innerWidth;

    this.editingSub.subscribe((isEditing) => {
      if (isEditing) {
        this.removeDeviceListComponent();
      }
    });
  }

  public async onBackgroundImageSelect(event) {
    if (event.target.files.length) {
      this.backgroundImageFile = event.target.files[0];
      this.backgroundImageDataUri = DashboardHelper.normalizeUrl((await this.getBase64(this.backgroundImageFile)) as string);
    }
  }

  public editOrSave(event): void {
    event.stopPropagation();
    this.isEditing = !this.isEditing;
    this.editText = this.isEditing ? _('GLOBAL.SAVE_BUTTON_TEXT') : _('GLOBAL.EDIT_BUTTON_TEXT');

    this.editingSub.next(!this.isEditing);

    if (!this.isEditing) {
      this.saveConfiguration();
    }
  }

  public onRemoveBackgroundImage(): void {
    // can't delete it if it wasn't uploaded
    if (this.backgroundImageDataUri.includes('base64')) {
      this.backgroundImageDataUri = 'assets/img/dashboard-empty.png';
      this.backgroundImageFile = null;
      this.saveConfiguration();
      return;
    }
    const parts = this.backgroundImageDataUri.split('/');
    const data: DeleteImageInput = {
      filename: parts[parts.length - 1],
    };
    this.imgSvc.deleteImage(data).subscribe(
      (response) => {
        this.backgroundImageDataUri = 'assets/img/dashboard-empty.png';
        this.backgroundImageFile = null;
        this.saveConfiguration();
      },
      (error) => {
        this.notificationService.notify(_('DASHBOARD.COULD_NOT_REMOVE_BACKGROUND'));
        console.error(error);
      },
    );
  }

  public onCanvasClick(event): void {
    if (!this.isEditing) {
      return;
    }

    // check if one of the buttons in the edit wrapper has been clicked. Somewhat dirty browser compatibility hack.
    let isEditWrapperBtn = false;
    try {
      isEditWrapperBtn = event.target.closest('.action-item') && event.target.closest('.edit-wrapper');
    } catch (err) {
      // browser compatibility hack
    }
    if (!isEditWrapperBtn) {
      this.deviceListDropDownPosition.leftPercentage = (event.x / this.windowWidth) * 100;
      this.deviceListDropDownPosition.topPercentage = (event.offsetY / this.windowHeight) * 100;
      this.showDeviceListComponent(this.deviceListDropDownPosition.leftPercentage, this.deviceListDropDownPosition.topPercentage);
    }
  }

  public onDeviceSelected(selectedDevice: Device): void {
    if (selectedDevice) {
      selectedDevice.position.x = this.deviceListDropDownPosition.leftPercentage;
      selectedDevice.position.y = this.deviceListDropDownPosition.topPercentage;
      this.drawDashboardItem(selectedDevice);
      this.dashboardItems.push(selectedDevice);
      this.editingSub.next(false);
    }
  }

  public onDeviceDelete(selectedDeviceUuid: string): void {
    if (selectedDeviceUuid) {
      this.dashboardItems = this.dashboardItems.filter((item) => item.uuid !== selectedDeviceUuid);
    }
  }

  private showDeviceListComponent(x: number, y: number): void {
    this.removeDeviceListComponent();
    if (this.deviceListInstance === undefined) {
      this.deviceListInstance = this.createComponetRef(DeviceListComponent);

      const instance = this.deviceListInstance;
      this.deviceListViewContainerRef = instance;
      (<DeviceListComponent>instance.instance).deviceSelectedEvent.subscribe((device) => this.onDeviceSelected(device));

      this.dashboard.insert(instance.hostView);
      this.applyStyle(instance, x, y);
    }

    (<DeviceListComponent> this.deviceListInstance.instance).hide = false;
    this.applyStyle(this.deviceListInstance, x, y);
  }

  private removeDeviceListComponent(): void {
    if (this.deviceListViewContainerRef) {
      (<DeviceListComponent> this.deviceListInstance.instance).hide = true;
    }
  }

  private drawDashboardItems(): void {
    this.dashboardItems.forEach((item) => this.drawDashboardItem(item));
  }

  private drawDashboardItem(item: Device): void {
    const component = this.createComponetRef(DashboardItemComponent);
    (<DashboardItemComponent>component.instance).delete.subscribe((deleteEvent) => {
      if (deleteEvent) {
        this.onDeviceDelete((<DashboardItemComponent>component.instance).devicex.uuid);
        component.destroy();
      }
    });
    (<DashboardItemComponent>component.instance).devicex = item;
    this.applyStyle(component, item.position.x, item.position.y);
    this.dashboard.insert(component.hostView);
    this.editingSub.subscribe((isEditing) => (<DashboardItemComponent>component.instance).onEditingChanged(isEditing));
  }

  // TODO (Reger): This factory should be properly typed
  private createComponetRef(component) {
    const factory = this.componentFactoryResolver.resolveComponentFactory(component);
    const componentRef = factory.create(this.dashboard.injector);
    return componentRef;
  }

  private applyStyle(componentRef, left, top): void {
    componentRef.location.nativeElement.style = `
  left: ${left}%;
  top: ${top}%;
  position:absolute;
  :hover:{
    cusor:pointer;
  }
`;

    this.cdr.detectChanges();
  }

  private saveConfiguration(): void {
    if (!this.backgroundImageFile) {
      this.broadCastChanges();
      return;
    }

    this.imgSvc.postImageForm(this.backgroundImageFile).subscribe(
      (response) => {
        this.backgroundImageDataUri = DashboardHelper.normalizeUrl(response);
        this.broadCastChanges();
      },
      (error) => {
        this.notificationService.notify(_('DASHBOARD.COULD_NOT_SAVE_BACKGROUND'));
        console.error(error);
      },
    );
  }

  private broadCastChanges(): void {
    const devices = this.dashboardItems;
    const dashboardConfigItem: DashboardConfigItem = {
      devices,
      imageUrl: DashboardHelper.normalizeUrl(this.backgroundImageDataUri),
      name: this.route.snapshot.paramMap.get('dashboardName'),
    };
    this.saveConfig.emit(dashboardConfigItem);
  }

  private getBase64(file: File) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result.toString());
      reader.onerror = reject;
    });
  }
}
