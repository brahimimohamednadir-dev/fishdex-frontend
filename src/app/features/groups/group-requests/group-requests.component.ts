import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { GroupService } from '../../../core/services/group.service';
import { ToastService } from '../../../core/services/toast.service';
import { JoinRequest } from '../../../core/models/group.model';
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
  selector: 'app-group-requests',
  standalone: true,
  imports: [RouterLink, LoadingSpinnerComponent],
  template: `
    <div class="max-w-2xl mx-auto px-5 py-8">
      <!-- Header -->
      <div class="flex items-center gap-3 mb-6">
        <a [routerLink]="['/groups', groupId, 'admin']" class="text-warm-400 hover:text-warm-700 transition-colors text-lg">←</a>
        <div>
          <h1 class="text-xl font-bold text-warm-900">Demandes d'adhésion</h1>
          <p class="text-sm text-warm-500 mt-0.5">{{ requests().length }} demande{{ requests().length > 1 ? 's' : '' }} en attente</p>
        </div>
      </div>

      @if (loading()) {
        <app-loading-spinner />
      } @else if (requests().length === 0) {
        <div class="text-center py-16 border-2 border-dashed border-warm-300 rounded-2xl">
          <div class="text-4xl mb-3 opacity-30">🙋</div>
          <p class="text-sm text-warm-500">Aucune demande en attente</p>
        </div>
      } @else {
        <div class="space-y-3">
          @for (req of requests(); track req.id) {
            <div class="bg-white border border-warm-200 rounded-2xl p-4 shadow-sm flex items-start gap-3">
              <div class="w-9 h-9 rounded-full bg-warm-300 text-warm-700 text-sm flex items-center justify-center font-bold shrink-0">
                {{ req.username.charAt(0).toUpperCase() }}
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between gap-2 mb-1">
                  <p class="text-sm font-semibold text-warm-900">{{ req.username }}</p>
                  <span class="text-xs text-warm-400">{{ timeAgo(req.requestedAt) }}</span>
                </div>
                @if (req.message) {
                  <p class="text-xs text-warm-500 italic mb-3">"{{ req.message }}"</p>
                }
                <div class="flex gap-2 mt-2">
                  <button (click)="accept(req)"
                          [disabled]="processingId() === req.id"
                          class="px-4 py-1.5 text-xs font-semibold text-white bg-forest-600 rounded-xl hover:bg-forest-700 disabled:opacity-50 transition-all">
                    @if (processingId() === req.id) {
                      <span class="flex items-center gap-1.5">
                        <span class="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      </span>
                    } @else {
                      Accepter
                    }
                  </button>
                  <button (click)="reject(req)"
                          [disabled]="processingId() === req.id"
                          class="px-4 py-1.5 text-xs font-semibold text-warm-600 bg-warm-100 rounded-xl hover:bg-warm-200 disabled:opacity-50 transition-all">
                    Refuser
                  </button>
                </div>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class GroupRequestsComponent implements OnInit {
  private route        = inject(ActivatedRoute);
  private groupService = inject(GroupService);
  private toast        = inject(ToastService);

  groupId     = 0;
  requests    = signal<JoinRequest[]>([]);
  loading     = signal(true);
  processingId = signal<number | null>(null);

  readonly timeAgo = timeAgo;

  ngOnInit(): void {
    this.groupId = +this.route.snapshot.paramMap.get('id')!;
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.groupService.getJoinRequests(this.groupId).subscribe({
      next: res => { this.requests.set(res.data ?? []); this.loading.set(false); },
      error: ()  => { this.loading.set(false); this.toast.error('Impossible de charger les demandes'); },
    });
  }

  accept(req: JoinRequest): void {
    if (this.processingId() !== null) return;
    this.processingId.set(req.id);
    this.groupService.acceptRequest(this.groupId, req.userId).subscribe({
      next: () => {
        this.processingId.set(null);
        this.requests.update(prev => prev.filter(r => r.id !== req.id));
        this.toast.success(`${req.username} a été accepté`);
      },
      error: err => {
        this.processingId.set(null);
        this.toast.error(err.error?.message ?? 'Erreur');
      },
    });
  }

  reject(req: JoinRequest): void {
    if (this.processingId() !== null) return;
    this.processingId.set(req.id);
    this.groupService.rejectRequest(this.groupId, req.userId).subscribe({
      next: () => {
        this.processingId.set(null);
        this.requests.update(prev => prev.filter(r => r.id !== req.id));
        this.toast.info(`${req.username} a été refusé`);
      },
      error: err => {
        this.processingId.set(null);
        this.toast.error(err.error?.message ?? 'Erreur');
      },
    });
  }
}
