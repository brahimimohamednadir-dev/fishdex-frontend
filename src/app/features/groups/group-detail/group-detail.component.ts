import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DatePipe } from '@angular/common';
import { GroupService } from '../../../core/services/group.service';
import { Group, FeedItem } from '../../../core/models/group.model';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-group-detail',
  standalone: true,
  imports: [DatePipe, LoadingSpinnerComponent],
  template: `
    <div class="max-w-2xl mx-auto px-5 py-8">
      @if (loading) { <app-loading-spinner /> }
      @else if (error) {
        <div class="p-4 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">{{ error }}</div>
      }
      @else if (group) {

        <!-- Header -->
        <div class="bg-white border border-gray-100 rounded-2xl p-6 mb-6 shadow-sm">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-xl font-bold text-gray-900 tracking-tight">{{ group.name }}</h1>
              <p class="text-sm text-gray-500 mt-0.5">
                {{ group.memberCount }} membre{{ group.memberCount > 1 ? 's' : '' }} · Créé le {{ group.createdAt | date:'d MMM yyyy' }}
              </p>
            </div>
            <button (click)="join()" [disabled]="joined"
                    class="px-4 py-2 text-sm font-semibold text-white bg-gray-900 rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-all">
              {{ joined ? '✓ Membre' : 'Rejoindre' }}
            </button>
          </div>
        </div>

        <!-- Feed -->
        <h2 class="text-base font-semibold text-gray-900 mb-4">Activité récente</h2>

        @if (feedLoading) { <app-loading-spinner /> }
        @else if (!feed.length) {
          <div class="text-center py-12 border-2 border-dashed border-gray-200 rounded-2xl">
            <p class="text-3xl opacity-20 mb-2">🎣</p>
            <p class="text-sm text-gray-500">Aucune activité pour l'instant</p>
          </div>
        } @else {
          <div class="space-y-3">
            @for (item of feed; track item.id) {
              <div class="bg-white border border-gray-100 rounded-xl p-4 flex gap-4 items-center">
                @if (item.photoUrl) {
                  <img [src]="item.photoUrl" [alt]="item.speciesName"
                       class="w-14 h-14 rounded-xl object-cover flex-shrink-0">
                } @else {
                  <div class="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center text-xl flex-shrink-0 opacity-50">🐟</div>
                }
                <div class="min-w-0">
                  <p class="text-sm font-semibold text-gray-900">{{ item.username }}</p>
                  <p class="text-sm text-gray-600 mt-0.5">
                    {{ item.speciesName }} · <span class="font-medium">{{ item.weight }} kg</span>
                  </p>
                  <p class="text-xs text-gray-400 mt-0.5">{{ item.caughtAt | date:'d MMM yyyy' }}</p>
                </div>
              </div>
            }
          </div>
        }
      }
    </div>
  `,
})
export class GroupDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private groupService = inject(GroupService);
  group: Group | null = null; feed: FeedItem[] = [];
  loading = true; feedLoading = true; error = ''; joined = false;
  ngOnInit(): void {
    const id = +this.route.snapshot.paramMap.get('id')!;
    this.groupService.getGroupById(id).subscribe({
      next: res => { this.group = res.data; this.loading = false; },
      error: err => { this.error = err.error?.message ?? 'Groupe introuvable'; this.loading = false; },
    });
    this.groupService.getGroupFeed(id).subscribe({
      next: res => { this.feed = res.data; this.feedLoading = false; },
      error: () => (this.feedLoading = false),
    });
  }
  join(): void {
    if (!this.group) return;
    this.groupService.joinGroup(this.group.id).subscribe({
      next: () => { this.joined = true; if (this.group) this.group = { ...this.group, memberCount: this.group.memberCount + 1 }; },
      error: () => {},
    });
  }
}
