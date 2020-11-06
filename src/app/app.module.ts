import { BrowserModule } from '@angular/platform-browser';
import { NgModule, ErrorHandler } from '@angular/core';
import { ToastModule } from '@syncfusion/ej2-angular-notifications';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ViegaCommonModule } from './shared/lib/viega-common/lib/viega-common.module';
import { HomeComponent } from './home';
import { LoginPageModule } from './login-page/login-page.module';
import { CoreModule } from './core/core.module';
import { AlarmDashboardModule } from './alarm-dashboard/alarm-dashboard.module';
import { ProtocolsModule } from './protocols/protocols.module';
import { AppStatusComponent } from './shared/components/app-status/app-status.component';
import { ActivationModule } from './activation/activation.module';
import { LoginStatusComponent } from './shared/components/login-status/login-status.component';
import { NotificationBarModule } from './notification-bar/notification-bar.module';
import { GlobalErrorHandler } from './shared/handlers/global-error-handler.provider';
import { GlobalErrorNotifierComponent } from './shared/components/global-error-notifier/global-error-notifier.component';
import { LangSelectorComponent } from './shared/components/lang-selector/lang-selector.component';
import { BreadcrumbsComponent } from './shared/components/breadcrumbs/breadcrumbs.component';
import { SupportModule } from './support/support.module';

declare const VERSION: string;

export function httpLoaderFactory(httpClient: HttpClient) {
  return new TranslateHttpLoader(
    httpClient, '../assets/i18n/', `.json?version=${VERSION}`,
  );
}

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    AppStatusComponent,
    LoginStatusComponent,
    GlobalErrorNotifierComponent,
    LangSelectorComponent,
    BreadcrumbsComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    CoreModule,
    LoginPageModule,
    ActivationModule,
    HttpClientModule,
    AlarmDashboardModule,
    NotificationBarModule,
    ProtocolsModule,
    SupportModule,
    // viega-common imports ->
    ViegaCommonModule,
    // <- viega-common imports
    MatMenuModule,
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
    {
      provide: ErrorHandler,
      useClass: GlobalErrorHandler,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
