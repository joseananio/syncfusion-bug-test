import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { ViegaCommonModule } from 'src/app/shared/lib/viega-common/lib/viega-common.module';
import { ModalDialogModule } from 'src/app/shared/components/modal-dialog/modal-dialog.module';
import { FormsModule } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { of } from 'rxjs';
import { GridModule } from '@syncfusion/ej2-angular-grids';
import { MessageOutputDto, MessagesService } from '../../core/services';
import { EventNotificationsComponent } from './event-notifications.component';

xdescribe('EventNotificationsComponent', () => {
  let component: EventNotificationsComponent;
  let fixture: ComponentFixture<EventNotificationsComponent>;
  const mockNotifications: MessageOutputDto[] = [
    {
      createdByUuid: 'uuid1',
    },
    {
      createdByUuid: 'uuid2',
    },
  ];

  const notificationsServiceStub = {
    getMessages: jasmine.createSpy('getMessages').and.returnValue(of(mockNotifications)),
  };
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [
        EventNotificationsComponent,
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
    fixture = TestBed.createComponent(EventNotificationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
