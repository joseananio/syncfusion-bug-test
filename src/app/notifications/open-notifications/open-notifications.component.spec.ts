import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViegaCommonModule } from 'src/app/shared/lib/viega-common/lib/viega-common.module';
import { ModalDialogModule } from 'src/app/shared/components/modal-dialog/modal-dialog.module';
import { FormsModule } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { of } from 'rxjs';
import { GridModule } from '@syncfusion/ej2-angular-grids';
import { MessageOutputDto, MessagesService } from '../../core/services';
import { OpenNotificationsComponent } from './open-notifications.component';

xdescribe('OpenNotificationsComponent', () => {
  let component: OpenNotificationsComponent;
  let fixture: ComponentFixture<OpenNotificationsComponent>;
  // mock var needs to contain at least 2
  const mockNotifications: MessageOutputDto[] = [
    {
      createdByUuid: 'uuid1',
    },
    {
      createdByUuid: 'uuid2',
    },
  ];

  const notificationsServiceStub = {
    getNewMessages: jasmine.createSpy('getNewMessages').and.returnValue(of(mockNotifications)),
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [
        OpenNotificationsComponent,
      ],
      imports: [
        ViegaCommonModule,
        ModalDialogModule,
        FormsModule,
        GridModule,
      ],
      providers: [
        { provide: MatDialogRef, useValue: {} },
        { provide: MessagesService, useValue: notificationsServiceStub },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OpenNotificationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
