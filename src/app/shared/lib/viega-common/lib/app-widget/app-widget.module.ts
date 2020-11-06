import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppWidgetComponent } from './app-widget.component';

@NgModule({
  imports: [CommonModule],
  declarations: [AppWidgetComponent],
  exports: [AppWidgetComponent]
})
export class AppWidgetModule {}
