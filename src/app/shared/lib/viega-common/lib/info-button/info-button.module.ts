import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InfoButtonComponent } from './info-button.component';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ButtonModule } from '@syncfusion/ej2-angular-buttons';
import { TooltipModule } from '@syncfusion/ej2-angular-popups';

@NgModule({
  imports: [
    CommonModule,
    MatTooltipModule,
    MatButtonModule,
    ButtonModule,
    TooltipModule
  ],
  declarations: [InfoButtonComponent],
  exports: [InfoButtonComponent]
})
export class InfoButtonModule {}
