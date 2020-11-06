import { PLATFORM_ID, Inject, Injectable } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { StorageService } from './storage.service';

@Injectable()
export class LocalStorageService implements StorageService {
  storageType: string;

  constructor(@Inject(PLATFORM_ID) private platformId: any) {
    if (!isPlatformBrowser(platformId) || !localStorage) {
      throw new Error('Localstorage is not supported');
    }
    this.storageType = 'Local Storage';
  }

  get(key: string): any {
    const item = localStorage.getItem(key);
    if (item) {
      return JSON.parse(item);
    }
    return item;
  }

  set(key: string, value: any): void {
    const jsonValue = JSON.stringify(value);
    localStorage.setItem(key, jsonValue);
  }

  remove(key: string): void {
    localStorage.removeItem(key);
  }

  clear(): void {
    localStorage.clear();
  }
}
