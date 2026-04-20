import { Component } from '@angular/core';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  template: `
    <div class="flex justify-center items-center py-20">
      <div class="w-7 h-7 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin"></div>
    </div>
  `,
})
export class LoadingSpinnerComponent {}
