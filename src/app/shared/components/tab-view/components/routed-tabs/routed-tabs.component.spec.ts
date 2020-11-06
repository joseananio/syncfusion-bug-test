import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { RoutedTabsComponent } from './routed-tabs.component';

xdescribe('RoutedTabsComponent', () => {
  let component: RoutedTabsComponent;
  let fixture: ComponentFixture<RoutedTabsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [RoutedTabsComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RoutedTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  xit('should create', () => {
    expect(component).toBeTruthy();
  });
});
