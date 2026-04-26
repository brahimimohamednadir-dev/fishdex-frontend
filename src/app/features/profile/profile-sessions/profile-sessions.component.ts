import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { SessionService } from '../../../core/services/session.service';
import { UserSession } from '../../../core/models/session.model';
import { ToastService } from '../../../core/services/toast.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-profile-sessions',
  standalone: true,
  imports: [RouterLink, DatePipe, LoadingSpinnerComponent],
  template: `
    <div class="max-w-2xl mx-auto px-5 py-8">
      <a routerLink="/profile" class="text-sm text-warm-400 hover:text-warm-700 transition-colors">
        ← Mon profil
      </a>

      <div class="flex items-end justify-between mt-4 mb-6">
        <div>
          <h1 class="text-2xl font-semibold text-warm-900 tracking-tight">Sessions actives</h1>
          <p class="text-sm text-warm-500 mt-0.5">Tous les appareils connectés à ton compte.</p>
        </div>
        @if (sessions.length > 1) {
          <button (click)="revokeAll()" [disabled]="revoking"
                  class="text-xs font-semibold text-red-500 hover:text-red-700 disabled:opacity-40 transition-colors">
            Déconnecter les autres
          </button>
        }
      </div>

      @if (loading) {
        <app-loading-spinner />
      } @else if (!sessions.length) {
        <div class="text-center py-16 text-warm-400">
          <p class="text-sm">Aucune session active</p>
        </div>
      } @else {
        <div class="space-y-3">
          @for (session of sessions; track session.id) {
            <div class="bg-white border rounded-2xl p-5 shadow-sm flex items-start gap-4"
                 [class.border-forest-200]="session.current"
                 [class.border-warm-200]="!session.current">

              <!-- Icône appareil -->
              <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                   [class.bg-forest-50]="session.current"
                   [class.bg-warm-100]="!session.current">
                <span class="text-lg">{{ deviceIcon(session.deviceInfo) }}</span>
              </div>

              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 flex-wrap">
                  <p class="text-sm font-semibold text-warm-900 truncate">{{ session.deviceInfo || 'Appareil inconnu' }}</p>
                  @if (session.current) {
                    <span class="text-xs font-semibold px-2 py-0.5 rounded-full bg-forest-100 text-forest-700">
                      Session actuelle
                    </span>
                  }
                  @if (session.trusted) {
                    <span class="text-xs font-medium px-2 py-0.5 rounded-full bg-warm-100 text-warm-600">
                      Appareil de confiance
                    </span>
                  }
                </div>
                <p class="text-xs text-warm-400 mt-0.5">
                  {{ session.ip }} · Dernière activité {{ session.lastActive | date:'d MMM yyyy à HH:mm' }}
                </p>
              </div>

              @if (!session.current) {
                <button (click)="revoke(session.id)" [disabled]="revoking"
                        class="shrink-0 px-3 py-1.5 text-xs font-medium text-red-500 bg-white border border-red-100 rounded-lg hover:bg-red-50 disabled:opacity-40 transition-all">
                  Révoquer
                </button>
              }
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class ProfileSessionsComponent implements OnInit {
  private sessionService = inject(SessionService);
  private toast          = inject(ToastService);

  sessions: UserSession[] = [];
  loading = true; revoking = false;

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.sessionService.getSessions().subscribe({
      next: res => { this.sessions = res.data; this.loading = false; },
      error: () => this.loading = false,
    });
  }

  revoke(id: number): void {
    if (this.revoking) return;
    this.revoking = true;
    this.sessionService.revokeSession(id).subscribe({
      next: () => {
        this.sessions = this.sessions.filter(s => s.id !== id);
        this.toast.success('Session révoquée.');
        this.revoking = false;
      },
      error: () => { this.toast.error('Erreur.'); this.revoking = false; },
    });
  }

  revokeAll(): void {
    if (this.revoking) return;
    this.revoking = true;
    this.sessionService.revokeAllOthers().subscribe({
      next: () => {
        this.sessions = this.sessions.filter(s => s.current);
        this.toast.success('Autres sessions révoquées.');
        this.revoking = false;
      },
      error: () => { this.toast.error('Erreur.'); this.revoking = false; },
    });
  }

  deviceIcon(deviceInfo: string): string {
    const d = (deviceInfo ?? '').toLowerCase();
    if (d.includes('iphone') || d.includes('android') || d.includes('mobile')) return '📱';
    if (d.includes('ipad') || d.includes('tablet')) return '📲';
    if (d.includes('mac') || d.includes('windows') || d.includes('linux')) return '💻';
    return '🖥️';
  }
}
