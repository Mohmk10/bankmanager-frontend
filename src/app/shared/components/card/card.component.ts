import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [class]="'bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden ' + customClass">
      @if (title) {
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-semibold text-gray-900">{{ title }}</h3>
        </div>
      }
      <div [class]="'p-6 ' + bodyClass">
        <ng-content></ng-content>
      </div>
    </div>
  `
})
export class CardComponent {
  @Input() title?: string;
  @Input() customClass: string = '';
  @Input() bodyClass: string = '';
}
