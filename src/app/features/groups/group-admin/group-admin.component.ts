import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { GroupService } from '../../../core/services/group.service';
import { ToastService } from '../../../core/services/toast.service';
import { Group } from '../../../core/models/group.model';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-group-admin',
  standalone: true,
  imports: [RouterLink, LoadingSpinnerComponent],
  template: `
    <div class="max-w-2xl mx-auto px-5 py-8">
      <!-- Header -->
      <div class="flex items-center gap-3 mb-8">
        <a [routerLink]="['/groups', groupId]" class="text-warm-400 hover:text-warm-700 transition-colors text-lg">←</a>
        <div>
          <h1 class="text-xl font-bold text-warm-900">Administration</h1>
          @if (group()) {
            <p class="text-sm text-warm-500 mt-0.5">{{ group()!.name }}</p>
          }
        </div>
      </div>

      @if (loading()) {
        <app-loading-spinner />
      } @else if (group()) {

        <!-- Stats -->
        <div class="grid grid-cols-3 gap-3 mb-6">
          <div class="bg-white border border-warm-200 rounded-2xl p-4 shadow-sm text-center">
            <p class="text-2xl font-bold text-warm-900">{{ group()!.memberCount }}</p>
            <p class="text-xs text-warm-500 mt-0.5">Membres</p>
          </div>
          <div class="bg-white border border-warm-200 rounded-2xl p-4 shadow-sm text-center">
            <p class="text-2xl font-bold text-warm-900">{{ group()!.postCount }}</p>
            <p class="text-xs text-warm-500 mt-0.5">Posts</p>
          </div>
          <div class="bg-white border border-warm-200 rounded-2xl p-4 shadow-sm text-center">
            <p class="text-2xl font-bold text-forest-600">{{ pendingCount() }}</p>
            <p class="text-xs text-warm-500 mt-0.5">Demandes</p>
          </div>
        </div>

        <!-- Admin links -->
        <div class="bg-white border border-warm-200 rounded-2xl shadow-sm divide-y divide-warm-100">
          <a [routerLink]="['/groups', groupId, 'admin', 'requests']"
             class="flex items-center justify-between px-5 py-4 hover:bg-warm-50 transition-all">
            <div class="flex items-center gap-3">
              <span class="text-xl">🙋</span>
              <div>
                <p class="text-sm font-semibold text-warm-900">Demandes d'adhésion</p>
                <p class="text-xs text-warm-500">Approuver ou refuser les demandes</p>
              </div>
            </div>
            <div class="flex items-center gap-2">
              @if (pendingCount() > 0) {
                <span class="text-xs font-bold text-white bg-red-500 rounded-full px-2 py-0.5 min-w-[1.5rem] text-center">
                  {{ pendingCount() }}
                </span>
              }
              <span class="text-warm-300">›</span>
            </div>
          </a>

          <a [routerLink]="['/groups', groupId, 'members']"
             class="flex items-center justify-between px-5 py-4 hover:bg-warm-50 transition-all">
            <div class="flex items-center gap-3">
              <span class="text-xl">👥</span>
              <div>
                <p class="text-sm font-semibold text-warm-900">Membres</p>
                <p class="text-xs text-warm-500">Gérer les rôles et expulsions</p>
              </div>
            </div>
            <span class="text-warm-300">›</span>
          </a>

          <a [routerLink]="['/groups', groupId, 'admin', 'reports']"
             class="flex items-center justify-between px-5 py-4 hover:bg-warm-50 transition-all">
            <div class="flex items-center gap-3">
              <span class="text-xl">🚩</span>
              <div>
                <p class="text-sm font-semibold text-warm-900">Signalements</p>
                <p class="text-xs text-warm-500">Contenu signalé par les membres</p>
              </div>
            </div>
            <span class="text-warm-300">›</span>
          </a>
        </div>

        <!-- Danger zone -->
        @if (group()!.myRole === 'OWNER') {
          <div class="mt-6 p-4 bg-red-50 border border-red-200 rounded-2xl">
            <h3 class="text-sm font-bold text-red-700 mb-2">Zone dangereuse</h3>
            <p class="text-xs text-red-500 mb-3">La suppression du groupe est irréversible.</p>
            <button (click)="deleteGroup()"
                    class="px-4 py-2 text-xs font-semibold text-white bg-red-500 rounded-xl hover:bg-red-600 transition-all">
              Supprimer le groupe
            </button>
          </div>
        }
      }
    </div>
  `,
})
export class GroupAdminComponent implements OnInit {
  private route        = inject(ActivatedRoute);
  private groupService = inject(GroupService);
  private toast        = inject(ToastService);

  groupId      = 0;
  group        = signal<Group | null>(null);
  loading      = signal(true);
  pendingCount = signal(0);

  ngOnInit(): void {
    this.groupId = +this.route.snapshot.paramMap.get('id')!;
    this.groupService.getGroupById(this.groupId).subscribe({
      next: res => { this.group.set(res.data); this.loading.set(false); },
      error: ()  => { this.loading.set(false); this.toast.error('Impossible de charger le groupe'); },
    });
    this.groupService.getJoinRequests(this.groupId).subscribe({
      next: res => this.pendingCount.set(res.data?.length ?? 0),
      error: () => {},
    });
  }

  deleteGroup(): void {
    const name = this.group()?.name;
    if (!confirm(`Supprimer définitivement "${name}" ? Cette action est irréversible.`)) return;
    this.groupService.deleteGroup(this.groupId).subscribe({
      next: () => {
        this.toast.success('Groupe supprimé');
        window.location.href = '/groups';
      },
      error: err => this.toast.error(err.error?.message ?? 'Impossible de supprimer'),
    });
  }
}
