import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { CardComponent } from '../../../shared/components/card/card.component';
import { CompteService } from '../services/compte.service';
import { ClientService } from '../../clients/services/client.service';
import { TypeCompte } from '../models/compte.model';
import { Client } from '../../clients/models/client.model';

@Component({
  selector: 'app-compte-form',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, NavbarComponent, CardComponent],
  template: `
    <div class="min-h-screen bg-gray-50">
      <app-navbar></app-navbar>

      <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="mb-6">
          <button
            routerLink="/comptes"
            class="text-primary-600 hover:text-primary-900 font-medium">
            ← Retour à la liste
          </button>
        </div>

        <app-card title="Nouveau compte">
          @if (errorMessage()) {
            <div class="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {{ errorMessage() }}
            </div>
          }

          <form [formGroup]="compteForm" (ngSubmit)="onSubmit()">
            <div class="space-y-6">
              <div>
                <label for="clientId" class="block text-sm font-medium text-gray-700 mb-1">
                  Client *
                </label>
                <select
                  id="clientId"
                  formControlName="clientId"
                  class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500">
                  <option value="">Sélectionner un client</option>
                  @for (client of clients(); track client.id) {
                    <option [value]="client.id">{{ client.prenom }} {{ client.nom }}</option>
                  }
                </select>
                @if (compteForm.get('clientId')?.invalid && compteForm.get('clientId')?.touched) {
                  <p class="mt-1 text-sm text-red-600">Le client est requis</p>
                }
              </div>

              <div>
                <label for="typeCompte" class="block text-sm font-medium text-gray-700 mb-1">
                  Type de compte *
                </label>
                <select
                  id="typeCompte"
                  formControlName="typeCompte"
                  (change)="onTypeCompteChange()"
                  class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500">
                  <option value="">Sélectionner un type</option>
                  <option [value]="TypeCompte.EPARGNE">Compte Épargne</option>
                  <option [value]="TypeCompte.CHEQUE">Compte Chèque</option>
                </select>
                @if (compteForm.get('typeCompte')?.invalid && compteForm.get('typeCompte')?.touched) {
                  <p class="mt-1 text-sm text-red-600">Le type de compte est requis</p>
                }
              </div>

              <div>
                <label for="soldeInitial" class="block text-sm font-medium text-gray-700 mb-1">
                  Solde initial (FCFA) *
                </label>
                <input
                  id="soldeInitial"
                  type="number"
                  formControlName="soldeInitial"
                  min="1"
                  step="0.01"
                  class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="50000">
                @if (compteForm.get('soldeInitial')?.invalid && compteForm.get('soldeInitial')?.touched) {
                  <p class="mt-1 text-sm text-red-600">Le solde initial doit être supérieur à 0</p>
                }
              </div>

              @if (isEpargne()) {
                <div class="p-4 bg-blue-50 border border-blue-200 rounded-md">
                  <h3 class="text-sm font-semibold text-blue-900 mb-3">Options Compte Épargne</h3>

                  <div>
                    <label for="dateDeblocage" class="block text-sm font-medium text-blue-900 mb-1">
                      Date de déblocage *
                    </label>
                    <input
                      id="dateDeblocage"
                      type="date"
                      formControlName="dateDeblocage"
                      class="w-full px-4 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                    @if (compteForm.get('dateDeblocage')?.invalid && compteForm.get('dateDeblocage')?.touched) {
                      <p class="mt-1 text-sm text-red-600">La date de déblocage est requise</p>
                    }
                    <p class="mt-1 text-xs text-blue-700">
                      Les retraits ne seront pas possibles avant cette date
                    </p>
                  </div>
                </div>
              }

              @if (isCheque()) {
                <div class="p-4 bg-purple-50 border border-purple-200 rounded-md">
                  <h3 class="text-sm font-semibold text-purple-900 mb-2">Compte Chèque</h3>
                  <p class="text-sm text-purple-700">
                    Frais de 0.8% appliqués sur chaque retrait
                  </p>
                </div>
              }
            </div>

            <div class="mt-6 flex gap-4">
              <button
                type="submit"
                [disabled]="compteForm.invalid || loading()"
                class="flex-1 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed">
                @if (loading()) {
                  <span>Création...</span>
                } @else {
                  <span>Créer le compte</span>
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
export class CompteFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private compteService = inject(CompteService);
  private clientService = inject(ClientService);

  loading = signal(false);
  errorMessage = signal('');
  clients = signal<Client[]>([]);
  isEpargne = signal(false);
  isCheque = signal(false);

  TypeCompte = TypeCompte;

  compteForm: FormGroup = this.fb.group({
    clientId: ['', [Validators.required]],
    typeCompte: ['', [Validators.required]],
    soldeInitial: [0, [Validators.required, Validators.min(1)]],
    dateDeblocage: ['']
  });

  ngOnInit(): void {
    this.loadClients();

    const clientId = this.route.snapshot.queryParams['clientId'];
    if (clientId) {
      this.compteForm.patchValue({ clientId });
    }
  }

  loadClients(): void {
    this.clientService.getAllClients(true).subscribe({
      next: (clients) => {
        this.clients.set(clients);
      },
      error: (error) => {
        console.error('Erreur chargement clients:', error);
      }
    });
  }

  onTypeCompteChange(): void {
    const type = this.compteForm.get('typeCompte')?.value;
    this.isEpargne.set(type === TypeCompte.EPARGNE);
    this.isCheque.set(type === TypeCompte.CHEQUE);

    if (type === TypeCompte.EPARGNE) {
      this.compteForm.get('dateDeblocage')?.setValidators([Validators.required]);
    } else {
      this.compteForm.get('dateDeblocage')?.clearValidators();
      this.compteForm.patchValue({ dateDeblocage: '' });
    }
    this.compteForm.get('dateDeblocage')?.updateValueAndValidity();
  }

  onSubmit(): void {
    if (this.compteForm.valid) {
      this.loading.set(true);
      this.errorMessage.set('');

      const formValue = this.compteForm.value;
      const request = {
        clientId: formValue.clientId,
        typeCompte: formValue.typeCompte,
        soldeInitial: Number(formValue.soldeInitial),
        ...(formValue.typeCompte === TypeCompte.EPARGNE && { dateDeblocage: formValue.dateDeblocage })
      };

      this.compteService.createCompte(request).subscribe({
        next: (compte) => {
          this.loading.set(false);
          this.router.navigate(['/comptes', compte.id]);
        },
        error: (error) => {
          this.loading.set(false);
          this.errorMessage.set(error.error?.message || 'Erreur lors de la création du compte');
        }
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/comptes']);
  }
}
