import { Component, OnInit, inject, ViewChild } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CaptureService } from '../../../core/services/capture.service';
import { SpeciesService } from '../../../core/services/species.service';
import { Species } from '../../../core/models/species.model';
import { ToastService } from '../../../core/services/toast.service';
import { PhotoUploadComponent } from '../../../shared/components/photo-upload/photo-upload.component';

@Component({
  selector: 'app-capture-new',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, PhotoUploadComponent],
  template: `
    <div class="max-w-2xl mx-auto px-5 py-8">

      <div class="mb-8">
        <a routerLink="/captures" class="text-sm text-warm-400 hover:text-warm-700 transition-colors">
          ← Mes captures
        </a>
        <h1 class="mt-3 text-2xl font-semibold text-warm-900 tracking-tight">Nouvelle capture</h1>
        <p class="mt-1 text-sm text-warm-500">Enregistre les détails de ta prise.</p>
      </div>

      <div class="bg-white border border-warm-200 rounded-2xl p-6 shadow-sm">
        <form [formGroup]="form" (ngSubmit)="submit()">

          <!-- Photo upload en haut -->
          <div class="mb-6">
            <label class="block text-xs font-semibold text-warm-500 uppercase tracking-wide mb-2">
              Photo
            </label>
            <app-photo-upload
              #photoUpload
              [uploading]="uploadingPhoto"
              [progress]="uploadProgress"
              (fileSelected)="onPhotoSelected($event)"
              (removePhoto)="onPhotoRemoved()" />
          </div>

          <div class="border-t border-warm-100 pt-6 space-y-5">

            <div>
              <label class="block text-xs font-semibold text-warm-500 uppercase tracking-wide mb-1.5">
                Espèce *
              </label>
              <input type="text" formControlName="speciesName"
                     class="w-full px-3.5 py-2.5 text-sm bg-white border border-warm-300 rounded-xl outline-none focus:border-forest-500 focus:ring-1 focus:ring-forest-500 transition-all text-warm-900 placeholder-warm-400"
                     placeholder="Brochet, Carpe, Truite...">
            </div>

            @if (speciesList.length) {
              <div>
                <label class="block text-xs font-semibold text-warm-500 uppercase tracking-wide mb-1.5">
                  Lier au catalogue
                </label>
                <select formControlName="speciesId"
                        class="w-full px-3.5 py-2.5 text-sm bg-white border border-warm-300 rounded-xl outline-none focus:border-forest-500 focus:ring-1 focus:ring-forest-500 transition-all text-warm-900">
                  <option value="">— Optionnel —</option>
                  @for (s of speciesList; track s.id) {
                    <option [value]="s.id">{{ s.commonName }}</option>
                  }
                </select>
              </div>
            }

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-semibold text-warm-500 uppercase tracking-wide mb-1.5">
                  Poids (kg) *
                </label>
                <input type="number" formControlName="weight" step="0.01" min="0"
                       class="w-full px-3.5 py-2.5 text-sm bg-white border border-warm-300 rounded-xl outline-none focus:border-forest-500 focus:ring-1 focus:ring-forest-500 transition-all text-warm-900 placeholder-warm-400"
                       placeholder="1.5">
              </div>
              <div>
                <label class="block text-xs font-semibold text-warm-500 uppercase tracking-wide mb-1.5">
                  Taille (cm) *
                </label>
                <input type="number" formControlName="length" step="0.1" min="0"
                       class="w-full px-3.5 py-2.5 text-sm bg-white border border-warm-300 rounded-xl outline-none focus:border-forest-500 focus:ring-1 focus:ring-forest-500 transition-all text-warm-900 placeholder-warm-400"
                       placeholder="45">
              </div>
            </div>

            <div>
              <label class="block text-xs font-semibold text-warm-500 uppercase tracking-wide mb-1.5">
                Date et heure *
              </label>
              <input type="datetime-local" formControlName="caughtAt"
                     class="w-full px-3.5 py-2.5 text-sm bg-white border border-warm-300 rounded-xl outline-none focus:border-forest-500 focus:ring-1 focus:ring-forest-500 transition-all text-warm-900">
            </div>

            <div>
              <label class="block text-xs font-semibold text-warm-500 uppercase tracking-wide mb-1.5">
                Note
              </label>
              <textarea formControlName="note" rows="3"
                        class="w-full px-3.5 py-2.5 text-sm bg-white border border-warm-300 rounded-xl outline-none focus:border-forest-500 focus:ring-1 focus:ring-forest-500 transition-all resize-none text-warm-900 placeholder-warm-400"
                        placeholder="Super session, eau claire..."></textarea>
            </div>
          </div>

          @if (error) {
            <div class="mt-5 p-3 bg-red-50 border border-red-100 rounded-xl text-xs text-red-600">
              {{ error }}
            </div>
          }

          <div class="flex gap-3 mt-6 pt-6 border-t border-warm-100">
            <a routerLink="/captures"
               class="flex-1 text-center py-2.5 text-sm font-medium text-warm-600 bg-warm-50 border border-warm-200 rounded-xl hover:bg-warm-100 transition-all">
              Annuler
            </a>
            <button type="submit" [disabled]="loading || form.invalid"
                    class="flex-1 py-2.5 text-sm font-semibold text-white bg-forest-600 rounded-xl hover:bg-forest-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
              @if (loading) {
                <span class="flex items-center justify-center gap-2">
                  <span class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  Enregistrement...
                </span>
              } @else {
                Enregistrer
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
})
export class CaptureNewComponent implements OnInit {
  @ViewChild('photoUpload') photoUploadRef!: PhotoUploadComponent;

  private fb             = inject(FormBuilder);
  private captureService = inject(CaptureService);
  private speciesService = inject(SpeciesService);
  private router         = inject(Router);
  private toast          = inject(ToastService);

  form = this.fb.group({
    speciesName: ['', Validators.required],
    speciesId:   [''],
    weight:      [null as number | null, [Validators.required, Validators.min(0)]],
    length:      [null as number | null, [Validators.required, Validators.min(0)]],
    caughtAt:    [new Date().toISOString().slice(0, 16), Validators.required],
    note:        [''],
  });

  speciesList: Species[] = [];
  selectedPhoto: File | null = null;
  uploadingPhoto = false;
  uploadProgress = 0;
  loading = false;
  error   = '';

  ngOnInit(): void {
    this.speciesService.getAllSpecies(0, 50).subscribe({
      next: res => (this.speciesList = res.data.content),
      error: () => {},
    });
  }

  onPhotoSelected(file: File): void  { this.selectedPhoto = file; }
  onPhotoRemoved():         void     { this.selectedPhoto = null; }

  submit(): void {
    if (this.form.invalid) return;
    this.loading = true;
    this.error   = '';
    const v = this.form.value;

    // datetime-local donne "2026-04-20T10:30" — on ajoute ":00" si nécessaire
    const rawDate = v.caughtAt!;
    const caughtAt = rawDate.length === 16 ? rawDate + ':00' : rawDate;

    this.captureService.createCapture({
      speciesName: v.speciesName!,
      weight:      v.weight!,
      length:      v.length!,
      caughtAt,
      note:        v.note || undefined,
      speciesId:   v.speciesId ? +v.speciesId : undefined,
    }).subscribe({
      next: res => {
        const captureId = res.data.id;
        if (this.selectedPhoto) {
          this.uploadingPhoto = true;
          this.simulateProgress();
          this.captureService.uploadPhoto(captureId, this.selectedPhoto).subscribe({
            next:  () => { this.toast.success('Capture enregistrée avec photo !'); this.router.navigate(['/captures', captureId]); },
            error: () => { this.toast.info('Capture créée (photo non uploadée).'); this.router.navigate(['/captures', captureId]); },
          });
        } else {
          this.toast.success('Capture enregistrée !');
          this.router.navigate(['/captures', captureId]);
        }
      },
      error: err => {
        if (err.status === 403) {
          this.error = 'Limite de 50 captures atteinte. Passe Premium pour continuer. ⭐';
        } else {
          this.error = err.error?.message ?? 'Erreur lors de la création';
        }
        this.toast.error(this.error);
        this.loading = false;
      },
    });
  }

  private simulateProgress(): void {
    const interval = setInterval(() => {
      if (this.uploadProgress < 90) this.uploadProgress += 15;
      else clearInterval(interval);
    }, 200);
  }
}
