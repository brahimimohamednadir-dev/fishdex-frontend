import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { Capture } from '../../../core/models/capture.model';

@Component({
  selector: 'app-capture-card',
  standalone: true,
  imports: [RouterLink, DatePipe],
  template: `
    <a [routerLink]="['/captures', capture.id]"
       class="group block bg-white border border-gray-100 rounded-2xl overflow-hidden hover:border-gray-200 hover:shadow-md transition-all duration-200">
      <div class="aspect-[4/3] bg-gray-50 overflow-hidden">
        @if (capture.photoUrl) {
          <img [src]="capture.photoUrl" [alt]="capture.speciesName"
               class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">
        } @else {
          <div class="w-full h-full flex flex-col items-center justify-center gap-1">
            <span class="text-3xl opacity-40">🐟</span>
            <span class="text-xs text-gray-300 font-medium">Pas de photo</span>
          </div>
        }
      </div>
      <div class="p-4">
        <p class="font-semibold text-sm text-gray-900 truncate">{{ capture.speciesName }}</p>
        <div class="flex items-center gap-3 mt-2">
          <span class="text-xs text-gray-500 font-medium">{{ capture.weight }} kg</span>
          <span class="w-1 h-1 rounded-full bg-gray-300"></span>
          <span class="text-xs text-gray-500 font-medium">{{ capture.length }} cm</span>
        </div>
        <p class="text-xs text-gray-400 mt-1.5">{{ capture.caughtAt | date:'d MMM yyyy' }}</p>
      </div>
    </a>
  `,
})
export class CaptureCardComponent {
  @Input({ required: true }) capture!: Capture;
}
