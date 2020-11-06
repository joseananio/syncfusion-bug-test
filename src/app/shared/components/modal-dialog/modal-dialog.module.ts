import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ViegaCommonModule } from '../../lib/viega-common/lib/viega-common.module';
import { FeedbackDialogComponent } from './feedback-dialog/feedback-dialog.component';
import { InputDialogComponent } from './input-dialog/input-dialog.component';
import { QuestionDialogComponent } from './question-dialog/question-dialog.component';
import { GeneratedDynamicDialogModule } from './generated-dynamic-dialog/generated-dynamic-dialog.module';
@NgModule({
  declarations: [FeedbackDialogComponent, InputDialogComponent, QuestionDialogComponent],
  imports: [
    CommonModule,
    ViegaCommonModule,
    MatDialogModule,
    FormsModule,
    ReactiveFormsModule,
    GeneratedDynamicDialogModule,
    TranslateModule,
  ],
  exports: [
    FeedbackDialogComponent,
    InputDialogComponent,
    QuestionDialogComponent,
    GeneratedDynamicDialogModule,
  ],
})
export class ModalDialogModule { }
