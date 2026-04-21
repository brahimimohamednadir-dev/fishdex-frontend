import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DatePipe, DecimalPipe } from '@angular/common';
import { CaptureService } from '../../../core/services/capture.service';
import { Capture } from '../../../core/models/capture.model';
import { ToastService } from '../../../core/services/toast.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { PhotoUploadComponent } from '../../../shared/components/photo-upload/photo-upload.component';

@Component({
  selector: 'app-capture-detail',
  standalone: true,
  imports: [RouterLink, DatePipe, DecimalPipe, LoadingSpinnerComponent, PhotoUploadComponent],
  template: `
    <div class="max-w-2xl mx-auto px-5 py-8">
      <a routerLink="/captures" class="text-sm text-warm-400 hover:text-warm-700 transition-colors">
        ← Mes captures
      </a>

      @if (loading) { <app-loading-spinner /> }
      @else if (error) {
        <div class="mt-4 p-4 bg-red-50 border border-red-100 rounded-2xl text-sm text-red-600">{{ error }}</div>
      }
      @else if (capture) {
        <div class="mt-6 space-y-4">

          <!-- Photo -->
          <div class="bg-white border border-warm-200 rounded-2xl p-5 shadow-sm">
            <p class="text-xs font-semibold text-warm-400 uppercase tracking-wide mb-3">Photo</p>
            <app-photo-upload
              [currentPhotoUrl]="capture.photoUrl"
              [uploading]="uploadingPhoto"
              [progress]="uploadProgress"
              (fileSelected)="uploadPhoto($event)"
              (removePhoto)="deletePhoto()" />
          </div>

          <!-- Titre + date -->
          <div class="bg-white border border-warm-200 rounded-2xl p-5 shadow-sm">
            <h1 class="text-2xl font-semibold text-warm-900 tracking-tight">{{ capture.speciesName }}</h1>
            <p class="text-sm text-warm-500 mt-1">
              Capturé le {{ capture.caughtAt | date:'d MMMM yyyy à HH:mm' }}
            </p>
            <div class="grid grid-cols-2 gap-3 mt-4">
              <div class="bg-warm-100 rounded-xl p-4">
                <p class="text-xs font-semibold text-warm-400 uppercase tracking-wide">Poids</p>
                <p class="text-2xl font-bold text-warm-900 mt-1">
                  {{ capture.weight }}<span class="text-sm font-medium text-warm-500 ml-1">kg</span>
                </p>
              </div>
              <div class="bg-warm-100 rounded-xl p-4">
                <p class="text-xs font-semibold text-warm-400 uppercase tracking-wide">Taille</p>
                <p class="text-2xl font-bold text-warm-900 mt-1">
                  {{ capture.length }}<span class="text-sm font-medium text-warm-500 ml-1">cm</span>
                </p>
              </div>
            </div>
          </div>

          <!-- Détails -->
          @if (capture.note || capture.latitude || capture.species) {
            <div class="bg-white border border-warm-200 rounded-2xl shadow-sm divide-y divide-warm-100">
              @if (capture.note) {
                <div class="p-5">
                  <p class="text-xs font-semibold text-warm-400 uppercase tracking-wide mb-1">Note</p>
                  <p class="text-sm text-warm-700 leading-relaxed">{{ capture.note }}</p>
                </div>
              }
              @if (capture.latitude && capture.longitude) {
                <div class="p-5">
                  <p class="text-xs font-semibold text-warm-400 uppercase tracking-wide mb-1">GPS</p>
                  <p class="text-sm text-warm-700 font-mono">
                    {{ capture.latitude | number:'1.4-4' }}, {{ capture.longitude | number:'1.4-4' }}
                  </p>
                </div>
              }
              @if (capture.species) {
                <div class="p-5 flex items-center justify-between">
                  <p class="text-xs font-semibold text-warm-400 uppercase tracking-wide">Espèce</p>
                  <a [routerLink]="['/species', capture.species.id]"
                     class="text-sm font-medium text-forest-600 hover:underline">
                    {{ capture.species.commonName }} →
                  </a>
                </div>
              }
            </div>
          }

          <!-- Danger zone -->
          <div class="bg-white border border-warm-200 rounded-2xl p-5 shadow-sm">
            <button (click)="delete()" [disabled]="deleting"
                    class="w-full py-2.5 text-sm font-medium text-red-500 bg-white border border-red-100 rounded-xl hover:bg-red-50 disabled:opacity-40 transition-all">
              @if (deleting) {
                <span class="flex items-center justify-center gap-2">
                  <span class="w-4 h-4 border-2 border-red-300 border-t-red-500 rounded-full animate-spin"></span>
                  Suppression...
                </span>
              } @else {
                Supprimer cette capture
              }
            </button>
          </div>

        </div>
      }
    </div>
  `,
})
export class CaptureDetailComponent implements OnInit {
  private route          = inject(ActivatedRoute);
  private router         = inject(Router);
  private captureService = inject(CaptureService);
  private toast          = inject(ToastService);

  capture: Capture | null = null;
  loading = true; error = ''; deleting = false;
  uploadingPhoto = false; uploadProgress = 0;

  ngOnInit(): void {
    const id = +this.route.snapshot.paramMap.get('id')!;
    this.captureService.getCaptureById(id).subscribe({
      next:  res => { this.capture = res.data; this.loading = false; },
      error: err => { this.error = err.error?.message ?? 'Capture introuvable'; this.loading = false; },
    });
  }

  uploadPhoto(file: File): void {
    if (!this.capture) return;
    this.uploadingPhoto = true; this.uploadProgress = 0;
    const interval = setInterval(() => {
      if (this.uploadProgress < 85) this.uploadProgress += 12;
      else clearInterval(interval);
    }, 180);
    this.captureService.uploadPhoto(this.capture.id, file).subscribe({
      next: res => {
        clearInterval(interval); this.uploadProgress = 100;
        this.capture = res.data;
        this.toast.success('Photo mise à jour !');
        setTimeout(() => { this.uploadingPhoto = false; this.uploadProgress = 0; }, 500);
      },
      error: () => {
        clearInterval(interval); this.uploadingPhoto = false; this.uploadProgress = 0;
        this.toast.error("Échec de l'upload photo.");
      },
    });
  }

  deletePhoto(): void {
    if (!this.capture) return;
    this.captureService.deletePhoto(this.capture.id).subscribe({
      next: () => { if (this.capture) { this.capture = { ...this.capture, photoUrl: null }; this.toast.info('Photo supprimée.'); } },
      error: () => { this.toast.error('Impossible de supprimer la photo.'); },
    });
  }

  delete(): void {
    if (!this.capture || !confirm('Supprimer cette capture définitivement ?')) return;
    this.deleting = true;
    this.captureService.deleteCapture(this.capture.id).subscribe({
      next:  () => { this.toast.success('Capture supprimée.'); this.router.navigate(['/captures']); },
      error: () => { this.toast.error('Impossible de supprimer.'); this.deleting = false; },
    });
  }
}
