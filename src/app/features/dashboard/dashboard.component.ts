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

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <app-card title="Comptes récents">
              @if (data()?.comptesRecents && data()!.comptesRecents.length > 0) {
                <div class="space-y-4">
                  @for (compte of data()?.comptesRecents; track compte.id) {
                    <div class="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
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

            <app-card title="Transactions récentes">
              @if (data()?.transactionsRecentes && data()!.transactionsRecentes.length > 0) {
                <div class="space-y-4">
                  @for (transaction of data()?.transactionsRecentes; track transaction.id) {
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
}
