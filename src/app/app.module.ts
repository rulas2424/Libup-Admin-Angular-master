
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { LocationStrategy, PathLocationStrategy, HashLocationStrategy, DatePipe } from '@angular/common';
import { AppRoutes } from './app.routing';
import { AppComponent } from './app.component';

import { FlexLayoutModule } from '@angular/flex-layout';
import { FullComponent } from './layouts/full/full.component';
import { AppHeaderComponent } from './layouts/full/header/header.component';
import { AppSidebarComponent } from './layouts/full/sidebar/sidebar.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DemoMaterialModule } from './demo-material-module';

import { SharedModule } from './shared/shared.module';
import { SpinnerComponent } from './shared/spinner.component';

import { UserService } from './services/user.service';
import { ApiConfigService } from './services/api-config.service';
import { LlamadasApiService } from './services/llamadas-api.service';
import { AuthGuard } from './guards/auth.guard';
import { BearerTokenInterceptor } from './services/bearer-token.interceptor';
import { ToastrModule } from 'ngx-toastr';
import { CookieService } from 'ngx-cookie-service';
import { MatPaginatorIntl } from '@angular/material';
import { getSpanishPaginatorIntl } from './pages/language-spanish';
import { SucursalesService } from './services/sucursales-service';
import { CategoriesService } from './services/categories-service';
import { UsersAppApiService } from './services/users-app.service';
import { CommonAlerts } from './Common/common-alerts';
import { PromotionsService } from './services/promotions.service';
import { Roles } from './classes/roles';
import { ContestApiService } from './services/contest-service';
import { EncrDecrService } from './classes/EncrDecrService';
import { WinnersService } from './services/winners-service';
import { BroadcasterService } from './services/radiodifusoras.service';
import { ChannelService } from './services/chanels-service';
import {HttpClient} from '@angular/common/http';
import {MultiTranslateHttpLoader} from 'ngx-translate-multi-http-loader';
import {TranslateModule, TranslateLoader} from '@ngx-translate/core';
import { SelectLanguageComponent } from './select-language/select-language.component';
import { NgxLoadingModule } from 'ngx-loading';
// AoT requires an exported function for factories
export function HttpLoaderFactory(httpClient: HttpClient) {
  return new MultiTranslateHttpLoader(httpClient, [
      {prefix: "./assets/translate/core/", suffix: ".json"},
      {prefix: "./assets/translate/shared/", suffix: ".json"},
  ]);
}
@NgModule({
  declarations: [
    AppComponent,
    FullComponent,
    AppHeaderComponent,
    SpinnerComponent,
    AppSidebarComponent, SelectLanguageComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    DemoMaterialModule,
    FormsModule,
    FlexLayoutModule,
    HttpClientModule,
    NgxLoadingModule.forRoot({}),
    SharedModule,
    RouterModule.forRoot(AppRoutes, { useHash: true }),
    ToastrModule.forRoot(),
    HttpClientModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    })
  ],
  exports: [RouterModule],
  providers: [
    { provide: MatPaginatorIntl, useValue: getSpanishPaginatorIntl() },
    ApiConfigService, CommonAlerts, Roles,
    UserService,
    LlamadasApiService,
    SucursalesService,
    CategoriesService,
    UsersAppApiService, BroadcasterService,
    CookieService,ContestApiService, WinnersService,
    PromotionsService, DatePipe, EncrDecrService, ChannelService,
    AuthGuard,
    {
      provide: HTTP_INTERCEPTORS, 
      useClass: BearerTokenInterceptor, 
      multi: true,
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
