import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { CardComponent } from '../../../shared/components/card/card.component';
import { CompteService } from '../services/compte.service';
import { Compte } from '../models/compte.model';
import { getCompteStatut, getStatutClass } from '../utils/compte.utils';

@Component({
  selector: 'app-compte-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, NavbarComponent, CardComponent],
  template: `
    <div class="min-h-screen bg-gray-50">
      <app-navbar></app-navbar>

      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="flex justify-between items-center mb-8">
          <h1 class="text-3xl font-bold text-gray-900">Comptes</h1>
          <button
            routerLink="/comptes/new"
            class="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
            Nouveau Compte
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <app-card>
            <div class="text-center">
              <p class="text-sm font-medium text-gray-500 mb-2">Total Comptes</p>
              <p class="text-3xl font-bold text-gray-900">{{ comptes().length }}</p>
            </div>
          </app-card>

          <app-card>
            <div class="text-center">
              <p class="text-sm font-medium text-gray-500 mb-2">Solde Total</p>
              <p class="text-3xl font-bold text-primary-600">
                {{ calculateTotalSolde() | number:'1.2-2' }} FCFA
              </p>
            </div>
          </app-card>

          <app-card>
            <div class="text-center">
              <p class="text-sm font-medium text-gray-500 mb-2">Comptes Actifs</p>
              <p class="text-3xl font-bold text-green-600">{{ countActiveComptes() }}</p>
            </div>
          </app-card>
        </div>

        <app-card>
          <div class="mb-4">
            <select
              [(ngModel)]="activeFilter"
              (ngModelChange)="onFilterChange()"
              class="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500">
              <option value="all">Tous les comptes</option>
              <option value="active">Comptes actifs</option>
              <option value="blocked">Comptes bloqués</option>
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
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Numéro</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Solde</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date création</th>
                  <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  @for (compte of comptes(); track compte.id) {
                    <tr class="hover:bg-gray-50">
                      <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ compte.numeroCompte }}</td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ compte.clientNomComplet }}</td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <span class="px-2 py-1 text-xs font-semibold rounded-full"
                              [class]="compte.typeCompte === 'EPARGNE' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'">
                          {{ compte.typeCompte }}
                        </span>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        {{ compte.solde | number:'1.2-2' }} FCFA
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <span class="px-2 py-1 text-xs font-semibold rounded-full"
                              [class]="getStatutClass(getStatut(compte))">
                          {{ getStatut(compte) }}
                        </span>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ compte.createdAt | date:'dd/MM/yyyy' }}</td>
                      <td class="px-6 py-4 whitespace-nowrap text-center">
                        <div class="flex justify-center gap-3">
                          <button
                            [routerLink]="['/comptes', compte.id]"
                            title="Voir détails"
                            class="text-primary-600 hover:text-primary-900">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                            </svg>
                          </button>

                          <button
                            [routerLink]="['/transactions/new']"
                            [queryParams]="{compteId: compte.id}"
                            title="Nouvelle transaction"
                            class="text-green-600 hover:text-green-900">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                          </button>

                          <button
                            (click)="onDelete(compte)"
                            title="Supprimer"
                            class="text-red-600 hover:text-red-900">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>

              @if (!comptes() || comptes().length === 0) {
                <div class="text-center py-12 text-gray-500">
                  Aucun compte trouvé
                </div>
              }
            </div>
          }
        </app-card>
      </div>
    </div>
  `
})
export class CompteListComponent implements OnInit {
  private compteService = inject(CompteService);

  loading = signal(true);
  comptes = signal<Compte[]>([]);
  activeFilter: 'all' | 'active' | 'blocked' = 'all';

  ngOnInit(): void {
    this.loadComptes();
  }

  loadComptes(): void {
    this.loading.set(true);
    this.compteService.getAllComptes(undefined).subscribe({
      next: (comptes) => {
        let filteredComptes = comptes;

        if (this.activeFilter === 'active') {
          filteredComptes = comptes.filter(c => this.getStatut(c) === 'Actif');
        } else if (this.activeFilter === 'blocked') {
          filteredComptes = comptes.filter(c => this.getStatut(c).startsWith('Bloqué'));
        }

        this.comptes.set(filteredComptes);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Erreur chargement comptes:', error);
        this.loading.set(false);
      }
    });
  }


  calculateDaysUntilUnlock(dateDeblocage: string): number {
    const unlockDate = new Date(dateDeblocage);
    const today = new Date();
    const diffTime = unlockDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  }

  onFilterChange(): void {
    this.loadComptes();
  }

  calculateTotalSolde(): number {
    return this.comptes().reduce((total, compte) => total + compte.solde, 0);
  }

  countActiveComptes(): number {
    return this.comptes().filter(c => c.isActive).length;
  }

  getStatut(compte: Compte): string {
    return getCompteStatut(compte);
  }

  getStatutClass(statut: string): string {
    return getStatutClass(statut);
  }

  onDelete(compte: Compte): void {
    if (confirm(`⚠️ ATTENTION\n\nÊtes-vous sûr de vouloir supprimer le compte ${compte.numeroCompte} ?\n\nCette action est IRRÉVERSIBLE !`)) {
      this.compteService.deleteCompte(compte.id).subscribe({
        next: () => {
          this.loadComptes();
        },
        error: (error) => {
          console.error('Erreur suppression compte:', error);
          alert('❌ Erreur lors de la suppression');
        }
      });
    }
  }
}
