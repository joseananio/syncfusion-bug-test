import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { UserDetailsComponent } from './user-details.component';
import { ViegaCommonModule } from '../../shared/lib/viega-common/lib/viega-common.module';
import { ModalDialogModule } from '../../shared/components/modal-dialog/modal-dialog.module';
import { UserOutputDto, UsersService } from '../../core/services';

xdescribe('UserDetailsComponent', () => {
  let component: UserDetailsComponent;
  let fixture: ComponentFixture<UserDetailsComponent>;
  const mockuserList = {} as UserOutputDto[];
  const mockuser = {} as UserOutputDto;

  const usersServiceStub = {
    getUsers: jasmine.createSpy('getUsers').and.returnValue(of(mockuserList)),
    getUserMetadata: jasmine.createSpy('getUserMetadata').and.returnValue(of(mockuser)),
  };

  const authServiceStub = {
    getUserName: jasmine.createSpy('getUserName').and.returnValue(of('mockUserName')),
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [
        UserDetailsComponent,
      ],
      imports: [
        ViegaCommonModule,
        MatDialogModule,
        ModalDialogModule,
        FormsModule,
      ],
      providers: [
        // These need to be mocked because of matDialogModule dependencies.
        { provide: MatDialogRef, useValue: {} },
        { provide: MAT_DIALOG_DATA, useValue: [] },
        { provide: UsersService, useValue: usersServiceStub },
        { provide: 'AuthService', useValue: authServiceStub },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
