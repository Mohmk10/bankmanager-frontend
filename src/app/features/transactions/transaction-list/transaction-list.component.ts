import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { CardComponent } from '../../../shared/components/card/card.component';
import { TableComponent, TableColumn } from '../../../shared/components/table/table.component';
import { TransactionService } from '../services/transaction.service';
import { Transaction, TypeTransaction } from '../models/transaction.model';

@Component({
  selector: 'app-transaction-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, NavbarComponent, CardComponent, TableComponent],
  template: `
    <div class="min-h-screen bg-gray-50">
      <app-navbar></app-navbar>

      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="flex justify-between items-center mb-8">
          <h1 class="text-3xl font-bold text-gray-900">Transactions</h1>
          <button
            routerLink="/transactions/new"
            class="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
            Nouvelle Transaction
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <app-card>
            <div class="text-center">
              <p class="text-sm font-medium text-gray-500 mb-2">Total Transactions</p>
              <p class="text-3xl font-bold text-gray-900">{{ transactions().length }}</p>
            </div>
          </app-card>

          <app-card>
            <div class="text-center">
              <p class="text-sm font-medium text-gray-500 mb-2">Total Dépôts</p>
              <p class="text-3xl font-bold text-green-600">
                {{ calculateTotalDepots() | number:'1.2-2' }} FCFA
              </p>
            </div>
          </app-card>

          <app-card>
            <div class="text-center">
              <p class="text-sm font-medium text-gray-500 mb-2">Total Retraits</p>
              <p class="text-3xl font-bold text-red-600">
                {{ calculateTotalRetraits() | number:'1.2-2' }} FCFA
              </p>
            </div>
          </app-card>

          <app-card>
            <div class="text-center">
              <p class="text-sm font-medium text-gray-500 mb-2">Total Frais</p>
              <p class="text-3xl font-bold text-yellow-600">
                {{ calculateTotalFrais() | number:'1.2-2' }} FCFA
              </p>
            </div>
          </app-card>
        </div>

        <app-card>
          <div class="mb-4">
            <label for="days" class="block text-sm font-medium text-gray-700 mb-2">
              Afficher les transactions des
            </label>
            <select
              id="days"
              [(ngModel)]="daysFilter"
              (ngModelChange)="onDaysChange()"
              class="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500">
              <option [value]="0">Toutes</option>
              <option [value]="1">Dernières 24h</option>
              <option [value]="7">Derniers 7 jours</option>
              <option [value]="30">Derniers 30 jours</option>
              <option [value]="90">Derniers 90 jours</option>
            </select>
          </div>

          @if (loading()) {
            <div class="text-center py-12">
              <p class="text-gray-500">Chargement...</p>
            </div>
          } @else {
            <app-table [columns]="columns" [data]="transactions()" [actions]="true">
              <ng-template #actions let-transaction>
                <div class="flex gap-2 justify-end">
                  <button
                    [routerLink]="['/comptes', transaction.compteId]"
                    class="text-primary-600 hover:text-primary-900 font-medium">
                    Voir compte
                  </button>
                </div>
              </ng-template>
            </app-table>
          }
        </app-card>
      </div>
    </div>
  `
})
export class TransactionListComponent implements OnInit {
  private transactionService = inject(TransactionService);

  loading = signal(true);
  transactions = signal<Transaction[]>([]);
  daysFilter = 0;

  columns: TableColumn[] = [
    { key: 'idTransaction', label: 'ID Transaction' },
    { key: 'numeroCompte', label: 'Compte' },
    { key: 'type', label: 'Type', type: 'badge' },
    { key: 'montant', label: 'Montant', type: 'currency' },
    { key: 'frais', label: 'Frais', type: 'currency' },
    { key: 'soldeApres', label: 'Solde après', type: 'currency' },
    { key: 'statut', label: 'Statut', type: 'badge' },
    { key: 'dateTransaction', label: 'Date', type: 'date' }
  ];

  ngOnInit(): void {
    this.loadTransactions();
  }

  loadTransactions(): void {
    this.loading.set(true);

    const request$ = this.daysFilter > 0
      ? this.transactionService.getRecentTransactions(this.daysFilter)
      : this.transactionService.getAllTransactions();

    request$.subscribe({
      next: (transactions) => {
        this.transactions.set(transactions);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Erreur chargement transactions:', error);
        this.loading.set(false);
      }
    });
  }

  onDaysChange(): void {
    this.loadTransactions();
  }

  calculateTotalDepots(): number {
    return this.transactions()
      .filter(t => t.type === TypeTransaction.DEPOT)
      .reduce((total, t) => total + t.montant, 0);
  }

  calculateTotalRetraits(): number {
    return this.transactions()
      .filter(t => t.type === TypeTransaction.RETRAIT)
      .reduce((total, t) => total + t.montant, 0);
  }

  calculateTotalFrais(): number {
    return this.transactions().reduce((total, t) => total + t.frais, 0);
  }
}
