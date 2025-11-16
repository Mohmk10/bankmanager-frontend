import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { CardComponent } from '../../../shared/components/card/card.component';
import { CompteService } from '../services/compte.service';
import { TransactionService } from '../../transactions/services/transaction.service';
import { CompteDetails } from '../models/compte.model';
import { Transaction } from '../../transactions/models/transaction.model';

@Component({
  selector: 'app-compte-detail',
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
        } @else if (compteDetails()) {
          <div class="mb-6 flex justify-between items-center">
            <button
              routerLink="/comptes"
              class="text-primary-600 hover:text-primary-900 font-medium">
              ← Retour à la liste
            </button>
            <div class="flex gap-4">
              <button
                [routerLink]="['/transactions/new']"
                [queryParams]="{compteId: compteDetails()!.compte.id}"
                class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium">
                Nouvelle Transaction
              </button>
              <button
                [routerLink]="['/clients', compteDetails()!.compte.clientId]"
                class="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md text-sm font-medium">
                Voir le Client
              </button>
            </div>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <app-card>
              <div class="text-center">
                <p class="text-sm font-medium text-gray-500 mb-2">Solde Actuel</p>
                <p class="text-3xl font-bold text-primary-600">
                  {{ compteDetails()!.compte.solde | number:'1.2-2' }} FCFA
                </p>
              </div>
            </app-card>

            <app-card>
              <div class="text-center">
                <p class="text-sm font-medium text-gray-500 mb-2">Total Dépôts</p>
                <p class="text-3xl font-bold text-green-600">
                  {{ compteDetails()!.totalDepots | number:'1.2-2' }} FCFA
                </p>
              </div>
            </app-card>

            <app-card>
              <div class="text-center">
                <p class="text-sm font-medium text-gray-500 mb-2">Total Retraits</p>
                <p class="text-3xl font-bold text-red-600">
                  {{ compteDetails()!.totalRetraits | number:'1.2-2' }} FCFA
                </p>
              </div>
            </app-card>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div class="lg:col-span-1">
              <app-card title="Informations du compte">
                <div class="space-y-4">
                  <div>
                    <p class="text-sm font-medium text-gray-500">Numéro de compte</p>
                    <p class="text-lg font-semibold text-gray-900">
                      {{ compteDetails()!.compte.numeroCompte }}
                    </p>
                  </div>

                  <div>
                    <p class="text-sm font-medium text-gray-500">Client</p>
                    <p class="text-gray-900">{{ compteDetails()!.compte.clientNomComplet }}</p>
                  </div>

                  <div>
                    <p class="text-sm font-medium text-gray-500">Type de compte</p>
                    <span class="px-2 py-1 text-xs font-semibold rounded-full"
                          [class]="compteDetails()!.compte.typeCompte === 'EPARGNE' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'">
                      {{ compteDetails()!.compte.typeCompte }}
                    </span>
                  </div>

                  @if (compteDetails()!.compte.typeCompte === 'EPARGNE' && compteDetails()!.compte.dateDeblocage) {
                    <div>
                      <p class="text-sm font-medium text-gray-500">Date de déblocage</p>
                      <p class="text-gray-900">{{ compteDetails()!.compte.dateDeblocage | date:'dd/MM/yyyy' }}</p>
                    </div>
                  }

                  @if (compteDetails()!.compte.typeCompte === 'CHEQUE' && compteDetails()!.compte.tauxFrais) {
                    <div>
                      <p class="text-sm font-medium text-gray-500">Taux de frais</p>
                      <p class="text-gray-900">{{ (compteDetails()!.compte.tauxFrais ?? 0) * 100 }}%</p>
                    </div>
                  }

                  <div>
                    <p class="text-sm font-medium text-gray-500">Statut</p>
                    <span class="px-2 py-1 text-xs font-semibold rounded-full"
                          [class]="compteDetails()!.compte.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'">
                      {{ compteDetails()!.compte.isActive ? 'Actif' : 'Inactif' }}
                    </span>
                  </div>

                  <div>
                    <p class="text-sm font-medium text-gray-500">Nombre de transactions</p>
                    <p class="text-gray-900">{{ compteDetails()!.nombreTransactions }}</p>
                  </div>

                  <div>
                    <p class="text-sm font-medium text-gray-500">Date de création</p>
                    <p class="text-gray-900">{{ compteDetails()!.compte.createdAt | date:'dd/MM/yyyy HH:mm' }}</p>
                  </div>
                </div>
              </app-card>
            </div>

            <div class="lg:col-span-2">
              <app-card title="Historique des transactions">
                @if (loadingTransactions()) {
                  <p class="text-gray-500">Chargement des transactions...</p>
                } @else if (transactions() && transactions()!.length > 0) {
                  <div class="space-y-3">
                    @for (transaction of transactions(); track transaction.id) {
                      <div class="p-4 bg-gray-50 rounded-lg">
                        <div class="flex justify-between items-start mb-2">
                          <div>
                            <p class="font-semibold text-gray-900">{{ transaction.idTransaction }}</p>
                            <p class="text-sm text-gray-500">
                              {{ transaction.dateTransaction | date:'dd/MM/yyyy HH:mm' }}
                            </p>
                          </div>
                          <div class="text-right">
                            <p class="font-bold text-lg"
                               [class]="transaction.type === 'DEPOT' ? 'text-green-600' : 'text-red-600'">
                              {{ transaction.type === 'DEPOT' ? '+' : '-' }}{{ transaction.montant | number:'1.2-2' }} FCFA
                            </p>
                            @if (transaction.frais > 0) {
                              <p class="text-xs text-gray-500">Frais: {{ transaction.frais | number:'1.2-2' }} FCFA</p>
                            }
                          </div>
                        </div>

                        <div class="flex justify-between items-center">
                          <span class="text-xs px-2 py-1 rounded-full"
                                [class]="transaction.type === 'DEPOT' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'">
                            {{ transaction.type }}
                          </span>
                          <p class="text-sm text-gray-600">
                            Solde après: <span class="font-semibold">{{ transaction.soldeApres | number:'1.2-2' }} FCFA</span>
                          </p>
                        </div>

                        @if (transaction.description) {
                          <p class="mt-2 text-sm text-gray-600">{{ transaction.description }}</p>
                        }
                      </div>
                    }
                  </div>
                } @else {
                  <div class="text-center py-8">
                    <p class="text-gray-500 mb-4">Aucune transaction pour ce compte</p>
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
export class CompteDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private compteService = inject(CompteService);
  private transactionService = inject(TransactionService);

  loading = signal(true);
  loadingTransactions = signal(true);
  compteDetails = signal<CompteDetails | null>(null);
  transactions = signal<Transaction[] | null>(null);

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    this.loadCompteDetails(id);
    this.loadTransactions(id);
  }

  loadCompteDetails(id: string): void {
    this.compteService.getCompteDetails(id).subscribe({
      next: (details) => {
        this.compteDetails.set(details);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Erreur chargement détails compte:', error);
        this.loading.set(false);
      }
    });
  }

  loadTransactions(compteId: string): void {
    this.transactionService.getTransactionsByCompte(compteId).subscribe({
      next: (transactions) => {
        this.transactions.set(transactions);
        this.loadingTransactions.set(false);
      },
      error: (error) => {
        console.error('Erreur chargement transactions:', error);
        this.loadingTransactions.set(false);
      }
    });
  }
}
