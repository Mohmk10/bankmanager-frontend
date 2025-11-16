import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  type?: 'text' | 'number' | 'date' | 'badge' | 'currency';
}

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            @for (column of columns; track column.key) {
              <th scope="col"
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {{ column.label }}
              </th>
            }
            @if (actions) {
              <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            }
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          @for (row of data; track row.id) {
            <tr class="hover:bg-gray-50">
              @for (column of columns; track column.key) {
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  @switch (column.type) {
                    @case ('currency') {
                      {{ row[column.key] | number:'1.2-2' }} FCFA
                    }
                    @case ('date') {
                      {{ row[column.key] | date:'dd/MM/yyyy HH:mm' }}
                    }
                    @case ('badge') {
                      <span class="px-2 py-1 text-xs font-semibold rounded-full"
                            [ngClass]="getBadgeClass(row[column.key])">
                        {{ row[column.key] }}
                      </span>
                    }
                    @default {
                      {{ row[column.key] }}
                    }
                  }
                </td>
              }
              @if (actions) {
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <ng-content select="[actions]"></ng-content>
                </td>
              }
            </tr>
          }
        </tbody>
      </table>

      @if (!data || data.length === 0) {
        <div class="text-center py-12 text-gray-500">
          Aucune donnée disponible
        </div>
      }
    </div>
  `
})
export class TableComponent {
  @Input() columns: TableColumn[] = [];
  @Input() data: any[] = [];
  @Input() actions: boolean = false;

  getBadgeClass(value: string): string {
    const badgeClasses: Record<string, string> = {
      'COMPLETEE': 'bg-green-100 text-green-800',
      'EN_ATTENTE': 'bg-yellow-100 text-yellow-800',
      'ECHOUEE': 'bg-red-100 text-red-800',
      'ANNULEE': 'bg-gray-100 text-gray-800',
      'EPARGNE': 'bg-blue-100 text-blue-800',
      'CHEQUE': 'bg-purple-100 text-purple-800',
      'DEPOT': 'bg-green-100 text-green-800',
      'RETRAIT': 'bg-red-100 text-red-800'
    };
    return badgeClasses[value] || 'bg-gray-100 text-gray-800';
  }
}
