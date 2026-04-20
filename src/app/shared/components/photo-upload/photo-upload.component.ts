import {
  Component, Input, Output, EventEmitter,
  HostListener, ElementRef, ViewChild, inject
} from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-photo-upload',
  standalone: true,
  template: `
    <div class="space-y-3">

      <!-- Zone drag & drop -->
      <div
        (click)="fileInput.click()"
        (dragover)="onDragOver($event)"
        (dragleave)="onDragLeave($event)"
        (drop)="onDrop($event)"
        [class.border-gray-900]="isDragging"
        [class.bg-gray-50]="isDragging"
        class="relative cursor-pointer border-2 border-dashed border-gray-200 rounded-2xl transition-all hover:border-gray-400 hover:bg-gray-50 overflow-hidden"
      >
        <!-- Preview existante -->
        @if (previewUrl || currentPhotoUrl) {
          <div class="relative group">
            <img [src]="previewUrl || currentPhotoUrl" alt="Aperçu"
                 class="w-full h-52 object-cover">
            <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span class="text-white text-sm font-semibold bg-black/50 px-3 py-1.5 rounded-full">
                Changer la photo
              </span>
            </div>
          </div>
        } @else {
          <!-- Placeholder -->
          <div class="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div class="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mb-3">
              <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                      d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <p class="text-sm font-medium text-gray-700">
              @if (isDragging) { Dépose ici } @else { Glisse une photo ou clique }
            </p>
            <p class="text-xs text-gray-400 mt-1">JPG, PNG, WEBP · max 10 Mo</p>
          </div>
        }
      </div>

      <!-- Barre de progression -->
      @if (uploading) {
        <div class="space-y-1">
          <div class="flex justify-between text-xs text-gray-500">
            <span>Upload en cours...</span>
            <span>{{ progress }}%</span>
          </div>
          <div class="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div class="h-full bg-gray-900 rounded-full transition-all duration-300"
                 [style.width.%]="progress"></div>
          </div>
        </div>
      }

      <!-- Erreur -->
      @if (error) {
        <p class="text-xs text-red-500 flex items-center gap-1">
          <span>⚠</span> {{ error }}
        </p>
      }

      <!-- Actions si photo présente -->
      @if (previewUrl || currentPhotoUrl) {
        <div class="flex gap-2">
          <button type="button" (click)="fileInput.click()"
                  class="flex-1 py-2 text-xs font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-all">
            Changer
          </button>
          <button type="button" (click)="remove()"
                  class="flex-1 py-2 text-xs font-medium text-red-500 bg-red-50 border border-red-100 rounded-lg hover:bg-red-100 transition-all">
            Supprimer
          </button>
        </div>
      }

      <!-- Input caché -->
      <input #fileInput type="file" accept="image/*" class="hidden"
             (change)="onFileSelected($event)">
    </div>
  `,
})
export class PhotoUploadComponent {
  @Input() currentPhotoUrl: string | null | undefined = null;
  @Input() uploading = false;
  @Input() progress = 0;

  @Output() fileSelected = new EventEmitter<File>();
  @Output() removePhoto  = new EventEmitter<void>();

  private sanitizer = inject(DomSanitizer);

  previewUrl: SafeUrl | null = null;
  isDragging = false;
  error = '';

  onDragOver(e: DragEvent): void {
    e.preventDefault();
    this.isDragging = true;
  }

  onDragLeave(e: DragEvent): void {
    e.preventDefault();
    this.isDragging = false;
  }

  onDrop(e: DragEvent): void {
    e.preventDefault();
    this.isDragging = false;
    const file = e.dataTransfer?.files[0];
    if (file) this.processFile(file);
  }

  onFileSelected(e: Event): void {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) this.processFile(file);
    (e.target as HTMLInputElement).value = '';
  }

  private processFile(file: File): void {
    this.error = '';
    if (!file.type.startsWith('image/')) {
      this.error = 'Fichier non supporté. JPG, PNG ou WEBP uniquement.';
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      this.error = 'Fichier trop lourd (max 10 Mo).';
      return;
    }
    const url = URL.createObjectURL(file);
    this.previewUrl = this.sanitizer.bypassSecurityTrustUrl(url);
    this.fileSelected.emit(file);
  }

  remove(): void {
    this.previewUrl = null;
    this.removePhoto.emit();
  }

  clearPreview(): void {
    this.previewUrl = null;
  }
}
