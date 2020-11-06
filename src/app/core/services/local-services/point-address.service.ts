import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ProjectStructure, ProjectsService, ItemPoint } from 'src/app/core/services';

/**
 * A helper service providing utilities concerning point addresses.
 */
@Injectable({
  providedIn: 'root',
})
export class PointAddressService {
  constructor(private projectsService: ProjectsService) {}

  /**
   * Returns a human readable, address point name for the given device point as a slash-separated
   * path.
   * A device point can be located at any level in the project tree as long as it is in a building.
   */
  public getPointAddressPath(devicePointUuid: string): Observable<string> {
    return new Observable((observer) => {
      this.projectsService.getProjectStructureData().subscribe(
        (structureData: ProjectStructure) => {
          observer.next(
            this.getPointAddressPathIntern(devicePointUuid, structureData),
          );
        },
        (error) => {
          observer.error(error);
        },
      );
    });
  }

  private getPointAddressPathIntern(devicePointUuid: string, projectStructure: ProjectStructure): string {
    const hasDevicePointUuid = (item: ItemPoint) => item.uuid === devicePointUuid;
    let found = false;
    let building;
    let area;
    let room;
    let segment;

    // eslint-disable-next-line no-restricted-syntax, no-labels
    buildingLoop:
    for (let i = 0; i < projectStructure.buildings.length; i += 1) {
      building = projectStructure.buildings[i];
      area = undefined;
      room = undefined;
      segment = undefined;

      found = !!building.items.find(hasDevicePointUuid);
      if (found) {
        break;
      }
      for (let j = 0; j < building.areas.length; j += 1) {
        area = building.areas[j];
        found = !!area.items.find(hasDevicePointUuid);
        if (found) {
          break buildingLoop;  // eslint-disable-line no-labels
        }
        for (let k = 0; k < area.rooms.length; k += 1) {
          room = area.rooms[k];
          found = !!room.items.find(hasDevicePointUuid);
          if (found) {
            break buildingLoop;  // eslint-disable-line no-labels
          }
          for (let l = 0; l < room.segments.length; l += 1) {
            segment = room.segments[l];
            found = !!segment.items.find(hasDevicePointUuid);
            if (found) {
              break buildingLoop;  // eslint-disable-line no-labels
            }
          }
        }
      }
    }

    let result = '-';
    if (found) {
      result = `${building.name}`;
      if (area) {
        result = `${result}/${area.name}`;
        if (room) {
          result = `${result}/${room.name}`;
          if (segment) {
            result = `${result}/${segment.name}`;
          }
        }
      }
    }

    return result;
  }
}
