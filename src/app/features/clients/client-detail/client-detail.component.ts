import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { CardComponent } from '../../../shared/components/card/card.component';
import { ClientService } from '../services/client.service';
import { CompteService } from '../../comptes/services/compte.service';
import { Client } from '../models/client.model';
import { Compte } from '../../comptes/models/compte.model';

@Component({
  selector: 'app-client-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent, CardComponent],
  template: `
    <div class="min-h-screen bg-gray-50">
      <app-navbar></app-navbar>

      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        @if (loading()) {
          <div class="text-center py-12">
            <p class="text-gray-500">Chargement...</p>
          </div>
        } @else if (client()) {
          <div class="mb-6 flex justify-between items-center">
            <button
              routerLink="/clients"
              class="text-primary-600 hover:text-primary-900 font-medium">
              ← Retour à la liste
            </button>
            <button
              [routerLink]="['/clients', client()!.id, 'edit']"
              class="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-md text-sm font-medium">
              Modifier
            </button>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div class="lg:col-span-1">
              <app-card title="Informations du client">
                <div class="space-y-4">
                  <div>
                    <p class="text-sm font-medium text-gray-500">Nom complet</p>
                    <p class="text-lg font-semibold text-gray-900">
                      {{ client()!.prenom }} {{ client()!.nom }}
                    </p>
                  </div>

                  <div>
                    <p class="text-sm font-medium text-gray-500">Email</p>
                    <p class="text-gray-900">{{ client()!.email }}</p>
                  </div>

                  <div>
                    <p class="text-sm font-medium text-gray-500">Téléphone</p>
                    <p class="text-gray-900">{{ client()!.telephone }}</p>
                  </div>

                  <div>
                    <p class="text-sm font-medium text-gray-500">Adresse</p>
                    <p class="text-gray-900">{{ client()!.adresse }}</p>
                  </div>

                  <div>
                    <p class="text-sm font-medium text-gray-500">Statut</p>
                    <span class="px-2 py-1 text-xs font-semibold rounded-full"
                          [class]="client()!.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'">
                      {{ client()!.isActive ? 'Actif' : 'Inactif' }}
                    </span>
                  </div>

                  <div>
                    <p class="text-sm font-medium text-gray-500">Date de création</p>
                    <p class="text-gray-900">{{ client()!.createdAt | date:'dd/MM/yyyy HH:mm' }}</p>
                  </div>
                </div>
              </app-card>
            </div>

            <div class="lg:col-span-2">
              <app-card title="Comptes du client">
                @if (loadingComptes()) {
                  <p class="text-gray-500">Chargement des comptes...</p>
                } @else if (comptes() && comptes()!.length > 0) {
                  <div class="space-y-4">
                    @for (compte of comptes(); track compte.id) {
                      <div class="p-4 bg-gray-50 rounded-lg flex justify-between items-center">
                        <div>
                          <p class="font-semibold text-gray-900">{{ compte.numeroCompte }}</p>
                          <div class="flex gap-2 mt-1">
                            <span class="text-xs px-2 py-1 rounded-full"
                                  [class]="compte.typeCompte === 'EPARGNE' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'">
                              {{ compte.typeCompte }}
                            </span>
                            <span class="text-xs px-2 py-1 rounded-full"
                                  [class]="compte.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'">
                              {{ compte.isActive ? 'Actif' : 'Inactif' }}
                            </span>
                          </div>
                        </div>
                        <div class="text-right">
                          <p class="font-bold text-lg text-gray-900">
                            {{ compte.solde | number:'1.2-2' }} FCFA
                          </p>
                          <button
                            [routerLink]="['/comptes', compte.id]"
                            class="text-sm text-primary-600 hover:text-primary-900">
                            Voir détails →
                          </button>
                        </div>
                      </div>
                    }
                  </div>
                } @else {
                  <div class="text-center py-8">
                    <p class="text-gray-500 mb-4">Aucun compte pour ce client</p>
                    <button
                      routerLink="/comptes/new"
                      [queryParams]="{clientId: client()!.id}"
                      class="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md text-sm font-medium">
                      Créer un compte
                    </button>
                  </div>
                }
              </app-card>
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class ClientDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private clientService = inject(ClientService);
  private compteService = inject(CompteService);

  loading = signal(true);
  loadingComptes = signal(true);
  client = signal<Client | null>(null);
  comptes = signal<Compte[] | null>(null);

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    this.loadClient(id);
    this.loadComptes(id);
  }

  loadClient(id: string): void {
    this.clientService.getClientById(id).subscribe({
      next: (client) => {
        this.client.set(client);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Erreur chargement client:', error);
        this.loading.set(false);
      }
    });
  }

  loadComptes(clientId: string): void {
    this.compteService.getComptesByClient(clientId).subscribe({
      next: (comptes) => {
        this.comptes.set(comptes);
        this.loadingComptes.set(false);
      },
      error: (error) => {
        console.error('Erreur chargement comptes:', error);
        this.loadingComptes.set(false);
      }
    });
  }
}
