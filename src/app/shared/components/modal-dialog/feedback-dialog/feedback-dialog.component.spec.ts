import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ViegaCommonModule } from 'src/app/shared/lib/viega-common/lib/viega-common.module';
import { ModalDialogModule } from '../modal-dialog.module';
import { FeedbackDialogComponent } from './feedback-dialog.component';

xdescribe('FeedbackDialogComponent', () => {
  let component: FeedbackDialogComponent;
  let fixture: ComponentFixture<FeedbackDialogComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      // No declarations in this test since importet module already declares it.
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
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FeedbackDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
