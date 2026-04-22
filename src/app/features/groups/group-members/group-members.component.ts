import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { GroupService } from '../../../core/services/group.service';
import { ToastService } from '../../../core/services/toast.service';
import { GroupMember, GroupRole } from '../../../core/models/group.model';
import { Page } from '../../../core/models/capture.model';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

const ROLE_LABELS: Record<GroupRole, string> = {
  OWNER: 'Fondateur', ADMIN: 'Admin', MODERATOR: 'Modérateur', MEMBER: 'Membre',
};
const ROLE_COLORS: Record<GroupRole, string> = {
  OWNER: 'bg-amber-100 text-amber-700',
  ADMIN: 'bg-forest-100 text-forest-700',
  MODERATOR: 'bg-blue-100 text-blue-700',
  MEMBER: 'bg-warm-100 text-warm-600',
};

@Component({
  selector: 'app-group-members',
  standalone: true,
  imports: [FormsModule, RouterLink, LoadingSpinnerComponent],
  template: `
    <div class="max-w-3xl mx-auto px-5 py-8">
      <!-- Header -->
      <div class="flex items-center gap-3 mb-6">
        <a [routerLink]="['/groups', groupId]" class="text-warm-400 hover:text-warm-700 transition-colors text-lg">←</a>
        <div>
          <h1 class="text-xl font-bold text-warm-900">Membres</h1>
          <p class="text-sm text-warm-500 mt-0.5">{{ page()?.totalElements ?? 0 }} membres au total</p>
        </div>
      </div>

      <!-- Search -->
      <div class="mb-4">
        <input
          type="text"
          [(ngModel)]="search"
          (ngModelChange)="onSearchChange()"
          placeholder="Rechercher un membre..."
          class="w-full px-4 py-2.5 border border-warm-300 rounded-xl text-sm focus:outline-none focus:border-forest-500 focus:ring-1 focus:ring-forest-500"
        />
      </div>

      @if (loading()) {
        <app-loading-spinner />
      } @else if (members().length === 0) {
        <div class="text-center py-12 border-2 border-dashed border-warm-300 rounded-2xl">
          <p class="text-sm text-warm-500">Aucun membre trouvé</p>
        </div>
      } @else {
        <div class="bg-white border border-warm-200 rounded-2xl shadow-sm divide-y divide-warm-100">
          @for (member of members(); track member.userId) {
            <div class="flex items-center gap-3 px-4 py-3">
              <div class="w-9 h-9 rounded-full bg-forest-600 text-white text-sm flex items-center justify-center font-bold shrink-0">
                {{ member.username.charAt(0).toUpperCase() }}
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 flex-wrap">
                  <span class="text-sm font-semibold text-warm-900 truncate">{{ member.username }}</span>
                  <span class="text-xs font-semibold px-2 py-0.5 rounded-full {{ getRoleColor(member.role) }}">
                    {{ getRoleLabel(member.role) }}
                  </span>
                </div>
                <p class="text-xs text-warm-400 mt-0.5">
                  {{ member.captureCount }} capture{{ member.captureCount > 1 ? 's' : '' }} ·
                  Depuis {{ formatDate(member.joinedAt) }}
                </p>
              </div>

              <!-- Admin actions -->
              @if (isAdmin && member.role !== 'OWNER') {
                <div class="flex items-center gap-2 shrink-0">
                  <select
                    [value]="member.role"
                    (change)="changeRole(member, $any($event.target).value)"
                    class="text-xs px-2 py-1 border border-warm-300 rounded-lg focus:outline-none focus:border-forest-500"
                  >
                    <option value="ADMIN">Admin</option>
                    <option value="MODERATOR">Modérateur</option>
                    <option value="MEMBER">Membre</option>
                  </select>
                  <button (click)="kickMember(member)"
                          class="px-3 py-1 text-xs font-semibold text-red-500 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-all">
                    Expulser
                  </button>
                </div>
              }
            </div>
          }
        </div>

        <!-- Pagination -->
        @if ((page()?.totalPages ?? 0) > 1) {
          <div class="flex justify-center items-center gap-2 mt-6">
            <button (click)="loadPage(currentPage() - 1)" [disabled]="currentPage() === 0"
                    class="px-4 py-2 text-sm font-medium text-warm-600 bg-white border border-warm-200 rounded-xl hover:bg-warm-50 disabled:opacity-30 transition-all">
              ← Précédent
            </button>
            <span class="px-3 text-sm text-warm-500">{{ currentPage() + 1 }} / {{ page()?.totalPages }}</span>
            <button (click)="loadPage(currentPage() + 1)"
                    [disabled]="currentPage() >= (page()?.totalPages ?? 1) - 1"
                    class="px-4 py-2 text-sm font-medium text-warm-600 bg-white border border-warm-200 rounded-xl hover:bg-warm-50 disabled:opacity-30 transition-all">
              Suivant →
            </button>
          </div>
        }
      }
    </div>
  `,
})
export class GroupMembersComponent implements OnInit {
  private route        = inject(ActivatedRoute);
  private groupService = inject(GroupService);
  private toast        = inject(ToastService);

  groupId     = 0;
  isAdmin     = false;
  page        = signal<Page<GroupMember> | null>(null);
  members     = signal<GroupMember[]>([]);
  loading     = signal(true);
  currentPage = signal(0);
  search      = '';

  private searchTimeout: ReturnType<typeof setTimeout> | null = null;

  ngOnInit(): void {
    this.groupId = +this.route.snapshot.paramMap.get('id')!;
    // Check if admin by loading group info
    this.groupService.getGroupById(this.groupId).subscribe({
      next: res => {
        const role = res.data.myRole;
        this.isAdmin = role === 'OWNER' || role === 'ADMIN';
      },
    });
    this.loadPage(0);
  }

  loadPage(p: number): void {
    this.loading.set(true);
    this.groupService.getMembers(this.groupId, this.search, p).subscribe({
      next: res => {
        this.page.set(res.data);
        this.members.set(res.data.content);
        this.currentPage.set(p);
        this.loading.set(false);
      },
      error: () => { this.loading.set(false); this.toast.error('Impossible de charger les membres'); },
    });
  }

  onSearchChange(): void {
    if (this.searchTimeout) clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => this.loadPage(0), 400);
  }

  changeRole(member: GroupMember, role: GroupRole): void {
    this.groupService.changeMemberRole(this.groupId, member.userId, role).subscribe({
      next: () => {
        this.members.update(prev => prev.map(m => m.userId === member.userId ? { ...m, role } : m));
        this.toast.success('Rôle modifié');
      },
      error: err => this.toast.error(err.error?.message ?? 'Impossible de changer le rôle'),
    });
  }

  kickMember(member: GroupMember): void {
    if (!confirm(`Expulser ${member.username} du groupe ?`)) return;
    this.groupService.kickMember(this.groupId, member.userId).subscribe({
      next: () => {
        this.members.update(prev => prev.filter(m => m.userId !== member.userId));
        this.toast.success(`${member.username} a été expulsé`);
      },
      error: err => this.toast.error(err.error?.message ?? 'Impossible d\'expulser'),
    });
  }

  getRoleLabel(role: GroupRole): string { return ROLE_LABELS[role] ?? role; }
  getRoleColor(role: GroupRole): string { return ROLE_COLORS[role] ?? 'bg-warm-100 text-warm-600'; }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
  }
}
