import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViegaCommonModule } from 'src/app/shared/lib/viega-common/lib/viega-common.module';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ModalDialogComponent } from './modal-dialog.component';

xdescribe('ModalDialogComponent', () => {
  let component: ModalDialogComponent;
  let fixture: ComponentFixture<ModalDialogComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [
        ModalDialogComponent,
      ],
      imports: [
        ViegaCommonModule,
        MatDialogModule,
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
    fixture = TestBed.createComponent(ModalDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
