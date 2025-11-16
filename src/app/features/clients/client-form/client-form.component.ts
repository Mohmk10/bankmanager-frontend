import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { CardComponent } from '../../../shared/components/card/card.component';
import { ClientService } from '../services/client.service';
import { Client } from '../models/client.model';

@Component({
  selector: 'app-client-form',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, NavbarComponent, CardComponent],
  template: `
    <div class="min-h-screen bg-gray-50">
      <app-navbar></app-navbar>

      <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="mb-6">
          <button
            routerLink="/clients"
            class="text-primary-600 hover:text-primary-900 font-medium">
            ← Retour à la liste
          </button>
        </div>

        <app-card [title]="isEditMode() ? 'Modifier le client' : 'Nouveau client'">
          @if (errorMessage()) {
            <div class="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {{ errorMessage() }}
            </div>
          }

          <form [formGroup]="clientForm" (ngSubmit)="onSubmit()">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label for="nom" class="block text-sm font-medium text-gray-700 mb-1">
                  Nom *
                </label>
                <input
                  id="nom"
                  type="text"
                  formControlName="nom"
                  class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Dupont">
                @if (clientForm.get('nom')?.invalid && clientForm.get('nom')?.touched) {
                  <p class="mt-1 text-sm text-red-600">Le nom est requis</p>
                }
              </div>

              <div>
                <label for="prenom" class="block text-sm font-medium text-gray-700 mb-1">
                  Prénom *
                </label>
                <input
                  id="prenom"
                  type="text"
                  formControlName="prenom"
                  class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Jean">
                @if (clientForm.get('prenom')?.invalid && clientForm.get('prenom')?.touched) {
                  <p class="mt-1 text-sm text-red-600">Le prénom est requis</p>
                }
              </div>

              <div>
                <label for="email" class="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  id="email"
                  type="email"
                  formControlName="email"
                  class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="jean.dupont@example.com">
                @if (clientForm.get('email')?.invalid && clientForm.get('email')?.touched) {
                  <p class="mt-1 text-sm text-red-600">Email invalide</p>
                }
              </div>

              <div>
                <label for="telephone" class="block text-sm font-medium text-gray-700 mb-1">
                  Téléphone *
                </label>
                <input
                  id="telephone"
                  type="tel"
                  formControlName="telephone"
                  class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="+221 77 123 45 67">
                @if (clientForm.get('telephone')?.invalid && clientForm.get('telephone')?.touched) {
                  <p class="mt-1 text-sm text-red-600">Le téléphone est requis</p>
                }
              </div>
            </div>

            <div class="mt-6">
              <label for="adresse" class="block text-sm font-medium text-gray-700 mb-1">
                Adresse *
              </label>
              <textarea
                id="adresse"
                formControlName="adresse"
                rows="3"
                class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="123 Rue de la Paix, Dakar"></textarea>
              @if (clientForm.get('adresse')?.invalid && clientForm.get('adresse')?.touched) {
                <p class="mt-1 text-sm text-red-600">L'adresse est requise</p>
              }
            </div>

            <div class="mt-6 flex gap-4">
              <button
                type="submit"
                [disabled]="clientForm.invalid || loading()"
                class="flex-1 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed">
                @if (loading()) {
                  <span>{{ isEditMode() ? 'Modification...' : 'Création...' }}</span>
                } @else {
                  <span>{{ isEditMode() ? 'Modifier' : 'Créer' }}</span>
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
export class ClientFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private clientService = inject(ClientService);

  loading = signal(false);
  errorMessage = signal('');
  isEditMode = signal(false);
  clientId?: string;

  clientForm: FormGroup = this.fb.group({
    nom: ['', [Validators.required]],
    prenom: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    telephone: ['', [Validators.required]],
    adresse: ['', [Validators.required]]
  });

  ngOnInit(): void {
    this.clientId = this.route.snapshot.params['id'];
    if (this.clientId) {
      this.isEditMode.set(true);
      this.loadClient(this.clientId);
    }
  }

  loadClient(id: string): void {
    this.clientService.getClientById(id).subscribe({
      next: (client) => {
        this.clientForm.patchValue({
          nom: client.nom,
          prenom: client.prenom,
          email: client.email,
          telephone: client.telephone,
          adresse: client.adresse
        });
      },
      error: (error) => {
        console.error('Erreur chargement client:', error);
        this.errorMessage.set('Erreur lors du chargement du client');
      }
    });
  }

  onSubmit(): void {
    if (this.clientForm.valid) {
      this.loading.set(true);
      this.errorMessage.set('');

      const request$ = this.isEditMode()
        ? this.clientService.updateClient(this.clientId!, this.clientForm.value)
        : this.clientService.createClient(this.clientForm.value);

      request$.subscribe({
        next: () => {
          this.loading.set(false);
          this.router.navigate(['/clients']);
        },
        error: (error) => {
          this.loading.set(false);
          this.errorMessage.set(error.error?.message || 'Erreur lors de la sauvegarde');
        }
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/clients']);
  }
}
