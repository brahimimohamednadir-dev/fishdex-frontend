import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PostService } from '../../../core/services/post.service';
import { ToastService } from '../../../core/services/toast.service';
import { Report } from '../../../core/models/post.model';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days  = Math.floor(diff / 86_400_000);
  if (mins < 1)  return 'à l\'instant';
  if (mins < 60) return `il y a ${mins} min`;
  if (hours < 24) return `il y a ${hours}h`;
  if (days < 7)  return `il y a ${days}j`;
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

@Component({
  selector: 'app-group-reports',
  standalone: true,
  imports: [RouterLink, LoadingSpinnerComponent],
  template: `
    <div class="max-w-2xl mx-auto px-5 py-8">
      <!-- Header -->
      <div class="flex items-center gap-3 mb-6">
        <a [routerLink]="['/groups', groupId, 'admin']" class="text-warm-400 hover:text-warm-700 transition-colors text-lg">←</a>
        <div>
          <h1 class="text-xl font-bold text-warm-900">Signalements</h1>
          <p class="text-sm text-warm-500 mt-0.5">{{ reports().length }} signalement{{ reports().length > 1 ? 's' : '' }}</p>
        </div>
      </div>

      @if (loading()) {
        <app-loading-spinner />
      } @else if (reports().length === 0) {
        <div class="text-center py-16 border-2 border-dashed border-warm-300 rounded-2xl">
          <div class="text-4xl mb-3 opacity-30">🚩</div>
          <p class="text-sm text-warm-500">Aucun signalement</p>
        </div>
      } @else {
        <div class="space-y-3">
          @for (report of reports(); track report.id) {
            <div class="bg-white border border-warm-200 rounded-2xl p-4 shadow-sm">
              <div class="flex items-start justify-between gap-3 mb-3">
                <div>
                  <div class="flex items-center gap-2 mb-1">
                    <span class="text-xs font-bold px-2 py-0.5 rounded-full"
                          [class]="report.targetType === 'POST' ? 'bg-warm-100 text-warm-700' : 'bg-blue-100 text-blue-700'">
                      {{ report.targetType === 'POST' ? 'Post' : 'Commentaire' }}
                    </span>
                    <span class="text-xs text-warm-400">{{ timeAgo(report.createdAt) }}</span>
                  </div>
                  <p class="text-xs text-warm-500">
                    Signalé par <span class="font-semibold text-warm-700">{{ report.reporterUsername }}</span>
                  </p>
                </div>
                <button (click)="deleteContent(report)"
                        [disabled]="deletingId() === report.id"
                        class="shrink-0 px-3 py-1.5 text-xs font-semibold text-white bg-red-500 rounded-xl hover:bg-red-600 disabled:opacity-50 transition-all">
                  @if (deletingId() === report.id) {
                    <span class="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block"></span>
                  } @else {
                    Supprimer
                  }
                </button>
              </div>

              @if (report.reason) {
                <p class="text-xs text-warm-500 mb-2">Raison: <em>{{ report.reason }}</em></p>
              }

              <div class="p-3 bg-warm-50 border border-warm-200 rounded-xl">
                <p class="text-xs text-warm-600 line-clamp-3">{{ report.contentPreview }}</p>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class GroupReportsComponent implements OnInit {
  private route       = inject(ActivatedRoute);
  private postService = inject(PostService);
  private toast       = inject(ToastService);

  groupId    = 0;
  reports    = signal<Report[]>([]);
  loading    = signal(true);
  deletingId = signal<number | null>(null);

  readonly timeAgo = timeAgo;

  ngOnInit(): void {
    this.groupId = +this.route.snapshot.paramMap.get('id')!;
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.postService.getReports(this.groupId).subscribe({
      next: res => { this.reports.set(res.data ?? []); this.loading.set(false); },
      error: ()  => { this.loading.set(false); this.toast.error('Impossible de charger les signalements'); },
    });
  }

  deleteContent(report: Report): void {
    if (this.deletingId() !== null) return;
    if (!confirm('Supprimer ce contenu signalé ?')) return;
    this.deletingId.set(report.id);
    this.postService.deleteReportedContent(this.groupId, report.id).subscribe({
      next: () => {
        this.deletingId.set(null);
        this.reports.update(prev => prev.filter(r => r.id !== report.id));
        this.toast.success('Contenu supprimé');
      },
      error: err => {
        this.deletingId.set(null);
        this.toast.error(err.error?.message ?? 'Erreur');
      },
    });
  }
}
