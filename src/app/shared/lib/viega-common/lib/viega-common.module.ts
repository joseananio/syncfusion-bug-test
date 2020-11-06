import { NgModule } from '@angular/core';

// NOTE: always import modules directly, not via the index.ts. There's a bug in the current angular cli causing the
// build to fail in that case.
import { LogoModule } from './logo/logo.module';
import { HeaderModule } from './header/header.module';
import { ButtonModule } from './button/button.module';
import { RadioModule } from './radio/radio.module';
import { CheckboxModule } from './checkbox/checkbox.module';
import { ColorpickerModule } from './colorpicker/colorpicker.module';
import { ImageGalleryModule } from './image-gallery/image-gallery.module';
import { IconButtonModule } from './icon-button/icon-button.module';
import { ImageModalModule } from './image-modal/image-modal.module';
import { ImageModalComponent } from './image-modal/image-modal.component';
import { DialogWrapperModule } from './dialog-wrapper/dialog-wrapper.module';
import { SliderModule } from './slider/slider.module';
import { UnitInputModule } from './unit-input/unit-input.module';
import { FileInputModule } from './file-input/file-input.module';
import { ItemScrollboxModule } from './item-scrollbox/item-scrollbox.module';
import { StartPageModule } from './start-page/start-page.module';
import { LoadingSpinnerModule } from './loading-spinner/loading-spinner.module';
import { StringReplacePipe } from './string-replace.pipe';
import { TrustHtmlPipe } from './trust-html.pipe';
import { MinMaxValidator } from './MinMaxValidator';
import { DropdownModule } from './dropdown/dropdown.module';
import { ToggleButtonModule } from './toggle-button';
import { InfoButtonModule } from './info-button';
import { AppWidgetModule } from './app-widget';
import { SearchBoxModule } from './search-box';
import { GroupHeadingModule } from './group-heading/group-heading.module';
import { DatagridModule } from './datagrid/datagrid.module';
import { WeekTimePlannerModule } from './week-time-planner';

@NgModule({
  declarations: [StringReplacePipe, TrustHtmlPipe, MinMaxValidator],
  imports: [
    LogoModule,
    LoadingSpinnerModule,
    HeaderModule,
    ButtonModule,
    RadioModule,
    CheckboxModule,
    SliderModule,
    ColorpickerModule,
    UnitInputModule,
    FileInputModule,
    ImageGalleryModule,
    IconButtonModule,
    ImageModalModule,
    DialogWrapperModule,
    ItemScrollboxModule,
    StartPageModule,
    DropdownModule,
    ToggleButtonModule,
    InfoButtonModule,
    AppWidgetModule,
    SearchBoxModule,
    GroupHeadingModule,
    DatagridModule,
    WeekTimePlannerModule
  ],
  exports: [
    StringReplacePipe,
    TrustHtmlPipe,
    MinMaxValidator,

    HeaderModule,
    LoadingSpinnerModule,
    LogoModule,
    ButtonModule,
    RadioModule,
    SliderModule,
    CheckboxModule,
    ColorpickerModule,
    UnitInputModule,
    FileInputModule,
    ImageGalleryModule,
    IconButtonModule,
    ImageModalModule,
    DialogWrapperModule,
    ItemScrollboxModule,
    StartPageModule,
    DropdownModule,
    ToggleButtonModule,
    InfoButtonModule,
    AppWidgetModule,
    SearchBoxModule,
    GroupHeadingModule,
    DatagridModule,
    WeekTimePlannerModule
  ],
})
export class ViegaCommonModule {}
