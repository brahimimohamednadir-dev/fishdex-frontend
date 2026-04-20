import { Component, inject } from '@angular/core';
import { ToastService, Toast } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  template: `
    <div class="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2.5 pointer-events-none"
         aria-live="polite">
      @for (toast of toastService.toasts(); track toast.id) {
        <div
          class="pointer-events-auto flex items-start gap-3 px-4 py-3.5 rounded-xl shadow-lg border text-sm font-medium max-w-xs min-w-[260px] animate-slide-in"
          [class]="toastClasses(toast)">

          <!-- Icon -->
          <span class="text-base mt-0.5 shrink-0">
            @switch (toast.type) {
              @case ('success') { ✓ }
              @case ('error')   { ✕ }
              @case ('info')    { ℹ }
            }
          </span>

          <!-- Message -->
          <span class="flex-1 leading-snug">{{ toast.message }}</span>

          <!-- Close -->
          <button (click)="toastService.dismiss(toast.id)"
                  class="shrink-0 opacity-50 hover:opacity-100 transition-opacity text-base leading-none">
            ×
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    @keyframes slide-in {
      from { opacity: 0; transform: translateX(24px) scale(0.97); }
      to   { opacity: 1; transform: translateX(0)    scale(1); }
    }
    .animate-slide-in { animation: slide-in 0.22s cubic-bezier(0.16,1,0.3,1) both; }
  `],
})
export class ToastComponent {
  toastService = inject(ToastService);

  toastClasses(toast: Toast): string {
    switch (toast.type) {
      case 'success': return 'bg-white text-gray-900 border-green-200';
      case 'error':   return 'bg-white text-gray-900 border-red-200';
      case 'info':    return 'bg-white text-gray-900 border-blue-200';
    }
  }
}
