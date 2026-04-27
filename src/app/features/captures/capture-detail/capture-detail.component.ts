import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DatePipe, DecimalPipe } from '@angular/common';
import { interval, timer } from 'rxjs';
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
                  <a [href]="'https://www.google.com/maps?q=' + capture.latitude + ',' + capture.longitude"
                     target="_blank" rel="noopener"
                     class="text-xs text-forest-600 hover:underline mt-1 inline-block">
                    Voir sur la carte →
                  </a>
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

          <!-- Météo -->
          @if (capture.weatherTemp != null) {
            <div class="bg-white border border-warm-200 rounded-2xl p-5 shadow-sm">
              <p class="text-xs font-semibold text-warm-400 uppercase tracking-wide mb-3">
                🌤️ Conditions météo au moment de la capture
              </p>
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div class="bg-sky-50 rounded-xl p-3 text-center">
                  <p class="text-xl font-bold text-sky-700">{{ capture.weatherTemp | number:'1.0-1' }}°C</p>
                  <p class="text-xs text-sky-500 mt-0.5">Température</p>
                </div>
                @if (capture.weatherWind != null) {
                  <div class="bg-slate-50 rounded-xl p-3 text-center">
                    <p class="text-xl font-bold text-slate-700">{{ capture.weatherWind | number:'1.0-1' }} m/s</p>
                    <p class="text-xs text-slate-500 mt-0.5">Vent</p>
                  </div>
                }
                @if (capture.weatherPressure != null) {
                  <div class="bg-indigo-50 rounded-xl p-3 text-center">
                    <p class="text-xl font-bold text-indigo-700">{{ capture.weatherPressure | number:'1.0-0' }}</p>
                    <p class="text-xs text-indigo-500 mt-0.5">Pression (hPa)</p>
                  </div>
                }
                @if (capture.weatherClouds != null) {
                  <div class="bg-gray-50 rounded-xl p-3 text-center">
                    <p class="text-xl font-bold text-gray-700">{{ capture.weatherClouds }}%</p>
                    <p class="text-xs text-gray-500 mt-0.5">Nuages</p>
                  </div>
                }
              </div>
              @if (capture.weatherDesc) {
                <p class="text-sm text-warm-600 mt-3 capitalize">{{ capture.weatherDesc }}</p>
              }
            </div>
          }

          <!-- Danger zone -->
          <div class="bg-white border border-warm-200 rounded-2xl p-5 shadow-sm">
            @if (!confirmDelete) {
              <button (click)="confirmDelete = true" [disabled]="deleting"
                      class="w-full py-2.5 text-sm font-medium text-red-500 bg-white border border-red-100 rounded-xl hover:bg-red-50 disabled:opacity-40 transition-all">
                Supprimer cette capture
              </button>
            } @else {
              <div class="text-center">
                <p class="text-sm font-medium text-warm-800 mb-3">Supprimer définitivement ?</p>
                <div class="flex gap-2">
                  <button (click)="confirmDelete = false"
                          class="flex-1 py-2 text-sm font-medium text-warm-600 bg-warm-100 rounded-xl hover:bg-warm-200 transition-all">
                    Annuler
                  </button>
                  <button (click)="delete()" [disabled]="deleting"
                          class="flex-1 py-2 text-sm font-semibold text-white bg-red-500 rounded-xl hover:bg-red-600 disabled:opacity-40 transition-all">
                    @if (deleting) { Suppression... } @else { Oui, supprimer }
                  </button>
                </div>
              </div>
            }
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
  loading = true; error = ''; deleting = false; confirmDelete = false;
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
    const progressSub = interval(180).subscribe(() => {
      if (this.uploadProgress < 85) this.uploadProgress += 12;
      else progressSub.unsubscribe();
    });
    this.captureService.uploadPhoto(this.capture.id, file).subscribe({
      next: res => {
        progressSub.unsubscribe(); this.uploadProgress = 100;
        this.capture = res.data;
        this.toast.success('Photo mise à jour !');
        timer(500).subscribe(() => { this.uploadingPhoto = false; this.uploadProgress = 0; });
      },
      error: () => {
        progressSub.unsubscribe(); this.uploadingPhoto = false; this.uploadProgress = 0;
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
    if (!this.capture) return;
    this.deleting = true;
    this.captureService.deleteCapture(this.capture.id).subscribe({
      next:  () => { this.toast.success('Capture supprimée.'); this.router.navigate(['/captures']); },
      error: () => { this.toast.error('Impossible de supprimer.'); this.deleting = false; },
    });
  }
}
