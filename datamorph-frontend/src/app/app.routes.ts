import { Routes } from '@angular/router';
import { AuthGuard } from '@auth0/auth0-angular';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'studio',
    canActivate: [AuthGuard],
    loadComponent: () => import('./features/studio/studio.component').then(m => m.StudioComponent)
  },
  {
    path: 'quarantine',
    canActivate: [AuthGuard],
    loadComponent: () => import('./features/quarantine/quarantine.component').then(m => m.QuarantineComponent)
  },
  {
    path: 'batches',
    canActivate: [AuthGuard],
    loadComponent: () => import('./features/batches/batches.component').then(m => m.BatchesComponent)
  },
  {
    path: '**',
    redirectTo: ''
  }
];
