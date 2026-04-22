import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { GroupService } from '../../../core/services/group.service';
import { ToastService } from '../../../core/services/toast.service';
import { GroupVisibility, GroupCategory } from '../../../core/models/group.model';
import { PhotoUploadComponent } from '../../../shared/components/photo-upload/photo-upload.component';

@Component({
  selector: 'app-group-new',
  standalone: true,
  imports: [FormsModule, RouterLink, PhotoUploadComponent],
  template: `
    <div class="max-w-2xl mx-auto px-5 py-8">
      <!-- Header -->
      <div class="flex items-center gap-3 mb-8">
        <a routerLink="/groups" class="text-warm-400 hover:text-warm-700 transition-colors text-lg">←</a>
        <div>
          <h1 class="text-2xl font-bold text-warm-900 tracking-tight">Créer un groupe</h1>
          <p class="text-sm text-warm-500 mt-0.5">Rassemble ta communauté de pêcheurs</p>
        </div>
      </div>

      <form (ngSubmit)="submit()" class="space-y-6">

        <!-- Photo de couverture -->
        <div class="bg-white border border-warm-200 rounded-2xl p-5 shadow-sm">
          <label class="block text-sm font-semibold text-warm-800 mb-3">Photo de couverture</label>
          <app-photo-upload
            (fileSelected)="onCoverSelected($event)"
            (removePhoto)="removeCover()"
          />
        </div>

        <!-- Infos de base -->
        <div class="bg-white border border-warm-200 rounded-2xl p-5 shadow-sm space-y-4">
          <h2 class="text-sm font-semibold text-warm-800">Informations</h2>

          <!-- Nom -->
          <div>
            <label class="block text-xs font-semibold text-warm-700 mb-1.5">Nom du groupe *</label>
            <input
              type="text"
              [(ngModel)]="name"
              name="name"
              required
              maxlength="60"
              placeholder="Ex. Les pêcheurs de la Garonne"
              class="w-full px-4 py-2.5 border border-warm-300 rounded-xl text-sm focus:outline-none focus:border-forest-500 focus:ring-1 focus:ring-forest-500"
            />
          </div>

          <!-- Description -->
          <div>
            <label class="block text-xs font-semibold text-warm-700 mb-1.5">Description</label>
            <textarea
              [(ngModel)]="description"
              name="description"
              rows="3"
              maxlength="500"
              placeholder="Décris ton groupe..."
              class="w-full px-4 py-2.5 border border-warm-300 rounded-xl text-sm focus:outline-none focus:border-forest-500 focus:ring-1 focus:ring-forest-500 resize-none"
            ></textarea>
          </div>

          <!-- Règles -->
          <div>
            <label class="block text-xs font-semibold text-warm-700 mb-1.5">Règles du groupe</label>
            <textarea
              [(ngModel)]="rules"
              name="rules"
              rows="3"
              maxlength="1000"
              placeholder="Règles et consignes pour les membres..."
              class="w-full px-4 py-2.5 border border-warm-300 rounded-xl text-sm focus:outline-none focus:border-forest-500 focus:ring-1 focus:ring-forest-500 resize-none"
            ></textarea>
          </div>
        </div>

        <!-- Catégorie -->
        <div class="bg-white border border-warm-200 rounded-2xl p-5 shadow-sm">
          <h2 class="text-sm font-semibold text-warm-800 mb-3">Catégorie</h2>
          <div class="grid grid-cols-2 gap-2">
            @for (cat of categories; track cat.value) {
              <label
                [class]="category === cat.value
                  ? 'flex items-center gap-3 p-3 rounded-xl border-2 border-forest-500 bg-forest-50 cursor-pointer transition-all'
                  : 'flex items-center gap-3 p-3 rounded-xl border-2 border-warm-200 hover:border-warm-300 cursor-pointer transition-all'"
              >
                <input type="radio" name="category" [(ngModel)]="category" [value]="cat.value" class="sr-only" />
                <span class="text-xl">{{ cat.icon }}</span>
                <span class="text-sm font-medium text-warm-800">{{ cat.label }}</span>
              </label>
            }
          </div>
        </div>

        <!-- Visibilité -->
        <div class="bg-white border border-warm-200 rounded-2xl p-5 shadow-sm">
          <h2 class="text-sm font-semibold text-warm-800 mb-3">Visibilité</h2>
          <div class="space-y-2">
            @for (vis of visibilities; track vis.value) {
              <label
                [class]="visibility === vis.value
                  ? 'flex items-start gap-3 p-3 rounded-xl border-2 border-forest-500 bg-forest-50 cursor-pointer transition-all'
                  : 'flex items-start gap-3 p-3 rounded-xl border-2 border-warm-200 hover:border-warm-300 cursor-pointer transition-all'"
              >
                <input type="radio" name="visibility" [(ngModel)]="visibility" [value]="vis.value" class="mt-0.5" />
                <div>
                  <p class="text-sm font-semibold text-warm-800">{{ vis.label }}</p>
                  <p class="text-xs text-warm-500 mt-0.5">{{ vis.desc }}</p>
                </div>
              </label>
            }
          </div>
        </div>

        <!-- Error -->
        @if (error()) {
          <div class="p-4 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">{{ error() }}</div>
        }

        <!-- Actions -->
        <div class="flex gap-3">
          <a routerLink="/groups"
             class="flex-1 py-3 text-sm font-semibold text-center text-warm-700 bg-white border border-warm-300 rounded-xl hover:bg-warm-50 transition-all">
            Annuler
          </a>
          <button type="submit" [disabled]="submitting() || !name.trim()"
                  class="flex-1 py-3 text-sm font-semibold text-white bg-forest-600 rounded-xl hover:bg-forest-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2">
            @if (submitting()) {
              <span class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              Création...
            } @else {
              Créer le groupe
            }
          </button>
        </div>
      </form>
    </div>
  `,
})
export class GroupNewComponent {
  private groupService = inject(GroupService);
  private toast        = inject(ToastService);
  private router       = inject(Router);

  name        = '';
  description = '';
  rules       = '';
  visibility: GroupVisibility = 'PUBLIC';
  category: GroupCategory     = 'CLUB';
  coverFile: File | null = null;

  submitting = signal(false);
  error      = signal('');

  categories = [
    { value: 'CLUB' as GroupCategory,        label: 'Club',        icon: '🏅' },
    { value: 'ASSOCIATION' as GroupCategory,  label: 'Association', icon: '🤝' },
    { value: 'FRIENDS' as GroupCategory,      label: 'Amis',        icon: '👥' },
    { value: 'COMPETITION' as GroupCategory,  label: 'Compétition', icon: '🏆' },
  ];

  visibilities = [
    { value: 'PUBLIC' as GroupVisibility,  label: 'Public',  desc: 'Tout le monde peut voir et rejoindre ce groupe.' },
    { value: 'PRIVATE' as GroupVisibility, label: 'Privé',   desc: 'Visible dans la recherche, mais rejoindre nécessite une approbation.' },
    { value: 'SECRET' as GroupVisibility,  label: 'Secret',  desc: 'Invisible dans la recherche, accès sur invitation uniquement.' },
  ];

  onCoverSelected(file: File): void { this.coverFile = file; }
  removeCover(): void { this.coverFile = null; }

  submit(): void {
    if (!this.name.trim() || this.submitting()) return;
    this.submitting.set(true);
    this.error.set('');

    const fd = new FormData();
    fd.append('name', this.name.trim());
    if (this.description.trim()) fd.append('description', this.description.trim());
    if (this.rules.trim()) fd.append('rules', this.rules.trim());
    fd.append('visibility', this.visibility);
    fd.append('category', this.category);
    if (this.coverFile) fd.append('coverPhoto', this.coverFile);

    this.groupService.createGroup(fd).subscribe({
      next: res => {
        this.submitting.set(false);
        this.toast.success('Groupe créé !');
        this.router.navigate(['/groups', res.data.id]);
      },
      error: err => {
        this.submitting.set(false);
        this.error.set(err.error?.message ?? 'Impossible de créer le groupe');
      },
    });
  }
}
