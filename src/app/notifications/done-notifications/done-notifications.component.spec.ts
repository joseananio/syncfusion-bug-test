import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { DoneNotificationsComponent } from './done-notifications.component';
import { ViegaCommonModule } from '../../shared/lib/viega-common/lib/viega-common.module';
import { ModalDialogModule } from '../../shared/components/modal-dialog/modal-dialog.module';
import { NotificationsModule } from '../notifications.module';
import { MessagesService, MessageOutputDto } from '../../core/services';

xdescribe('DoneNotificationsComponent', () => {
  let component: DoneNotificationsComponent;
  let fixture: ComponentFixture<DoneNotificationsComponent>;
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
    getHistoricalMessages: jasmine.createSpy('getHistoricalMessages ').and.returnValue(of(mockNotifications)),
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [
      ],
      imports: [
        ViegaCommonModule,
        ModalDialogModule,
        FormsModule,
        NotificationsModule,
      ],
      providers: [
        { provide: MessagesService, useValue: notificationsServiceStub },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DoneNotificationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
