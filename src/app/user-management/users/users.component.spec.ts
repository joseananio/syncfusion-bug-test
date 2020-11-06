import { FormsModule } from '@angular/forms';
import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { GridModule } from '@syncfusion/ej2-angular-grids';
import { of } from 'rxjs';
import { UsersComponent } from './users.component';
import { ViegaCommonModule } from '../../shared/lib/viega-common/lib/viega-common.module';
import { UsersService, UserOutputDto } from '../../core/services';

xdescribe('UsersComponent', () => {
  let component: UsersComponent;
  let fixture: ComponentFixture<UsersComponent>;

  const mockuserList = {} as UserOutputDto[];

  const usersServiceStub = {
    getUsers: jasmine.createSpy('getUsers').and.returnValue(of(mockuserList)),
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        ViegaCommonModule,
        GridModule,
      ],
      declarations: [
        UsersComponent,
      ],
      providers: [
        { provide: UsersService, useValue: usersServiceStub },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UsersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
