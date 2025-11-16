import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { CardComponent } from '../../../shared/components/card/card.component';
import { TransactionService } from '../services/transaction.service';
import { Transaction, TypeTransaction } from '../models/transaction.model';

@Component({
  selector: 'app-transaction-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, NavbarComponent, CardComponent],
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

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <app-card>
            <div class="text-center">
              <p class="text-lg font-medium text-gray-500 mb-2">Total Transactions</p>
              <p class="text-4xl font-bold text-gray-900">{{ transactions().length }}</p>
            </div>
          </app-card>

          <app-card>
            <div class="text-center">
              <p class="text-sm font-medium text-gray-500 mb-2">Total Dépôts</p>
              <p class="text-2xl font-bold text-green-600 break-words">
                {{ calculateTotalDepots() | number:'1.0-0' }}
              </p>
              <p class="text-xs text-gray-500 mt-1">FCFA</p>
            </div>
          </app-card>

          <app-card>
            <div class="text-center">
              <p class="text-sm font-medium text-gray-500 mb-2">Total Retraits</p>
              <p class="text-2xl font-bold text-red-600 break-words">
                {{ calculateTotalRetraits() | number:'1.0-0' }}
              </p>
              <p class="text-xs text-gray-500 mt-1">FCFA</p>
            </div>
          </app-card>

          <app-card>
            <div class="text-center">
              <p class="text-sm font-medium text-gray-500 mb-2">Total Frais</p>
              <p class="text-2xl font-bold text-yellow-600 break-words">
                {{ calculateTotalFrais() | number:'1.0-0' }}
              </p>
              <p class="text-xs text-gray-500 mt-1">FCFA</p>
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
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID Transaction</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Compte</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Montant</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Frais</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Solde après</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  @for (transaction of transactions(); track transaction.id) {
                    <tr class="hover:bg-gray-50">
                      <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ transaction.idTransaction }}</td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ transaction.numeroCompte }}</td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <span class="px-2 py-1 text-xs font-semibold rounded-full"
                              [class]="transaction.type === 'DEPOT' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'">
                          {{ transaction.type }}
                        </span>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm font-semibold"
                          [class]="transaction.type === 'DEPOT' ? 'text-green-600' : 'text-red-600'">
                        {{ transaction.montant | number:'1.2-2' }} FCFA
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {{ transaction.frais | number:'1.2-2' }} FCFA
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        {{ transaction.soldeApres | number:'1.2-2' }} FCFA
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {{ transaction.dateTransaction | date:'dd/MM/yyyy HH:mm' }}
                      </td>
                    </tr>
                  }
                </tbody>
              </table>

              @if (!transactions() || transactions().length === 0) {
                <div class="text-center py-12 text-gray-500">
                  Aucune transaction trouvée
                </div>
              }
            </div>
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
