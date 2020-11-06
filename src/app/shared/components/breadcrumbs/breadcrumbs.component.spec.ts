import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import {
  ActivatedRoute, Router, NavigationEnd, RouterModule,
} from '@angular/router';
import { Observable, of } from 'rxjs';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { BreadcrumbsComponent } from './breadcrumbs.component';

const activatedRouteStub: Partial<ActivatedRoute> = {

};

const routerStub: Partial<Router> = {
  events: new Observable<any>(),
};

const translateServiceStub = {
  get(key: any): any {
    return of(key);
  },
};

describe('BreadcrumbsComponent', () => {
  let component: BreadcrumbsComponent;
  let fixture: ComponentFixture<BreadcrumbsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [BreadcrumbsComponent, TranslatePipe],
      imports: [RouterModule],
      providers: [
        { provide: TranslateService, useValue: translateServiceStub },
        { provide: ActivatedRoute, useValue: activatedRouteStub },
        { provide: Router, useValue: routerStub },
        { provide: NavigationEnd, useValue: routerStub },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BreadcrumbsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
