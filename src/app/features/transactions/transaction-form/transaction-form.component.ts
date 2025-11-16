import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { CardComponent } from '../../../shared/components/card/card.component';
import { TransactionService } from '../services/transaction.service';
import { CompteService } from '../../comptes/services/compte.service';
import { TypeTransaction } from '../models/transaction.model';
import { Compte } from '../../comptes/models/compte.model';

@Component({
  selector: 'app-transaction-form',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, NavbarComponent, CardComponent],
  template: `
    <div class="min-h-screen bg-gray-50">
      <app-navbar></app-navbar>

      <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="mb-6">
          <button
            routerLink="/transactions"
            class="text-primary-600 hover:text-primary-900 font-medium">
            ← Retour à la liste
          </button>
        </div>

        <app-card title="Nouvelle transaction">
          @if (successMessage()) {
            <div class="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
              {{ successMessage() }}
            </div>
          }

          @if (errorMessage()) {
            <div class="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {{ errorMessage() }}
            </div>
          }

          <form [formGroup]="transactionForm" (ngSubmit)="onSubmit()">
            <div class="space-y-6">
              <div>
                <label for="compteId" class="block text-sm font-medium text-gray-700 mb-1">
                  Compte *
                </label>
                <select
                  id="compteId"
                  formControlName="compteId"
                  (change)="onCompteChange()"
                  class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500">
                  <option value="">Sélectionner un compte</option>
                  @for (compte of comptes(); track compte.id) {
                    <option [value]="compte.id">
                      {{ compte.numeroCompte }} - {{ compte.clientNomComplet }}
                      ({{ compte.solde | number:'1.2-2' }} FCFA)
                    </option>
                  }
                </select>
                @if (transactionForm.get('compteId')?.invalid && transactionForm.get('compteId')?.touched) {
                  <p class="mt-1 text-sm text-red-600">Le compte est requis</p>
                }
              </div>

              @if (selectedCompte()) {
                <div class="p-4 bg-gray-50 rounded-lg">
                  <h3 class="text-sm font-semibold text-gray-900 mb-2">Informations du compte</h3>
                  <div class="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p class="text-gray-500">Client</p>
                      <p class="font-medium text-gray-900">{{ selectedCompte()!.clientNomComplet }}</p>
                    </div>
                    <div>
                      <p class="text-gray-500">Type</p>
                      <span class="px-2 py-1 text-xs font-semibold rounded-full"
                            [class]="selectedCompte()!.typeCompte === 'EPARGNE' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'">
                        {{ selectedCompte()!.typeCompte }}
                      </span>
                    </div>
                    <div>
                      <p class="text-gray-500">Solde actuel</p>
                      <p class="font-bold text-lg text-primary-600">
                        {{ selectedCompte()!.solde | number:'1.2-2' }} FCFA
                      </p>
                    </div>
                    @if (selectedCompte()!.typeCompte === 'CHEQUE') {
                      <div>
                        <p class="text-gray-500">Taux de frais</p>
                        <p class="font-medium text-gray-900">0.8%</p>
                      </div>
                    }
                  </div>
                </div>
              }

              <div>
                <label for="type" class="block text-sm font-medium text-gray-700 mb-1">
                  Type de transaction *
                </label>
                <select
                  id="type"
                  formControlName="type"
                  (change)="onTypeChange()"
                  class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500">
                  <option value="">Sélectionner un type</option>
                  <option [value]="TypeTransaction.DEPOT">Dépôt</option>
                  <option [value]="TypeTransaction.RETRAIT">Retrait</option>
                </select>
                @if (transactionForm.get('type')?.invalid && transactionForm.get('type')?.touched) {
                  <p class="mt-1 text-sm text-red-600">Le type est requis</p>
                }
              </div>

              <div>
                <label for="montant" class="block text-sm font-medium text-gray-700 mb-1">
                  Montant (FCFA) *
                </label>
                <input
                  id="montant"
                  type="number"
                  formControlName="montant"
                  (input)="calculatePreview()"
                  min="1"
                  step="0.01"
                  class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="25000">
                @if (transactionForm.get('montant')?.invalid && transactionForm.get('montant')?.touched) {
                  <p class="mt-1 text-sm text-red-600">Le montant doit être supérieur à 0</p>
                }
              </div>

              <div>
                <label for="description" class="block text-sm font-medium text-gray-700 mb-1">
                  Description (optionnel)
                </label>
                <textarea
                  id="description"
                  formControlName="description"
                  rows="3"
                  class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Description de la transaction..."></textarea>
              </div>

              @if (preview()) {
                <div class="p-4 rounded-lg border-2"
                     [class]="preview()!.type === 'DEPOT' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'">
                  <h3 class="text-sm font-semibold mb-3"
                      [class]="preview()!.type === 'DEPOT' ? 'text-green-900' : 'text-red-900'">
                    Aperçu de la transaction
                  </h3>
                  <div class="space-y-2 text-sm">
                    <div class="flex justify-between">
                      <span class="text-gray-600">Type:</span>
                      <span class="font-semibold"
                            [class]="preview()!.type === 'DEPOT' ? 'text-green-900' : 'text-red-900'">
                        {{ preview()!.type }}
                      </span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-gray-600">Montant:</span>
                      <span class="font-semibold text-gray-900">
                        {{ preview()!.montant | number:'1.2-2' }} FCFA
                      </span>
                    </div>
                    @if (preview()!.frais > 0) {
                      <div class="flex justify-between">
                        <span class="text-gray-600">Frais (0.8%):</span>
                        <span class="font-semibold text-yellow-600">
                          {{ preview()!.frais | number:'1.2-2' }} FCFA
                        </span>
                      </div>
                    }
                    <div class="flex justify-between pt-2 border-t border-gray-300">
                      <span class="text-gray-600">Solde actuel:</span>
                      <span class="font-semibold text-gray-900">
                        {{ preview()!.soldeActuel | number:'1.2-2' }} FCFA
                      </span>
                    </div>
                    <div class="flex justify-between font-bold text-base">
                      <span [class]="preview()!.type === 'DEPOT' ? 'text-green-900' : 'text-red-900'">
                        Nouveau solde:
                      </span>
                      <span [class]="preview()!.type === 'DEPOT' ? 'text-green-900' : 'text-red-900'">
                        {{ preview()!.nouveauSolde | number:'1.2-2' }} FCFA
                      </span>
                    </div>
                  </div>
                </div>
              }
            </div>

            <div class="mt-6 flex gap-4">
              <button
                type="submit"
                [disabled]="transactionForm.invalid || loading()"
                class="flex-1 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed">
                @if (loading()) {
                  <span>Traitement...</span>
                } @else {
                  <span>Effectuer la transaction</span>
                }
              </button>
              <button
                type="button"
                (click)="onCancel()"
                class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
                Annuler
              </button>
            </div>
          </form>
        </app-card>
      </div>
    </div>
  `
})
export class TransactionFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private transactionService = inject(TransactionService);
  private compteService = inject(CompteService);

  loading = signal(false);
  errorMessage = signal('');
  successMessage = signal('');
  comptes = signal<Compte[]>([]);
  selectedCompte = signal<Compte | null>(null);
  preview = signal<{
    type: string;
    montant: number;
    frais: number;
    soldeActuel: number;
    nouveauSolde: number;
  } | null>(null);

  TypeTransaction = TypeTransaction;

  transactionForm: FormGroup = this.fb.group({
    compteId: ['', [Validators.required]],
    type: ['', [Validators.required]],
    montant: [0, [Validators.required, Validators.min(1)]],
    description: ['']
  });

  ngOnInit(): void {
    this.loadComptes();

    const compteId = this.route.snapshot.queryParams['compteId'];
    if (compteId) {
      this.transactionForm.patchValue({ compteId });
      this.onCompteChange();
    }
  }

  loadComptes(): void {
    this.compteService.getAllComptes(true).subscribe({
      next: (comptes) => {
        this.comptes.set(comptes);
      },
      error: (error) => {
        console.error('Erreur chargement comptes:', error);
      }
    });
  }

  onCompteChange(): void {
    const compteId = this.transactionForm.get('compteId')?.value;
    if (compteId) {
      this.compteService.getCompteById(compteId).subscribe({
        next: (compte) => {
          this.selectedCompte.set(compte);
          this.calculatePreview();
        },
        error: (error) => {
          console.error('Erreur chargement compte:', error);
        }
      });
    } else {
      this.selectedCompte.set(null);
      this.preview.set(null);
    }
  }

  onTypeChange(): void {
    this.calculatePreview();
  }

  calculatePreview(): void {
    const compte = this.selectedCompte();
    const type = this.transactionForm.get('type')?.value;
    const montant = Number(this.transactionForm.get('montant')?.value) || 0;

    if (!compte || !type || montant <= 0) {
      this.preview.set(null);
      return;
    }

    let frais = 0;
    if (type === TypeTransaction.RETRAIT && compte.typeCompte === 'CHEQUE') {
      frais = montant * 0.008;
    }

    const nouveauSolde = type === TypeTransaction.DEPOT
      ? compte.solde + montant
      : compte.solde - montant - frais;

    this.preview.set({
      type,
      montant,
      frais,
      soldeActuel: compte.solde,
      nouveauSolde
    });
  }

  onSubmit(): void {
    if (this.transactionForm.valid) {
      this.loading.set(true);
      this.errorMessage.set('');
      this.successMessage.set('');

      const request = {
        compteId: this.transactionForm.value.compteId,
        type: this.transactionForm.value.type,
        montant: Number(this.transactionForm.value.montant),
        description: this.transactionForm.value.description || undefined
      };

      this.transactionService.createTransaction(request).subscribe({
        next: (transaction) => {
          this.loading.set(false);
          this.successMessage.set('Transaction effectuée avec succès !');
          this.transactionForm.reset();
          this.selectedCompte.set(null);
          this.preview.set(null);

          setTimeout(() => {
            this.router.navigate(['/comptes', transaction.compteId]);
          }, 2000);
        },
        error: (error) => {
          this.loading.set(false);
          this.errorMessage.set(error.error?.message || 'Erreur lors de la transaction');
        }
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/transactions']);
  }
}
