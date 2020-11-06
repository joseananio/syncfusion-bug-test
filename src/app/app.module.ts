import { ViegaCommonModule } from 'src/app/shared/lib/viega-common/lib/viega-common.module';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { ToastModule } from '@syncfusion/ej2-angular-notifications';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DeviceIconComponent } from './device-icon/device-icon.component';
import { LangSelectorComponent } from './lang-selector/lang-selector.component';

declare const VERSION: string;

export function httpLoaderFactory(httpClient: HttpClient) {
  return new TranslateHttpLoader(
    httpClient, '../assets/i18n/', `.json?version=${VERSION}`,
  );
}

@NgModule({
  declarations: [
    AppComponent,
    LangSelectorComponent,
    DeviceIconComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,
    MatMenuModule,
    ViegaCommonModule,
    MatIconModule,
    ToastModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: httpLoaderFactory,
        deps: [
          HttpClient,
        ],
      },
    }),
  ],
  providers: [
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
