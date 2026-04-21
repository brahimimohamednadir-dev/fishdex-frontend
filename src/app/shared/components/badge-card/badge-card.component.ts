import { Component, Input } from '@angular/core';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-badge-card',
  standalone: true,
  imports: [DatePipe],
  template: `
    <div class="bg-white border rounded-2xl p-4 text-center transition-all duration-200"
         [class.border-warm-200]="earned"
         [class.shadow-sm]="earned"
         [class.border-warm-100]="!earned"
         [class.opacity-40]="!earned">
      <div class="text-3xl mb-3">{{ icon }}</div>
      <p class="text-xs font-semibold text-warm-900 leading-tight">{{ label }}</p>
      @if (earned && earnedAt) {
        <p class="text-xs text-forest-600 font-medium mt-1.5">{{ earnedAt | date:'d MMM yyyy' }}</p>
      } @else {
        <p class="text-xs text-warm-400 mt-1.5">Non obtenu</p>
      }
    </div>
  `,
})
export class BadgeCardComponent {
  @Input({ required: true }) label!: string;
  @Input({ required: true }) icon!: string;
  @Input() earned = false;
  @Input() earnedAt: string | null = null;
}
