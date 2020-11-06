import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';
import { ViegaCommonModule } from '../../../lib/viega-common/lib/viega-common.module';
import { ModalDialogModule } from '../modal-dialog.module';
import { GeneratedDynamicDialogComponent } from './generated-dynamic-dialog.component';

const translateServiceStub = {
  get(key: any): any {
    return of(key);
  },
};

describe('GeneratedDynamicDialogComponent', () => {
  let component: GeneratedDynamicDialogComponent;
  let fixture: ComponentFixture<GeneratedDynamicDialogComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ViegaCommonModule, MatDialogModule, ModalDialogModule, FormsModule],
      providers: [
        // These need to be mocked because of matDialogModule dependencies.
        { provide: MatDialogRef, useValue: {} },
        { provide: MAT_DIALOG_DATA, useValue: [] },
        { provide: TranslateService, useValue: translateServiceStub },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GeneratedDynamicDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
