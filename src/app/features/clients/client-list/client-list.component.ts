import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { CardComponent } from '../../../shared/components/card/card.component';
import { TableComponent, TableColumn } from '../../../shared/components/table/table.component';
import { ClientService } from '../services/client.service';
import { Client } from '../models/client.model';

@Component({
  selector: 'app-client-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, NavbarComponent, CardComponent, TableComponent],
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
              <option [value]="null">Tous</option>
              <option [value]="true">Actifs</option>
              <option [value]="false">Inactifs</option>
            </select>
          </div>

          @if (loading()) {
            <div class="text-center py-12">
              <p class="text-gray-500">Chargement...</p>
            </div>
          } @else {
            <app-table [columns]="columns" [data]="clients()" [actions]="true">
              <ng-template #actions let-client>
                <div class="flex gap-2 justify-end">
                  <button
                    [routerLink]="['/clients', client.id]"
                    class="text-primary-600 hover:text-primary-900 font-medium">
                    Voir
                  </button>
                  <button
                    [routerLink]="['/clients', client.id, 'edit']"
                    class="text-yellow-600 hover:text-yellow-900 font-medium">
                    Modifier
                  </button>
                  <button
                    (click)="onDelete(client)"
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
export class ClientListComponent implements OnInit {
  private clientService = inject(ClientService);

  loading = signal(true);
  clients = signal<Client[]>([]);
  searchTerm = '';
  activeFilter: boolean | null = null;

  columns: TableColumn[] = [
    { key: 'nom', label: 'Nom', sortable: true },
    { key: 'prenom', label: 'Prénom', sortable: true },
    { key: 'email', label: 'Email' },
    { key: 'telephone', label: 'Téléphone' },
    { key: 'nombreComptes', label: 'Nb Comptes', type: 'number' },
    { key: 'createdAt', label: 'Date création', type: 'date' }
  ];

  ngOnInit(): void {
    this.loadClients();
  }

  loadClients(): void {
    this.loading.set(true);
    this.clientService.getAllClients(
      this.activeFilter ?? undefined,
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
    if (confirm(`Êtes-vous sûr de vouloir supprimer ${client.prenom} ${client.nom} ?`)) {
      this.clientService.deleteClient(client.id).subscribe({
        next: () => {
          this.loadClients();
        },
        error: (error) => {
          console.error('Erreur suppression client:', error);
          alert('Erreur lors de la suppression');
        }
      });
    }
  }
}
