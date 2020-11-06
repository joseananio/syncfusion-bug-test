import { Component, OnInit, ViewChild } from '@angular/core';
import { ToastComponent } from '@syncfusion/ej2-angular-notifications';
import { NotificationService, ErrorMessage } from 'src/app/core/services/local-services';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-global-error-notifier',
  templateUrl: './global-error-notifier.component.html',
  styleUrls: ['./global-error-notifier.component.scss'],
})
export class GlobalErrorNotifierComponent implements OnInit {
  private displayDuration = 5000;

  public position = { X: 'Right', Y: 'Bottom' };

  @ViewChild('element')
  element: ToastComponent;

  constructor(
    private globalErrorService: NotificationService,
    private translateService: TranslateService,
  ) { }

  ngOnInit() {
    this.globalErrorService.getNotificationObservable().subscribe(
      (error: ErrorMessage) => {
        if (!error) {
          return;
        }

        this.translateService.get(error.message, error.messageParameters).subscribe((message) => {
          if (error.operation === 'UNPIN') {  // unpin toast
            const pinnedToastIndex = this.getToastCollection().findIndex((toast) => toast.template === message);
            if (pinnedToastIndex >= 0) {
              this.element.hide(this.getToastCollection()[pinnedToastIndex].element[0]);
              this.getToastCollection().splice(pinnedToastIndex, 1);  // delete toast
            }
          } else if (!this.isDuplicate(message)) {  // show toast if not a duplicate
            this.element.show({
              template: message,
              timeOut: (error.operation === 'PIN') ? 0 : this.displayDuration,
              showCloseButton: error.operation !== 'PIN',
            });
          }
        });
      },
    );
  }

  private isDuplicate(message: string): boolean {
    return this.getToastCollection().some((shownToast) => shownToast.template === message);
  }

  private getToastCollection(): any[] {
    // enforce access to private field Toast.toastCollection
    return (this.element as any).toastCollection;
  }
}
