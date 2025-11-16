import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { CardComponent } from '../../../shared/components/card/card.component';
import { ClientService } from '../services/client.service';
import { Client } from '../models/client.model';

@Component({
  selector: 'app-client-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, NavbarComponent, CardComponent],
  template: `
    <div class="min-h-screen bg-gray-50">
      <app-navbar></app-navbar>

      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="flex justify-between items-center mb-8">
          <h1 class="text-3xl font-bold text-gray-900">Clients</h1>
          <button
            routerLink="/clients/new"
            class="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
            Nouveau Client
          </button>
        </div>

        <app-card>
          <div class="mb-4 flex gap-4">
            <input
              type="text"
              [(ngModel)]="searchTerm"
              (ngModelChange)="onSearch()"
              placeholder="Rechercher un client..."
              class="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500">

            <select
              [(ngModel)]="activeFilter"
              (ngModelChange)="onFilterChange()"
              class="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500">
              <option [value]="true">Actifs</option>
              <option [value]="false">Inactifs</option>
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
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nom</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prénom</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Téléphone</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nb Comptes</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date création</th>
                  <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  @for (client of clients(); track client.id) {
                    <tr [class]="client.isActive ? 'hover:bg-gray-50' : 'bg-gray-100 opacity-75'">
                      <td class="px-6 py-4 whitespace-nowrap">
                        @if (client.isActive) {
                          <span class="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                            Actif
                          </span>
                        } @else {
                          <span class="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                            Inactif
                          </span>
                        }
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ client.nom }}</td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ client.prenom }}</td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ client.email }}</td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ client.telephone }}</td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ client.nombreComptes }}</td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ client.createdAt | date:'dd/MM/yyyy' }}</td>
                      <td class="px-6 py-4 whitespace-nowrap text-center">
                        <div class="flex justify-center gap-3">
                          <button
                            [routerLink]="['/clients', client.id]"
                            title="Voir détails"
                            class="text-primary-600 hover:text-primary-900">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                            </svg>
                          </button>

                          @if (client.isActive) {
                            <button
                              [routerLink]="['/clients', client.id, 'edit']"
                              title="Modifier"
                              class="text-yellow-600 hover:text-yellow-900">
                              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                              </svg>
                            </button>

                            <button
                              (click)="onDelete(client)"
                              title="Supprimer"
                              class="text-red-600 hover:text-red-900">
                              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                              </svg>
                            </button>
                          } @else {
                            <span class="text-gray-400 text-xs italic px-4">Verrouillé</span>
                          }
                        </div>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>

              @if (!clients() || clients().length === 0) {
                <div class="text-center py-12 text-gray-500">
                  Aucun client trouvé
                </div>
              }
            </div>
          }
        </app-card>
      </div>
    </div>
  `
})
export class ClientListComponent implements OnInit {
  private clientService = inject(ClientService);

  loading = signal(true);
  clients = signal<Client[]>([]);
  searchTerm = '';
  activeFilter: boolean = true; // Par défaut afficher les actifs

  ngOnInit(): void {
    this.loadClients();
  }

  loadClients(): void {
    this.loading.set(true);
    this.clientService.getAllClients(
      this.activeFilter,
      this.searchTerm || undefined
    ).subscribe({
      next: (clients) => {
        this.clients.set(clients);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Erreur chargement clients:', error);
        this.loading.set(false);
      }
    });
  }

  onSearch(): void {
    this.loadClients();
  }

  onFilterChange(): void {
    this.loadClients();
  }

  onDelete(client: Client): void {
    if (!client.isActive) {
      alert('Ce client est déjà inactif.');
      return;
    }

    if (confirm(`⚠️ ATTENTION\n\nÊtes-vous sûr de vouloir supprimer ${client.prenom} ${client.nom} ?\n\nCette action est IRRÉVERSIBLE !`)) {
      this.clientService.deleteClient(client.id).subscribe({
        next: () => {
          this.loadClients();
        },
        error: (error) => {
          console.error('Erreur suppression client:', error);
          alert('❌ Erreur lors de la suppression');
        }
      });
    }
  }
}
