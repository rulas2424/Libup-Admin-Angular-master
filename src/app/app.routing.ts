import { Routes } from '@angular/router';

import { FullComponent } from './layouts/full/full.component';

export const AppRoutes: Routes = [
  {
    path: '',
    component: FullComponent,
    children: [
      {
        path: '',
        redirectTo: '/login',
        pathMatch: 'full'
      },
      {
        path: '',
        loadChildren:
          () => import('./pages/material.module').then(m => m.MaterialComponentsModule)
      },
      {
        path: 'login',
        loadChildren: () => import('./starter/starter.module').then(m => m.StarterModule)
      }
    ]
  }
];
