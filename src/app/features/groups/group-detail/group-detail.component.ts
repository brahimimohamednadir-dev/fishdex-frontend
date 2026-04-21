import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DatePipe } from '@angular/common';
import { GroupService } from '../../../core/services/group.service';
import { ToastService } from '../../../core/services/toast.service';
import { Group, FeedItem } from '../../../core/models/group.model';
import { Page } from '../../../core/models/capture.model';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-group-detail',
  standalone: true,
  imports: [DatePipe, LoadingSpinnerComponent],
  template: `
    <div class="max-w-2xl mx-auto px-5 py-8">
      @if (loading) { <app-loading-spinner /> }
      @else if (error) {
        <div class="p-4 bg-red-50 border border-red-100 rounded-2xl text-sm text-red-600">{{ error }}</div>
      }
      @else if (group) {

        <!-- Header -->
        <div class="bg-white border border-warm-200 rounded-2xl p-6 mb-4 shadow-sm">
          <div class="flex items-start justify-between gap-4">
            <div class="min-w-0">
              <div class="flex items-center gap-2 flex-wrap mb-1">
                <h1 class="text-xl font-semibold text-warm-900 tracking-tight">{{ group.name }}</h1>
                <span class="text-xs font-semibold px-2 py-0.5 rounded-full bg-warm-100 text-warm-600">
                  {{ group.type }}
                </span>
                @if (group.isPro) {
                  <span class="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">PRO</span>
                }
              </div>
              @if (group.description) {
                <p class="text-sm text-warm-500 mt-1">{{ group.description }}</p>
              }
              <p class="text-xs text-warm-400 mt-2">
                {{ group.memberCount }} membre{{ group.memberCount > 1 ? 's' : '' }} ·
                Créé par <span class="font-medium text-warm-600">{{ group.creatorUsername }}</span> ·
                {{ group.createdAt | date:'d MMM yyyy' }}
              </p>
            </div>
            <button (click)="join()" [disabled]="joined || joining"
                    class="shrink-0 px-4 py-2 text-sm font-semibold text-white bg-forest-600 rounded-xl hover:bg-forest-700 disabled:opacity-50 transition-all">
              @if (joining) {
                <span class="flex items-center gap-2">
                  <span class="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                </span>
              } @else if (joined) {
                ✓ Membre
              } @else {
                Rejoindre
              }
            </button>
          </div>
        </div>

        <!-- Feed -->
        <h2 class="text-xs font-semibold text-warm-400 uppercase tracking-wide mb-3">Activité récente</h2>

        @if (feedLoading) { <app-loading-spinner /> }
        @else if (!feed.length) {
          <div class="text-center py-12 border-2 border-dashed border-warm-300 rounded-2xl">
            <p class="text-3xl opacity-20 mb-2">🎣</p>
            <p class="text-sm text-warm-500">Aucune activité pour l'instant</p>
          </div>
        } @else {
          <div class="space-y-3">
            @for (item of feed; track item.captureId) {
              <div class="bg-white border border-warm-200 rounded-xl p-4 flex gap-4 items-center shadow-sm">
                @if (item.photoUrl) {
                  <img [src]="item.photoUrl" [alt]="item.speciesName"
                       class="w-14 h-14 rounded-xl object-cover flex-shrink-0">
                } @else {
                  <div class="w-14 h-14 rounded-xl bg-warm-100 flex items-center justify-center text-xl flex-shrink-0 opacity-50">🐟</div>
                }
                <div class="min-w-0 flex-1">
                  <p class="text-sm font-semibold text-warm-900 truncate">{{ item.username }}</p>
                  <p class="text-sm text-warm-600 mt-0.5">
                    {{ item.speciesName }}
                    <span class="text-warm-300 mx-1">·</span>
                    <span class="font-medium">{{ item.weight }} kg</span>
                    <span class="text-warm-300 mx-1">·</span>
                    <span class="font-medium">{{ item.length }} cm</span>
                  </p>
                  <p class="text-xs text-warm-400 mt-0.5">{{ item.caughtAt | date:'d MMM yyyy à HH:mm' }}</p>
                </div>
              </div>
            }
          </div>

          <!-- Pagination -->
          @if ((feedPage?.totalPages ?? 0) > 1) {
            <div class="flex justify-center items-center gap-2 mt-8">
              <button (click)="loadFeed(feedCurrentPage - 1)" [disabled]="feedCurrentPage === 0"
                      class="px-4 py-2 text-sm font-medium text-warm-600 bg-white border border-warm-200 rounded-xl hover:bg-warm-50 disabled:opacity-30 transition-all">
                ← Précédent
              </button>
              <span class="px-3 text-sm text-warm-500">{{ feedCurrentPage + 1 }} / {{ feedPage?.totalPages }}</span>
              <button (click)="loadFeed(feedCurrentPage + 1)"
                      [disabled]="feedCurrentPage >= (feedPage?.totalPages ?? 1) - 1"
                      class="px-4 py-2 text-sm font-medium text-warm-600 bg-white border border-warm-200 rounded-xl hover:bg-warm-50 disabled:opacity-30 transition-all">
                Suivant →
              </button>
            </div>
          }
        }
      }
    </div>
  `,
})
export class GroupDetailComponent implements OnInit {
  private route        = inject(ActivatedRoute);
  private groupService = inject(GroupService);
  private toast        = inject(ToastService);

  group: Group | null = null;
  feed: FeedItem[] = [];
  feedPage: Page<FeedItem> | null = null;
  feedCurrentPage = 0;
  loading = true; feedLoading = true;
  error = ''; joined = false; joining = false;

  ngOnInit(): void {
    const id = +this.route.snapshot.paramMap.get('id')!;
    this.groupService.getGroupById(id).subscribe({
      next: res => { this.group = res.data; this.loading = false; },
      error: err => { this.error = err.error?.message ?? 'Groupe introuvable'; this.loading = false; },
    });
    this.loadFeed(0);
  }

  loadFeed(page: number): void {
    const id = +this.route.snapshot.paramMap.get('id')!;
    this.feedLoading = true;
    this.groupService.getGroupFeed(id, page).subscribe({
      next: res => {
        this.feedPage = res.data;
        this.feed = res.data.content;
        this.feedCurrentPage = page;
        this.feedLoading = false;
      },
      error: () => (this.feedLoading = false),
    });
  }

  join(): void {
    if (!this.group || this.joined) return;
    this.joining = true;
    this.groupService.joinGroup(this.group.id).subscribe({
      next: () => {
        this.joined = true;
        this.joining = false;
        if (this.group) this.group = { ...this.group, memberCount: this.group.memberCount + 1 };
        this.toast.success(`Tu as rejoint "${this.group?.name}" !`);
      },
      error: err => {
        this.joining = false;
        const msg = err.error?.message ?? 'Impossible de rejoindre le groupe';
        if (err.status === 409) this.joined = true;
        else this.toast.error(msg);
      },
    });
  }
}
