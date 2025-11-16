import { Routes } from '@angular/router';

export const COMPTES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./compte-list/compte-list.component').then(m => m.CompteListComponent)
  },
  {
    path: 'new',
    loadComponent: () => import('./compte-form/compte-form.component').then(m => m.CompteFormComponent)
  },
  {
    path: ':id',
    loadComponent: () => import('./compte-detail/compte-detail.component').then(m => m.CompteDetailComponent)
  }
];
