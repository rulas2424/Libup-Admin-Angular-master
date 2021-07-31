import { Routes } from '@angular/router';
import { AuthGuard } from '../guards/auth.guard'

import { LoginSuccessComponent } from './login-success/login-success.component';
import { ComerciosComponent } from './comercios/comercios.component';
import { SucursalesComponent } from './sucursales/sucursales.component';
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
import { ContestDirectComponent } from './contest-direct/contest-direct.component';
import { ChatViewComponent } from './chat-view/chat-view.component';
import { VidePageComponent } from './video-page/video-page.component';

export const MaterialRoutes: Routes = [
  {
    path: 'login-success',
    component: LoginSuccessComponent
  },
  {
    path: 'comercios',
    component: ComerciosComponent,
    canActivate: [AuthGuard], data: { expectedRol: ['SuperAdmin', 'Comercio']}
  },
  {
    path: 'sucursales/:nameCommerce/:idShop',
    component: SucursalesComponent,
    canActivate: [AuthGuard],data: { expectedRol: ['Comercio']}
  },
  {
    path: 'categorias',
    component: CategoriesComponent,
    canActivate: [AuthGuard], data: { expectedRol: ['SuperAdmin']}
  },
  {
    path: 'usuarios-app',
    component: UsersAppComponent,
    canActivate: [AuthGuard], data: { expectedRol: ['SuperAdmin']}
  },  
  {
    path: 'usuarios-admin',
    component: UsersAdminsComponent,
    canActivate: [AuthGuard], data: { expectedRol: ['SuperAdmin']}
  },
  {
    path: 'promociones',
    component: PromotionsComponent,
    canActivate: [AuthGuard], data: { expectedRol: ['Comercio']}
  },
  {
    path: 'descuentos',
    component: DescuentosComponent,
    canActivate: [AuthGuard], data: { expectedRol: ['Comercio']}
  },
  {
    path: 'agregar/premios',
    component: AwardsAddComponent,
    canActivate: [AuthGuard], data: { expectedRol: ['Comercio']}
  }
  ,
  {
    path: 'concursos/comercio',
    component: ContestCommerceComponent,
    canActivate: [AuthGuard], data: { expectedRol: ['Comercio']}
  }
  ,
  {
    path: 'agregar/audios',
    component: AcrAudiosComponent,
    canActivate: [AuthGuard], data: { expectedRol: ['Radio']}
  }
  ,
  {
    path: 'concursos',
    component: ContestComponent,
    canActivate: [AuthGuard], data: { expectedRol: ['Radio']}
  }
  ,
  {
    path: 'profile',
    component: ProfileComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'ganadores/ticktear',
    component: WinnersComponent,
    canActivate: [AuthGuard], data: { expectedRol: ['Radio', 'Comercio']}
  },
  {
    path: 'ganadores/directos',
    component: WinnersDirectComponent,
    canActivate: [AuthGuard], data: { expectedRol: ['Comercio']}
  },
  {
    path: 'notificaciones',
    component: NotificationsComponent,
    canActivate: [AuthGuard], data: { expectedRol: ['Comercio']}
  },
  {
    path: 'radiodifusoras',
    component: BroadcastersComponent,
    canActivate: [AuthGuard], data: { expectedRol: ['SuperAdmin']}
  },
  {
    path: 'canales',
    component: ChannelsComponent,
    canActivate: [AuthGuard], data: { expectedRol: ['Radio']}
  },
  {
    path: 'radiodifusoras/comercio',
    component: ShopBroadcasterComponent,
    canActivate: [AuthGuard], data: { expectedRol: ['Comercio']}
  },
  {
    path: 'contratos/comercio',
    component: MatchRadiosComponent,
    canActivate: [AuthGuard], data: { expectedRol: ['Radio']}
  },
  {
    path: 'chat/:nameChannel/:idChannel',
    component: ChatComponent,
    canActivate: [AuthGuard], data: { expectedRol: ['Radio']}
  },
  {
    path: 'chatApp/:nameChannel/:idChannel/:idUser',
    component: ChatViewComponent
  },
  {
    path: 'concurso/directo',
    component: ContestDirectComponent,
    canActivate: [AuthGuard], data: { expectedRol: ['Comercio']}
  },
  {
    path: 'video',
    component: VidePageComponent,
    canActivate: [AuthGuard], data: { expectedRol: ['Comercio']}
  },
  { path: '**', redirectTo: '/login' }
];
