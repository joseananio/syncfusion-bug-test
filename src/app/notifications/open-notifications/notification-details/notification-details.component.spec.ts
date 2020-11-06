import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { of } from 'rxjs';
import { NotificationDetailsComponent } from './notification-details.component';
import { NotificationsModule } from '../../notifications.module';
import { MessageOutputDto, MessagesService } from '../../../core/services';

xdescribe('NotificationDetailsComponent', () => {
  let component: NotificationDetailsComponent;
  let fixture: ComponentFixture<NotificationDetailsComponent>;
  const mockNotifications: MessageOutputDto[] = [
    {
      createdByUuid: 'uuid1',
    },
    {
      createdByUuid: 'uuid2',
    },
  ];

  const mockMessageData = {} as MessageOutputDto;

  const notificationsServiceStub = {
    getMessages: jasmine.createSpy('getMessages').and.returnValue(of(mockNotifications)),
    getMessageData: jasmine.createSpy('getMessageData').and.returnValue(of(mockMessageData)),
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [
      ],
      imports: [
        NotificationsModule,
      ],
      providers: [
        { provide: MatDialogRef, useValue: {} },
        { provide: MAT_DIALOG_DATA, useValue: [] },
        { provide: MessagesService, useValue: notificationsServiceStub },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NotificationDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
