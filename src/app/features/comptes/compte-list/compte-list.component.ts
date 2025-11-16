import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { CardComponent } from '../../../shared/components/card/card.component';
import { TableComponent, TableColumn } from '../../../shared/components/table/table.component';
import { CompteService } from '../services/compte.service';
import { Compte } from '../models/compte.model';

@Component({
  selector: 'app-compte-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, NavbarComponent, CardComponent, TableComponent],
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
              <option [value]="null">Tous les comptes</option>
              <option [value]="true">Comptes actifs</option>
              <option [value]="false">Comptes inactifs</option>
            </select>
          </div>

          @if (loading()) {
            <div class="text-center py-12">
              <p class="text-gray-500">Chargement...</p>
            </div>
          } @else {
            <app-table [columns]="columns" [data]="comptes()" [actions]="true">
              <ng-template #actions let-compte>
                <div class="flex gap-2 justify-end">
                  <button
                    [routerLink]="['/comptes', compte.id]"
                    class="text-primary-600 hover:text-primary-900 font-medium">
                    Détails
                  </button>
                  <button
                    [routerLink]="['/transactions/new']"
                    [queryParams]="{compteId: compte.id}"
                    class="text-green-600 hover:text-green-900 font-medium">
                    Transaction
                  </button>
                  <button
                    (click)="onDelete(compte)"
                    class="text-red-600 hover:text-red-900 font-medium">
                    Supprimer
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
export class CompteListComponent implements OnInit {
  private compteService = inject(CompteService);

  loading = signal(true);
  comptes = signal<Compte[]>([]);
  activeFilter: boolean | null = null;

  columns: TableColumn[] = [
    { key: 'numeroCompte', label: 'Numéro de compte' },
    { key: 'clientNomComplet', label: 'Client' },
    { key: 'typeCompte', label: 'Type', type: 'badge' },
    { key: 'solde', label: 'Solde', type: 'currency' },
    { key: 'createdAt', label: 'Date création', type: 'date' }
  ];

  ngOnInit(): void {
    this.loadComptes();
  }

  loadComptes(): void {
    this.loading.set(true);
    this.compteService.getAllComptes(this.activeFilter ?? undefined).subscribe({
      next: (comptes) => {
        this.comptes.set(comptes);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Erreur chargement comptes:', error);
        this.loading.set(false);
      }
    });
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

  onDelete(compte: Compte): void {
    if (confirm(`Êtes-vous sûr de vouloir supprimer le compte ${compte.numeroCompte} ?`)) {
      this.compteService.deleteCompte(compte.id).subscribe({
        next: () => {
          this.loadComptes();
        },
        error: (error) => {
          console.error('Erreur suppression compte:', error);
          alert('Erreur lors de la suppression');
        }
      });
    }
  }
}
