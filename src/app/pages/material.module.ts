import 'hammerjs';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { CommonModule } from '@angular/common';

import { DemoMaterialModule } from '../demo-material-module';
import { CdkTableModule } from '@angular/cdk/table';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';

import { MaterialRoutes } from './material.routing';
import { LoginSuccessComponent } from './login-success/login-success.component';
import { ComerciosComponent } from './comercios/comercios.component';
import { SucursalesComponent } from './sucursales/sucursales.component';
import { AgmCoreModule } from '@agm/core';
import { CategoriesComponent } from './categories/categories.component';
import { UsersAppComponent } from './users-app/users-app.component';
import { UsersAdminsComponent } from './users-admins/users-admins.component';
import { PromotionsComponent } from './promotions/promotions.component';
import { DescuentosComponent } from './descuentos/descuentos.component';
import { ProfileComponent } from './profile/profile.component';
import { AwardsAddComponent } from './awards-add/awards-add.component';
import { AcrAudiosComponent } from './acr-audios/acr-audios.component';
import { ContestComponent } from './contest/contest.component';
import { WinnersComponent } from './winners/winners.component';
import { WinnersDirectComponent } from './winners-direct/winners-direct.component';
import { NotificationsComponent } from './notifications/notifications.component';
import { ContestCommerceComponent } from './contest-commerce/contest-commerce.component';
import { BroadcastersComponent } from './broadcasters/broadcasters.component';
import { ChannelsComponent } from './channels/channels.component';
import { ShopBroadcasterComponent } from './shop-broadcaster/shop-broadcaster.component';
import { MatchRadiosComponent } from './match-radios/match-radios.component';
import { ChatComponent } from './chat/chat.component';
import { SharedModule } from '../shared/shared.module';
import { ContestDirectComponent } from './contest-direct/contest-direct.component';
import { ChatViewComponent } from './chat-view/chat-view.component';
import { NgxLoadingModule } from 'ngx-loading';
import { VidePageComponent } from './video-page/video-page.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(MaterialRoutes),
    DemoMaterialModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    FlexLayoutModule, SharedModule, NgxLoadingModule.forRoot({}),
    CdkTableModule,
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyCYrqOD6OHpyvKRANgP0-887NA_B25aSq4',
      libraries: ['places']
    })  
  ],
  providers: [
  
  ],

  declarations: [    
    LoginSuccessComponent,
    ComerciosComponent,
    SucursalesComponent,
    CategoriesComponent,
    UsersAppComponent,
    UsersAdminsComponent,
    PromotionsComponent,
    DescuentosComponent,
    ProfileComponent,
    AwardsAddComponent,
    AcrAudiosComponent,
    ContestComponent,
    WinnersComponent,
    WinnersDirectComponent,
    NotificationsComponent,
    ContestCommerceComponent,
    BroadcastersComponent,
    ChannelsComponent,
    ShopBroadcasterComponent,
    MatchRadiosComponent,
    ChatComponent,
    ContestDirectComponent,
    ChatViewComponent,
    VidePageComponent
  ]
})
export class MaterialComponentsModule {}
