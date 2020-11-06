import { EventEmitter, Output, Directive } from '@angular/core';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { FeedbackDialogComponent } from './feedback-dialog/feedback-dialog.component';
import { NotificationService } from '../../../core/services/local-services';
import { Notification } from '../../../core/services/local-services/notification.service';
import { ModalButtonData, ModalDialogComponent } from './modal-dialog/modal-dialog.component';
import { QuestionDialogComponent } from './question-dialog/question-dialog.component';
@Directive({ selector: '[appDialogueNotification]' })
export class DialogueNotificationDirective {
  btns: ModalButtonData[] = [
    {
      name: _('GLOBAL.OK_BUTTON_TEXT'), type: 'primary', eventName: 'confirm', id: 'btn-input-dialog-confirm',
    },
    {
      name: _('GLOBAL.CANCEL_BUTTON_TEXT'), type: 'cancel', eventName: 'cancel', id: 'btn-input-dialog-cancel',
    },
  ];

  selector: 'dialogue-notification';

  @Output()
  change: EventEmitter<any> = new EventEmitter();

  dialogRef: MatDialogRef<ModalDialogComponent>;

  emitChangeOnDialog = false;

  /* call as super(dialog, notificationService) */
  constructor(public dialog: MatDialog, public notificationService: NotificationService) { }

  /**
   * Allows merging further objects or properties into the parameter array.
   *
   * @param params
   * @returns
   */
  protected mergeDefaultParams(params: { [Key: string]: any } = {}): { [Key: string]: any } {
    return params;
  }

  /**
   * Opens a message dialogue with title, message, and params.
   *
   * @param title Title string.
   * @param msg Message string.
   * @param params Optional parameters.
   * @returns
   */
  protected showDialogue(
    title: string,
    msg = '',
    params: { [Key: string]: any } = {},
  ): MatDialogRef<ModalDialogComponent> {
    /*
    * Show a dialogue notification
    */
    this.dialogRef = this.dialog.open(FeedbackDialogComponent, {
      // data,
      data: {
        title: _(title),
        message: _(msg),
        params: this.mergeDefaultParams(params),
      },
      width: '50%',
    });
    if (this.emitChangeOnDialog) {
      this.change.emit();
    }
    return this.dialogRef;
  }

  /**
   * Opens a question dialogue. Will call 'onQuestionAnswered' upon return.
   *
   * @param title Title of dialogue.
   * @param message Message of dialogue.
   * @param params Pass optional parameters.
   * @returns
   */
  protected showQuestion(title: string, message: string, params: { [Key: string]: any } = {}): MatDialogRef<ModalDialogComponent> {
    /*
    * Show a dialogue question
    */
    this.dialogRef = this.dialog.open(QuestionDialogComponent, {
      data: {
        title: _(title),
        message: _(message),
        params: this.mergeDefaultParams(params),
      },
      width: '50%',
    });

    this.dialogRef.afterClosed().subscribe((res) => {
      this.onQuestionAnswered(res);
    });
    return this.dialogRef;
  }

  /**
   * Override this: this method will be called after the question dialogue has been closed.
   *
   * @param res Answer of dialogue.
   */
  protected onQuestionAnswered(res: any): void {
    throw new Error('onQuestionAnswered() not implemented.');
  }

  /**
   * Shows a notification message.
   *
   * @param message The text.
   * @param messageParameters  Optional parameters.
   */
  protected showNotification(message: Notification | string, messageParameters?: Object): void {
    this.notificationService.notify(message, messageParameters);
  }

  protected closeDialogue() {
    if (this.dialogRef) {
      this.dialogRef.close();
    }
    this.dialogRef = undefined;
  }
}
