import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { MatMenuModule } from '@angular/material/menu';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { MatDialogModule } from '@angular/material/dialog';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
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
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,
    MatDialogModule,
    MatMenuModule,
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
