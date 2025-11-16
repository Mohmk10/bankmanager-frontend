import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { CardComponent } from '../../shared/components/card/card.component';
import { DashboardService } from './services/dashboard.service';
import { DashboardData } from './models/dashboard.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent, CardComponent],
  template: `
    <div class="min-h-screen bg-gray-50">
      <app-navbar></app-navbar>

      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-8">Tableau de bord</h1>

        @if (loading()) {
          <div class="text-center py-12">
            <p class="text-gray-500">Chargement...</p>
          </div>
        } @else if (data()) {
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <app-card>
              <div class="text-center">
                <p class="text-sm font-medium text-gray-500 mb-2">Total Comptes</p>
                <p class="text-3xl font-bold text-gray-900">{{ data()?.totalComptes }}</p>
              </div>
            </app-card>

            <app-card>
              <div class="text-center">
                <p class="text-sm font-medium text-gray-500 mb-2">Solde Total</p>
                <p class="text-3xl font-bold text-primary-600">
                  {{ data()?.soldeTotal | number:'1.2-2' }} FCFA
                </p>
              </div>
            </app-card>

            <app-card>
              <div class="text-center">
                <p class="text-sm font-medium text-gray-500 mb-2">Transactions du jour</p>
                <p class="text-3xl font-bold text-gray-900">{{ data()?.transactionsDuJour }}</p>
              </div>
            </app-card>
          </div>

          <app-card title="Actions rapides" customClass="mb-8">
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button
                routerLink="/comptes/new"
                class="flex flex-col items-center justify-center p-6 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors group">
                <svg class="w-12 h-12 text-primary-600 mb-3 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                </svg>
                <span class="text-sm font-semibold text-gray-900">Créer un compte</span>
              </button>

              <button
                routerLink="/comptes"
                class="flex flex-col items-center justify-center p-6 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors group">
                <svg class="w-12 h-12 text-blue-600 mb-3 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
                </svg>
                <span class="text-sm font-semibold text-gray-900">Lister des comptes</span>
              </button>

              <button
                routerLink="/transactions/new"
                class="flex flex-col items-center justify-center p-6 bg-green-50 hover:bg-green-100 rounded-lg transition-colors group">
                <svg class="w-12 h-12 text-green-600 mb-3 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <span class="text-sm font-semibold text-gray-900">Nouvelle transaction</span>
              </button>

              <button
                (click)="onLogout()"
                class="flex flex-col items-center justify-center p-6 bg-red-50 hover:bg-red-100 rounded-lg transition-colors group">
                <svg class="w-12 h-12 text-red-600 mb-3 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                </svg>
                <span class="text-sm font-semibold text-gray-900">Quitter</span>
              </button>
            </div>
          </app-card>

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <app-card>
              <div class="flex justify-between items-center mb-4">
                <h3 class="text-lg font-semibold text-gray-900">Comptes récents</h3>
                <a routerLink="/comptes" class="text-sm text-primary-600 hover:text-primary-800 font-medium">
                  Voir plus →
                </a>
              </div>
              @if (data()?.comptesRecents && data()!.comptesRecents.length > 0) {
                <div class="space-y-4">
                  @for (compte of (data()?.comptesRecents ?? []).slice(0, 5); track compte.id) {
                    <div class="flex justify-between items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                         [routerLink]="['/comptes', compte.id]">
                      <div>
                        <p class="font-medium text-gray-900">{{ compte.numeroCompte }}</p>
                        <p class="text-sm text-gray-500">{{ compte.clientNomComplet }}</p>
                      </div>
                      <div class="text-right">
                        <p class="font-semibold text-gray-900">{{ compte.solde | number:'1.2-2' }} FCFA</p>
                        <span class="text-xs px-2 py-1 rounded-full"
                              [class]="compte.typeCompte === 'EPARGNE' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'">
                          {{ compte.typeCompte }}
                        </span>
                      </div>
                    </div>
                  }
                </div>
              } @else {
                <p class="text-gray-500 text-center py-4">Aucun compte récent</p>
              }
            </app-card>

            <app-card>
              <div class="flex justify-between items-center mb-4">
                <h3 class="text-lg font-semibold text-gray-900">Transactions récentes</h3>
                <a routerLink="/transactions" class="text-sm text-primary-600 hover:text-primary-800 font-medium">
                  Voir plus →
                </a>
              </div>
              @if (data()?.transactionsRecentes && data()!.transactionsRecentes.length > 0) {
                <div class="space-y-4">
                  @for (transaction of (data()?.transactionsRecentes ?? []).slice(0, 5); track transaction.id) {
                    <div class="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p class="font-medium text-gray-900">{{ transaction.idTransaction }}</p>
                        <p class="text-sm text-gray-500">{{ transaction.numeroCompte }}</p>
                      </div>
                      <div class="text-right">
                        <p class="font-semibold"
                           [class]="transaction.type === 'DEPOT' ? 'text-green-600' : 'text-red-600'">
                          {{ transaction.type === 'DEPOT' ? '+' : '-' }}{{ transaction.montant | number:'1.2-2' }} FCFA
                        </p>
                        <p class="text-xs text-gray-500">{{ transaction.dateTransaction | date:'dd/MM/yyyy HH:mm' }}</p>
                      </div>
                    </div>
                  }
                </div>
              } @else {
                <p class="text-gray-500 text-center py-4">Aucune transaction récente</p>
              }
            </app-card>
          </div>
        }
      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  private dashboardService = inject(DashboardService);

  loading = signal(true);
  data = signal<DashboardData | null>(null);

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.dashboardService.getDashboardData().subscribe({
      next: (data) => {
        this.data.set(data);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Erreur chargement dashboard:', error);
        this.loading.set(false);
      }
    });
  }

  onLogout(): void {
    if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
      window.location.href = '/auth/login';
    }
  }
}
