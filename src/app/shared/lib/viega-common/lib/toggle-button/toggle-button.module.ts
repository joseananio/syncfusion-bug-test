import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToggleButtonComponent } from './toggle-button.component';
import { SwitchModule } from '@syncfusion/ej2-angular-buttons';

@NgModule({
  imports: [CommonModule, SwitchModule],
  declarations: [ToggleButtonComponent],
  exports: [ToggleButtonComponent]
})
export class ToggleButtonModule {}
