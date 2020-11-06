import { FormsModule } from '@angular/forms';
import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';
import { of } from 'rxjs';
import { ModalDialogModule } from '../../shared/components/modal-dialog/modal-dialog.module';

import { UserAddComponent } from './user-add.component';
import { ViegaCommonModule } from '../../shared/lib/viega-common/lib/viega-common.module';
import { UsersService, UserOutputDto } from '../../core/services';

xdescribe('UserAddComponent', () => {
  let component: UserAddComponent;
  let fixture: ComponentFixture<UserAddComponent>;
  const mockuserList = {} as UserOutputDto[];

  const usersServiceStub = {
    getUsers: jasmine.createSpy('getUsers').and.returnValue(of(mockuserList)),
    createUser: jasmine.createSpy('createUser').and.returnValue(of(true)),
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [
        UserAddComponent,
      ],
      imports: [
        ViegaCommonModule,
        ModalDialogModule,
        FormsModule,
      ],
      providers: [
        { provide: MatDialogRef, useValue: {} },
        { provide: UsersService, useValue: usersServiceStub },
      ],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
