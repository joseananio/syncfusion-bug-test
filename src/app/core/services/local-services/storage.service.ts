import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export abstract class StorageService {
  storageType: string;

  abstract get(key: string): any;

  abstract set(key: string, value: any): void;

  abstract remove(key: string): void;

  abstract clear(): void;
}
