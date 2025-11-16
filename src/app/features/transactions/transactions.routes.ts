import { Routes } from '@angular/router';

export const TRANSACTIONS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./transaction-list/transaction-list.component').then(m => m.TransactionListComponent)
  },
  {
    path: 'new',
    loadComponent: () => import('./transaction-form/transaction-form.component').then(m => m.TransactionFormComponent)
  }
];
