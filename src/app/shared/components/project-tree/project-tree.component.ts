import {
  Component, EventEmitter, Input, OnInit, Output, ViewChild,
} from '@angular/core';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import {
  DragAndDropEventArgs, DrawNodeEventArgs, FieldsSettingsModel,
  NodeData,
  NodeExpandEventArgs,
  NodeSelectEventArgs, TreeViewComponent,
} from '@syncfusion/ej2-angular-navigations';
import {
  Area, Building, ControllerPointOutputDto, ControllerPointService,
  DevicePointOutputDto,
  DevicePointService,
  ItemPoint, PointAddressCreateInput,
  PointAddressEditInput, PointAddressService, ProjectsService, ProjectStructure,
  Room,
  Segment,
} from 'src/app/core/services';

export interface ProjectTreeItem {
  /**
   * UUID of device point or controller point.
   */
  uuid: string;

  /**
   * If the item shall be checked.
   */
  isChecked?: boolean;

  /**
   * If the item shall be disabled
   */
  isDisabled?: boolean;
}

export type ProjectTreeNodeType = 'project' | 'building' | 'area' | 'room' | 'segment' | 'device' | 'controller';

export const ProjectTreeNodeType = {
  Project: 'project' as ProjectTreeNodeType,
  Building: 'building' as ProjectTreeNodeType,
  Area: 'area' as ProjectTreeNodeType,
  Room: 'room' as ProjectTreeNodeType,
  Segment: 'segment' as ProjectTreeNodeType,
  Device: 'device' as ProjectTreeNodeType,
  Controller: 'controller' as ProjectTreeNodeType,
};

export interface Node extends NodeData {
  subChild: Node[];
  type?: ProjectTreeNodeType;
  icon?: string;
  pointAddress: PointAddressCreateInput;
  isDisabled?: boolean;
}

const VALID_MOVEMENTS: { [key: string]: ProjectTreeNodeType[] } = {
  [ProjectTreeNodeType.Building]: [ProjectTreeNodeType.Project],
  [ProjectTreeNodeType.Area]: [ProjectTreeNodeType.Building],
  [ProjectTreeNodeType.Room]: [ProjectTreeNodeType.Area],
  [ProjectTreeNodeType.Segment]: [ProjectTreeNodeType.Room],
  [ProjectTreeNodeType.Device]: [
    ProjectTreeNodeType.Building,
    ProjectTreeNodeType.Area,
    ProjectTreeNodeType.Room,
    ProjectTreeNodeType.Segment,
  ],
  [ProjectTreeNodeType.Controller]: [
    ProjectTreeNodeType.Building,
    ProjectTreeNodeType.Area,
    ProjectTreeNodeType.Room,
    ProjectTreeNodeType.Segment,
  ],
};

@Component({
  selector: 'app-project-tree',
  templateUrl: './project-tree.component.html',
  styleUrls: ['./project-tree.component.scss'],
})
export class ProjectTreeComponent implements OnInit {
  /**
   * Internal caching: Which boxes should be checked (by uuid?)
   */
  checkedDevicePoints: Set<string> = new Set();

  /**
   * Internal caching: Which boxes should be checked (by uuid?)
   */
  disabledDevicePoints: Set<string> = new Set();

  /**
   * A list of device points and controller points that shall be displayed in the project tree.
   * If it is not provided, all device points and controller points are displayed.
   */
  @Input()
  public set deviceList(deviceList: ProjectTreeItem[]) {
    this._deviceList = deviceList || [];
    this.checkedDevicePoints.clear();
    this._deviceList.filter((devicePoint) => devicePoint.isChecked).forEach((dp) => this.checkedDevicePoints.add(dp.uuid));
    this.disabledDevicePoints.clear();
    this._deviceList.filter((devicePoint) => devicePoint.isDisabled).forEach((dp) => this.disabledDevicePoints.add(dp.uuid));
    this.loadTree();
  }

  constructor(
    private projectService: ProjectsService,
    private pointAddressService: PointAddressService,
    private devicePointService: DevicePointService,
    private controllerPointService: ControllerPointService,
  ) { }

  @ViewChild('tree')
  private tree: TreeViewComponent;

  /**
   * Contains all tree grid component's data including the actual tree data.
   * Tree data contained in treeGridFields.dataSource.
   */
  public treeGridFields: FieldsSettingsModel = {
    dataSource: [],
    id: 'id',
    child: 'subChild',
    iconCss: 'icon',
  };

  public loading: boolean;

  public animation = {
    expand: { effect: '', duration: 0 },
    collapse: { effect: '', duration: 0 },
  };

  private projectStructure: ProjectStructure;

  private _deviceList: ProjectTreeItem[];

  @Input()
  public showCheckBox = false;

  @Input()
  public showButton = false;

  @Input()
  public buttonLabel;

  @Input()
  public allowDragAndDrop = false;

  /**
   * Maximum height in percent of viewport height.
   */
  @Input()
  public maxHeight: number;

  @Output()
  public nodeSelected: EventEmitter<NodeSelectEventArgs> = new EventEmitter();

  @Output()
  public nodeChecked: EventEmitter<{ devicePointUuid: string; checked: boolean; }> = new EventEmitter();

  @Output()
  public nodeButtonClicked: EventEmitter<Node> = new EventEmitter();

  private selectedNode: Node;

  /**
   * Maps node uuids to node objects. This is basically a flat version of the project tree.
   */
  private uuidMap: { [key: string]: Node } = {};

  private collapsedNodes: string[] = [];

  public refresh(): void {
    // discard known project data
    this.projectStructure = undefined;
    this.uuidMap = {};

    this.loadTree();
  }

  /**
   * Disable checkbox of disabled tree items.
   */
  public drawNode(args: DrawNodeEventArgs): void {
    const element: HTMLElement = args.node.querySelector('.e-checkbox-wrapper');
    if (element) {
      if (args.nodeData.isDisabled) {
        element.classList.add('e-checkbox-disabled');
      } else {
        element.classList.remove('e-checkbox-disabled');
      }
    }
  }

  public onNodeCollapsed(args: NodeExpandEventArgs): void {
    this.collapsedNodes.push(args.nodeData.id.toString());
  }

  public onNodeExpanded(args: NodeExpandEventArgs): void {
    const nodeToRemove = this.collapsedNodes.find((n) => (n === args.nodeData.id.toString()));
    this.collapsedNodes.splice(this.collapsedNodes[nodeToRemove], 1);
  }

  /**
   * Enables the loading spinner.
   * This allows using the components spinner to show the progress of external operations.
   */
  public showGlobalLoadingSpinner(): void {
    this.loading = true;
  }

  public getSelectedNode(): Node {
    return this.selectedNode;
  }

  ngOnInit(): void {
    // Make sure that the setter is called even if no device list is specified
    if (!this._deviceList) {
      this.deviceList = [];
    }

    // Show root node even before loading.
    const ROOT_UUID = 'root';
    (this.treeGridFields.dataSource as any[]).push(this.getViewModel(
      ProjectTreeNodeType.Project,
      ROOT_UUID,
      { name: _('PROJECT.ROOT_NAME') },
    ));
  }

  public showActionButton(data): boolean {
    return this.showButton
        && (data.type === ProjectTreeNodeType.Device || data.type === ProjectTreeNodeType.Controller);
  }

  private getViewModel(
    type: ProjectTreeNodeType,
    uuid: string,
    model: Building | Area | Room | Segment | ItemPoint,
    parentUuid?: string,
    CSSicon?: string,
    pointAddress?: PointAddressCreateInput,
  ): Node {
    if (this.uuidMap[uuid] && uuid !== '') {
      const viewModel2: Node = this.uuidMap[uuid];
      viewModel2.text = model.name;
      viewModel2.parentID = parentUuid;
      viewModel2.expanded = !this.collapsedNodes.find((n) => n === viewModel2.id);
      return viewModel2;
    }
    const viewModel: Node = {
      type,
      pointAddress,
      id: uuid,
      text: model.name,
      expanded: true,
      subChild: [],
      icon: CSSicon,
      parentID: parentUuid,
      isChecked: null,
      isDisabled: null,
      selected: false,
      hasChildren: undefined,
    };
    // If these aren't set in here, the component will break. That is probably due to
    // the different nesting levels. TODO [Baumgarten]: Refactor this.
    if (this.showCheckBox && this.checkedDevicePoints.has(uuid)) {
      viewModel.isChecked = 'true';
    }
    if (this.disabledDevicePoints.has(uuid)) {
      viewModel.isDisabled = true;
    }
    this.uuidMap[uuid] = viewModel;
    return viewModel;
  }

  private backendToTreeStructure(backendProjectStructe: ProjectStructure): Node[] {
    const buildings: Node[] = backendProjectStructe.buildings.map(
      (b, i) => {
        const nb: Node = this.getViewModel(
          ProjectTreeNodeType.Building,
          b.pointAddressUuid,
          b,
          'project_root',
          'icon icon-home',
          { building: b.name },
        );
        if (!b.areas) {
          return nb;
        }
        nb.subChild = b.areas.map(
          (a, j) => {
            const na: Node = this.getViewModel(
              ProjectTreeNodeType.Area,
              a.pointAddressUuid,
              a,
              nb.id,
              'icon icon-gridview-01',
              { building: nb.text, area: a.name },
            );
            if (!a.rooms) {
              return na;
            }
            na.subChild = a.rooms.map(
              (r, k) => {
                const nr: Node = this.getViewModel(
                  ProjectTreeNodeType.Room,
                  r.pointAddressUuid,
                  r,
                  na.id,
                  'icon icon-bullet',
                  { building: nb.text, area: na.text, room: r.name },
                );
                if (!r.segments) {
                  return nr;
                }
                nr.subChild = r.segments.map(
                  (s, l) => {
                    const ns: Node = this.getViewModel(
                      ProjectTreeNodeType.Segment,
                      s.pointAddressUuid,
                      s,
                      nr.id,
                      'icon icon-minus-01',
                      {
                        building: nb.text, area: na.text, room: nr.text, segment: s.name,
                      },
                    );
                    if (!s.items) {
                      return ns;
                    }
                    ns.subChild = s.items.map(
                      (item, m) => {
                        const type = item.type === 'CONTROLLER_POINT' ? ProjectTreeNodeType.Controller : ProjectTreeNodeType.Device;
                        const dp: Node = this.getViewModel(type, item.uuid, item, ns.id, 'icon icon-faders-01');
                        // Well, this cast is an obvious lie, but for some reasons NodeData defines isChecked as string, while it should be
                        // a boolean.
                        dp.isChecked = this.showCheckBox && this.checkedDevicePoints.has(item.uuid) as unknown as string;
                        dp.isDisabled = this.disabledDevicePoints.has(item.uuid);
                        return dp;
                      },
                    );
                    return ns;
                  },
                );
                nr.subChild = nr.subChild.concat(r.items.map(
                  (item, m) => {
                    const type = item.type === 'CONTROLLER_POINT' ? ProjectTreeNodeType.Controller : ProjectTreeNodeType.Device;
                    const ni: Node = this.getViewModel(type, item.uuid, item, nr.id, 'icon icon-faders-01');
                    return ni;
                  },
                ));
                return nr;
              },
            );
            na.subChild = na.subChild.concat(a.items.map(
              (item, m) => {
                const type = item.type === 'CONTROLLER_POINT' ? ProjectTreeNodeType.Controller : ProjectTreeNodeType.Device;
                const ni: Node = this.getViewModel(type, item.uuid, item, na.id, 'icon icon-faders-01');
                return ni;
              },
            ));
            return na;
          },
        );
        nb.subChild = nb.subChild.concat(b.items.map(
          (item, m) => {
            const type = item.type === 'CONTROLLER_POINT' ? ProjectTreeNodeType.Controller : ProjectTreeNodeType.Device;
            const ni: Node = this.getViewModel(type, item.uuid, item, nb.id, 'icon icon-faders-01');
            return ni;
          },
        ));
        return nb;
      },
    );
    return buildings;
  }

  private loadTree() {
    // lazy loading of this.projectStructure
    if (this.projectStructure) {
      this.buildTree();
      return;
    }

    this.loading = true;
    this.projectService.getProjectStructureData().subscribe(
      (structure: ProjectStructure) => {
        this.projectStructure = structure;
        this.buildTree();
        this.loading = false;
      },
      (error) => {
        console.error(error);
        this.loading = false;
      },
    );
  }

  private buildTree() {
    let newStructure: ProjectStructure;
    if (this._deviceList.length) {
      const buildings = this.generateBuildings(this.projectStructure, this._deviceList);
      newStructure = { buildings };
    }
    // Create or get changed ViewModel:
    const projectVM: any = this.getViewModel(
      ProjectTreeNodeType.Project,
      'root',
      { name: _('PROJECT.ROOT_NAME') },
    );
    // Alter structure:
    if (newStructure) {
      projectVM.subChild = this.backendToTreeStructure(newStructure);
    } else {
      projectVM.subChild = this.backendToTreeStructure(this.projectStructure);
    }

    this.treeGridFields = {
      dataSource: [projectVM],
      id: 'id',
      child: 'subChild',
      iconCss: 'icon',
    };

    if (this.selectedNode) {
      this.selectNode(this.selectedNode.id);
    }
  }

  private generateBuildings(structure: ProjectStructure, devicePoints: DevicePointOutputDto[] | ControllerPointOutputDto[]): Building[] {
    const usedDevicePoints: Set<string> = new Set((devicePoints as { uuid: string }[]).map((devicePoint) => devicePoint.uuid));

    // create deep copy of project structure
    const resultBuildings = JSON.parse(JSON.stringify(structure.buildings));
    // remove all nodes not connecting a used leaf with root using a depth first search
    // reverse iteration order used to allow removing the current element
    for (let i = resultBuildings.length - 1; i >= 0; i -= 1) {
      const building = resultBuildings[i];
      for (let j = building.areas.length - 1; j >= 0; j -= 1) {
        const area = building.areas[j];
        for (let k = area.rooms.length - 1; k >= 0; k -= 1) {
          const room = area.rooms[k];
          for (let l = room.segments.length - 1; l >= 0; l -= 1) {
            const segment = room.segments[l];
            segment.items = segment.items.filter((item) => usedDevicePoints.has(item.uuid));
            if (!segment.items.length) {
              room.segments.splice(l, 1);  // remove unused segments
            }
          }
          room.items = room.items.filter((item) => usedDevicePoints.has(item.uuid));
          if (!room.segments.length && !room.items.length) {
            area.rooms.splice(k, 1);  // remove unused rooms
          }
        }
        area.items = area.items.filter((item) => usedDevicePoints.has(item.uuid));
        if (!area.rooms.length && !area.items.length) {
          building.areas.splice(j, 1); // remove unused areas
        }
      }
      building.items = building.items.filter((item) => usedDevicePoints.has(item.uuid));
      if (!building.areas.length && !building.items.length) {
        resultBuildings.splice(i, 1);  // remove unused buildings
      }
    }

    return resultBuildings;
  }

  private selectNode(id: string) {
    this.tree.selectedNodes.pop();
    this.tree.selectedNodes.push(id);

    // preserve height during refresh
    this.tree.element.style.minHeight = `${this.tree.element.offsetHeight}px`;
    this.tree.refresh();
    if (this.collapsedNodes.length) {
      this.tree.collapseAll(this.collapsedNodes);
    }
    // clear fixed height after refresh
    this.tree.element.style.minHeight = undefined;

    this.selectedNode = this.uuidMap[id];
  }

  public onNodeSelected(e: NodeSelectEventArgs) {
    const key = e.nodeData.id;
    this.selectedNode = this.uuidMap[key.toString()];

    this.nodeSelected.emit(e);
  }

  public onNodeChecked(event): void {
    const node = this.uuidMap[event.data[0].id];
    this.nodeChecked.emit({
      devicePointUuid: node.id,
      checked: event.action === 'check',
    });
  }

  public onNodeButtonClicked(uuid: string): void {
    this.nodeButtonClicked.emit(this.uuidMap[uuid]);
  }

  private moveItem(fromUuid: string, toUuid: string) {
    const fromObject = this.uuidMap[fromUuid];
    const toObject = this.uuidMap[toUuid];

    this.selectedNode = this.uuidMap[fromUuid];

    let call = null;
    if (fromObject.type === ProjectTreeNodeType.Device) {
      call = this.devicePointService.updateDevicePointByAddressUUID(fromUuid, {
        addressUUID: toUuid,
      });
    } else if (fromObject.type === ProjectTreeNodeType.Controller) {
      call = this.controllerPointService.updateControllerPointByAddressUUID(fromUuid, {
        addressUUID: toUuid,
      });
    } else {
      // or add original item name
      const pointAddressEditInput: PointAddressEditInput = {
        newBuilding: toObject.pointAddress.building,
        newArea: toObject.pointAddress.area || fromObject.pointAddress.area,
        newSegment: toObject.pointAddress.segment || fromObject.pointAddress.segment,
        newRoom: toObject.pointAddress.room || fromObject.pointAddress.room,
        ...fromObject.pointAddress,
      };
      call = this.pointAddressService.setPointAddress(pointAddressEditInput);
    }
    call.subscribe(
      (data) => {
        this.refresh();
      },
      (error) => {
        console.error(error);
        this.refresh();
      },
    );
  }

  public onDragStop(event: DragAndDropEventArgs) {
    const isCompatible = this.checkForCompactibility(event);
    if (!isCompatible
        || event.dropIndicator === 'e-no-drop'
        || event.dropIndicator === 'e-drop-next'
        || !event.draggedNodeData
        || !event.droppedNodeData) {
      event.cancel = true;
      return;
    }

    this.moveItem(event.draggedNodeData.id as string, event.droppedNodeData.id as string);
    event.cancel = true;
  }

  public onNodeDrag(event: DragAndDropEventArgs): void {
    if (!this.checkForCompactibility(event)) {
      event.dropIndicator = 'e-no-drop';
    }
  }

  private checkForCompactibility(event: DragAndDropEventArgs): boolean {
    if (!event.droppedNodeData
        || !event.droppedNodeData.id
        || event.dropIndicator === 'e-drop-next'
        || event.dropIndicator === 'e-no-drop') {
      return false;
    }
    const from = this.uuidMap[event.draggedNodeData.id as string];
    const to = this.uuidMap[event.droppedNodeData.id as string];
    return VALID_MOVEMENTS[from.type].includes(to.type);
  }
}
