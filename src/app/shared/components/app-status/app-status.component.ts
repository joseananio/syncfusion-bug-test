import { Component, NgZone, OnInit } from '@angular/core';
import { Subscription, timer } from 'rxjs';
import { MessagesService } from 'src/app/core/services';

@Component({
  selector: 'viega-app-status',
  templateUrl: './app-status.component.html',
  styleUrls: ['./app-status.component.scss'],
})
export class AppStatusComponent implements OnInit {
  status: { [key: string]: number };

  subscription: Subscription;

  private source = timer(0, 20000);

  constructor(
    private ngZone: NgZone,
    private _messageService: MessagesService,
  ) {}

  ngOnInit() {
    // Subscription done outside angular zone to make e2e tests work.
    this.ngZone.runOutsideAngular(() => {
      this.subscription = this.source.subscribe((x) => {
        // Return to angular zone.
        this.ngZone.run(() => {
          this.loadMessages();
        });
      });
    });
  }

  private loadMessages(): void {
    this._messageService.getMessagesOverview().subscribe(
      (response: { [key: string]: number }) => {
        this.status = response;
      },
      (error) => {
        // do not show stale status
        this.status = null;
        console.log(error);
      },
    );
  }
}
