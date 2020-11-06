import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { TranslateService } from '@ngx-translate/core';
import {
  ControllerDetailsFirmwareConfigurationComponent,
} from 'src/app/devices/controller-details-configuration/controller-details-firmware-update.component';
import { FeedbackDialogComponent } from 'src/app/shared/components/modal-dialog/feedback-dialog/feedback-dialog.component';
import {
  ActivationInput,
  ActivationService,
  ActivationStatusSlim,
  UpdateService,
} from '../core/services';
import { ActivationManagerService } from '../core/services/local-services';

@Component({
  selector: 'app-activation',
  templateUrl: './activation.component.html',
  styleUrls: ['./activation.component.scss'],
})
export class ActivationComponent extends ControllerDetailsFirmwareConfigurationComponent implements OnInit {
  public activation: ActivationStatusSlim;

  constructor(
    private updateService: UpdateService,
    private activationService: ActivationService,
    private activationManagerService: ActivationManagerService,
    dialog: MatDialog,
    router: Router,
    private translate: TranslateService,
  ) {
    super(dialog, updateService, router);
  }

  ngOnInit() {
    super.ngOnInit();

    this.activationManagerService.getActivationStatus().subscribe(
      (response) => {
        this.activation = response;
      },
      (error) => {
        this.translate.get('ACTIVATION.ACTIVATION_UNKNOWN').subscribe(
          (message) => {
            this.dialog.open(FeedbackDialogComponent, { data: { message } });
          },
        );
      },
    );
  }

  onSubmitActivation() {
    const reader = new FileReader();
    reader.onload = () => {
      const data: ActivationInput = {
        activationCode: reader.result as string,
      };
      this.activationService.activate(data).subscribe(
        (response) => {
          this.router.navigate(['login']);
        },
        (error) => {
          this.translate.get([
            _('ACTIVATION.ACTIVATION_ERROR_MESSAGE'),
            _('ACTIVATION.INVALID_ACTIVATION_CODE'),
          ]).subscribe(
            (messeges) => {
              let message = messeges['ACTIVATION_ERROR_MESSAGE'];
              if (error.error && error.error.errorCode === 'INVALID_ACTIVATION_CODE') {
                message = messeges['INVALID_ACTIVATION_CODE'];
              }
              this.dialog.open(FeedbackDialogComponent, {
                data: { message },
              });
            },
          );
        },
      );
    };
    reader.readAsText(this.selectedFile);
  }
}
