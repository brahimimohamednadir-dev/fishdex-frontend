import { Component, OnInit, OnDestroy, inject, signal, HostListener } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { GroupService } from '../../../core/services/group.service';
import { PostService } from '../../../core/services/post.service';
import { ToastService } from '../../../core/services/toast.service';
import { AuthService } from '../../../core/services/auth.service';
import { Group } from '../../../core/models/group.model';
import { Post, Comment, REACTION_EMOJIS, ReactionType } from '../../../core/models/post.model';
import { Page } from '../../../core/models/capture.model';
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

const CATEGORY_LABELS: Record<string, string> = {
  CLUB: 'Club', ASSOCIATION: 'Association', FRIENDS: 'Amis', COMPETITION: 'Compétition',
};

@Component({
  selector: 'app-group-detail',
  standalone: true,
  imports: [FormsModule, RouterLink, LoadingSpinnerComponent],
  template: `
    <div class="max-w-2xl mx-auto px-5 py-8">

      @if (loading()) {
        <app-loading-spinner />
      } @else if (loadError()) {
        <div class="p-4 bg-red-50 border border-red-100 rounded-2xl text-sm text-red-600">{{ loadError() }}</div>
      } @else if (group()) {

        <!-- Header card -->
        <div class="bg-white border border-warm-200 rounded-2xl shadow-sm overflow-hidden mb-5">
          @if (group()!.coverPhotoUrl) {
            <img [src]="group()!.coverPhotoUrl" [alt]="group()!.name" class="w-full h-36 object-cover">
          }
          <div class="p-5">
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <div class="flex items-center gap-2 flex-wrap mb-1">
                  <h1 class="text-xl font-bold text-warm-900 tracking-tight">{{ group()!.name }}</h1>
                  @if (group()!.isPro) {
                    <span class="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">PRO</span>
                  }
                </div>
                <div class="flex items-center gap-1.5 flex-wrap mb-2">
                  <span class="text-xs font-semibold px-2 py-0.5 rounded-full bg-forest-100 text-forest-700">
                    {{ categoryLabel(group()!.category) }}
                  </span>
                  <span class="text-xs px-2 py-0.5 rounded-full bg-warm-100 text-warm-600">
                    {{ visibilityLabel(group()!.visibility) }}
                  </span>
                </div>
                @if (group()!.description) {
                  <p class="text-sm text-warm-600 mb-2">{{ group()!.description }}</p>
                }
                <p class="text-xs text-warm-400">
                  {{ group()!.memberCount }} membre{{ group()!.memberCount > 1 ? 's' : '' }}
                  · {{ group()!.postCount }} post{{ group()!.postCount > 1 ? 's' : '' }}
                  · Créé par <span class="font-medium text-warm-600">{{ group()!.creatorUsername }}</span>
                </p>
              </div>

              <!-- Membership button -->
              <div class="shrink-0 flex flex-col gap-2">
                @if (group()!.myStatus === 'MEMBER') {
                  <button (click)="leaveGroup()" [disabled]="actionLoading()"
                          class="px-4 py-2 text-xs font-semibold text-warm-600 bg-warm-50 border border-warm-300 rounded-xl hover:bg-warm-100 disabled:opacity-50 transition-all">
                    @if (actionLoading()) { Départ... } @else { Quitter }
                  </button>
                } @else if (group()!.myStatus === 'PENDING') {
                  <span class="px-4 py-2 text-xs font-semibold text-amber-600 bg-amber-50 border border-amber-200 rounded-xl">
                    En attente
                  </span>
                } @else {
                  <button (click)="joinGroup()" [disabled]="actionLoading()"
                          class="px-4 py-2 text-xs font-semibold text-white bg-forest-600 rounded-xl hover:bg-forest-700 disabled:opacity-50 transition-all">
                    @if (actionLoading()) {
                      <span class="flex items-center gap-1.5">
                        <span class="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      </span>
                    } @else {
                      {{ group()!.visibility === 'PUBLIC' ? 'Rejoindre' : 'Demander' }}
                    }
                  </button>
                }
                @if (isAdmin()) {
                  <a [routerLink]="['/groups', group()!.id, 'admin']"
                     class="px-4 py-2 text-xs font-semibold text-center text-forest-700 bg-forest-50 border border-forest-200 rounded-xl hover:bg-forest-100 transition-all">
                    Admin
                  </a>
                }
              </div>
            </div>

            <!-- Rules (expandable) -->
            @if (group()!.rules) {
              <div class="mt-3 pt-3 border-t border-warm-100">
                <button (click)="rulesOpen.set(!rulesOpen())"
                        class="flex items-center gap-1 text-xs font-semibold text-warm-600 hover:text-warm-900 transition-colors">
                  📋 Règles du groupe
                  <span class="text-warm-400">{{ rulesOpen() ? '▲' : '▼' }}</span>
                </button>
                @if (rulesOpen()) {
                  <p class="text-xs text-warm-500 mt-2 whitespace-pre-line">{{ group()!.rules }}</p>
                }
              </div>
            }
          </div>
        </div>

        <!-- PRIVATE / SECRET group → blur if not member -->
        @if (group()!.visibility !== 'PUBLIC' && group()!.myStatus !== 'MEMBER') {
          <div class="relative rounded-2xl overflow-hidden">
            <div class="blur-sm pointer-events-none select-none space-y-3">
              @for (n of [1,2,3]; track n) {
                <div class="bg-white border border-warm-200 rounded-2xl p-5 h-32"></div>
              }
            </div>
            <div class="absolute inset-0 flex flex-col items-center justify-center bg-warm-50/70 backdrop-blur-sm rounded-2xl">
              <p class="text-lg font-bold text-warm-800 mb-1">Groupe privé</p>
              <p class="text-sm text-warm-500 mb-4">Rejoins ce groupe pour voir le feed</p>
              @if (group()!.myStatus !== 'PENDING') {
                <button (click)="joinGroup()" [disabled]="actionLoading()"
                        class="px-5 py-2.5 text-sm font-semibold text-white bg-forest-600 rounded-xl hover:bg-forest-700 disabled:opacity-50 transition-all">
                  Demander à rejoindre
                </button>
              } @else {
                <span class="text-sm text-amber-600 font-semibold">Demande en attente d'approbation</span>
              }
            </div>
          </div>
        } @else {

          <!-- Post composer (if member) -->
          @if (group()!.myStatus === 'MEMBER') {
            <div class="bg-white border border-warm-200 rounded-2xl shadow-sm p-4 mb-5">
              <textarea
                [(ngModel)]="composerText"
                [maxlength]="500"
                placeholder="Partage quelque chose avec le groupe..."
                rows="3"
                class="w-full px-3 py-2 border border-warm-300 rounded-xl text-sm focus:outline-none focus:border-forest-500 focus:ring-1 focus:ring-forest-500 resize-none"
              ></textarea>
              <div class="flex items-center justify-between mt-2">
                <span class="text-xs text-warm-400">{{ composerText.length }}/500</span>
                <button (click)="createPost()"
                        [disabled]="!composerText.trim() || postSubmitting()"
                        class="px-4 py-2 text-xs font-semibold text-white bg-forest-600 rounded-xl hover:bg-forest-700 disabled:opacity-50 transition-all flex items-center gap-2">
                  @if (postSubmitting()) {
                    <span class="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  }
                  Publier
                </button>
              </div>
            </div>
          }

          <!-- New posts banner -->
          @if (hasNewPosts()) {
            <div class="text-center mb-4">
              <button (click)="reloadFeed()"
                      class="px-4 py-2 text-xs font-semibold text-forest-700 bg-forest-50 border border-forest-200 rounded-full hover:bg-forest-100 transition-all">
                ↑ Nouveaux posts disponibles
              </button>
            </div>
          }

          <!-- Feed -->
          @if (feedLoading() && posts().length === 0) {
            <app-loading-spinner />
          } @else if (posts().length === 0) {
            <div class="text-center py-16 border-2 border-dashed border-warm-300 rounded-2xl">
              <div class="text-4xl mb-3 opacity-30">💬</div>
              <p class="text-sm text-warm-500">Aucun post pour l'instant. Sois le premier !</p>
            </div>
          } @else {
            <div class="space-y-4">
              @for (post of posts(); track post.id) {
                <div class="bg-white border border-warm-200 rounded-2xl shadow-sm overflow-hidden"
                     [class.border-amber-300]="post.pinned">
                  @if (post.pinned) {
                    <div class="px-4 py-1.5 bg-amber-50 border-b border-amber-200 flex items-center gap-1.5">
                      <span class="text-xs">📌</span>
                      <span class="text-xs font-semibold text-amber-700">Post épinglé</span>
                    </div>
                  }

                  <div class="p-4">
                    <!-- Author + date + menu -->
                    <div class="flex items-start justify-between gap-2 mb-3">
                      <div class="flex items-center gap-2.5">
                        <div class="w-8 h-8 rounded-full bg-forest-600 text-white text-xs flex items-center justify-center font-bold shrink-0">
                          {{ post.username.charAt(0).toUpperCase() }}
                        </div>
                        <div>
                          <p class="text-sm font-semibold text-warm-900 leading-tight">{{ post.username }}</p>
                          <p class="text-xs text-warm-400">{{ timeAgo(post.createdAt) }}{{ post.editedAt ? ' · modifié' : '' }}</p>
                        </div>
                      </div>

                      <!-- Post menu -->
                      @if (post.canEdit || post.canDelete || post.canPin || !post.reported) {
                        <div class="relative">
                          <button (click)="togglePostMenu(post.id)"
                                  class="w-7 h-7 flex items-center justify-center rounded-lg text-warm-400 hover:text-warm-700 hover:bg-warm-100 transition-all text-base leading-none">
                            ···
                          </button>
                          @if (openPostMenu() === post.id) {
                            <div class="absolute right-0 top-8 z-10 bg-white border border-warm-200 rounded-xl shadow-lg py-1 min-w-[140px]">
                              @if (post.canEdit && isWithinEditWindow(post.createdAt)) {
                                <button (click)="startEditPost(post)"
                                        class="w-full text-left px-3 py-2 text-xs text-warm-700 hover:bg-warm-50 transition-all">
                                  ✏️ Modifier
                                </button>
                              }
                              @if (post.canPin) {
                                <button (click)="togglePin(post)"
                                        class="w-full text-left px-3 py-2 text-xs text-warm-700 hover:bg-warm-50 transition-all">
                                  {{ post.pinned ? '📌 Désépingler' : '📌 Épingler' }}
                                </button>
                              }
                              @if (!post.reported) {
                                <button (click)="reportPost(post)"
                                        class="w-full text-left px-3 py-2 text-xs text-warm-500 hover:bg-warm-50 transition-all">
                                  🚩 Signaler
                                </button>
                              }
                              @if (post.canDelete) {
                                <button (click)="deletePost(post)"
                                        class="w-full text-left px-3 py-2 text-xs text-red-500 hover:bg-red-50 transition-all">
                                  🗑 Supprimer
                                </button>
                              }
                            </div>
                          }
                        </div>
                      }
                    </div>

                    <!-- Edit mode -->
                    @if (editingPostId() === post.id) {
                      <div class="mb-3">
                        <textarea
                          [(ngModel)]="editText"
                          rows="3"
                          maxlength="500"
                          class="w-full px-3 py-2 border border-warm-300 rounded-xl text-sm focus:outline-none focus:border-forest-500 focus:ring-1 focus:ring-forest-500 resize-none"
                        ></textarea>
                        <div class="flex gap-2 mt-2">
                          <button (click)="cancelEdit()" [disabled]="savingEdit()"
                                  class="px-3 py-1.5 text-xs text-warm-600 bg-warm-100 rounded-lg hover:bg-warm-200 disabled:opacity-50 transition-all">Annuler</button>
                          <button (click)="saveEdit(post)" [disabled]="savingEdit() || !editText.trim()"
                                  class="px-3 py-1.5 text-xs text-white bg-forest-600 rounded-lg hover:bg-forest-700 disabled:opacity-50 transition-all flex items-center gap-1.5">
                            @if (savingEdit()) {
                              <span class="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                            }
                            Sauvegarder
                          </button>
                        </div>
                      </div>
                    } @else {
                      <!-- Content -->
                      <p class="text-sm text-warm-800 whitespace-pre-line mb-3">{{ post.content }}</p>
                    }

                    <!-- Photos grid -->
                    @if (post.photoUrls && post.photoUrls.length > 0) {
                      <div [class]="post.photoUrls.length === 1 ? 'mb-3' : 'grid grid-cols-2 gap-1 mb-3'">
                        @for (photo of post.photoUrls.slice(0, 4); track photo) {
                          <img [src]="photo" alt="Photo du post"
                               class="w-full aspect-square object-cover rounded-xl">
                        }
                      </div>
                    }

                    <!-- Attached capture -->
                    @if (post.capture) {
                      <div class="flex items-center gap-3 p-3 bg-warm-50 border border-warm-200 rounded-xl mb-3">
                        <span class="text-xl">🐟</span>
                        <div>
                          <p class="text-xs font-semibold text-warm-800">{{ post.capture.speciesName }}</p>
                          <p class="text-xs text-warm-500">{{ post.capture.weight }} kg · {{ post.capture.length }} cm</p>
                        </div>
                      </div>
                    }

                    <!-- Reactions bar -->
                    <div class="flex items-center gap-2 pt-3 border-t border-warm-100">
                      <!-- Top 3 reaction emojis -->
                      <div class="flex items-center gap-1 flex-1">
                        @for (r of topReactions(post); track r.type) {
                          <button
                            (click)="toggleReaction(post, r.type)"
                            [class]="r.reacted
                              ? 'flex items-center gap-1 px-2 py-1 rounded-lg bg-forest-100 border border-forest-300 text-xs font-semibold text-forest-700 transition-all'
                              : 'flex items-center gap-1 px-2 py-1 rounded-lg bg-warm-50 border border-warm-200 text-xs text-warm-600 hover:bg-warm-100 transition-all'"
                          >
                            {{ reactionEmoji(r.type) }} {{ r.count }}
                          </button>
                        }
                        @if (post.totalReactions === 0) {
                          <button (click)="toggleReactionPicker(post.id)"
                                  class="flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-warm-400 hover:text-warm-600 hover:bg-warm-50 transition-all">
                            👍 Réagir
                          </button>
                        }
                        <!-- Reaction picker -->
                        @if (openReactionPicker() === post.id) {
                          <div class="flex items-center gap-1 p-1.5 bg-white border border-warm-200 rounded-xl shadow-lg">
                            @for (type of reactionTypes; track type) {
                              <button (click)="addReaction(post, type)"
                                      class="w-8 h-8 flex items-center justify-center rounded-lg text-base hover:bg-warm-100 transition-all">
                                {{ reactionEmoji(type) }}
                              </button>
                            }
                          </div>
                        }
                      </div>

                      <!-- Comment count -->
                      <button (click)="toggleComments(post.id)"
                              class="flex items-center gap-1 text-xs text-warm-400 hover:text-warm-700 transition-colors">
                        💬 {{ post.commentCount }}
                      </button>
                    </div>

                    <!-- Comments section -->
                    @if (openComments() === post.id) {
                      <div class="mt-3 pt-3 border-t border-warm-100 space-y-3">
                        @for (comment of post.comments.slice(0, 2); track comment.id) {
                          <div class="flex gap-2">
                            <div class="w-6 h-6 rounded-full bg-warm-300 text-warm-700 text-xs flex items-center justify-center font-bold shrink-0">
                              {{ comment.username.charAt(0).toUpperCase() }}
                            </div>
                            <div class="flex-1 bg-warm-50 rounded-xl px-3 py-2">
                              <p class="text-xs font-semibold text-warm-800">{{ comment.username }}</p>
                              <p class="text-xs text-warm-700 mt-0.5">{{ comment.content }}</p>
                            </div>
                            @if (comment.canDelete) {
                              <button (click)="deleteComment(post, comment)"
                                      class="text-warm-300 hover:text-red-500 transition-colors text-xs mt-1 shrink-0">✕</button>
                            }
                          </div>
                        }
                        @if (post.commentCount > 2) {
                          <button (click)="loadMoreComments(post)"
                                  class="text-xs text-forest-600 hover:text-forest-800 font-semibold transition-colors">
                            Voir les {{ post.commentCount }} commentaires
                          </button>
                        }
                        <!-- New comment -->
                        @if (group()!.myStatus === 'MEMBER') {
                          <div class="flex gap-2">
                            <div class="w-6 h-6 rounded-full bg-forest-600 text-white text-xs flex items-center justify-center font-bold shrink-0">
                              {{ currentUsername().charAt(0).toUpperCase() }}
                            </div>
                            <input
                              type="text"
                              [(ngModel)]="commentTexts[post.id]"
                              (keydown.enter)="submitComment(post)"
                              placeholder="Ajouter un commentaire..."
                              class="flex-1 px-3 py-1.5 border border-warm-300 rounded-xl text-xs focus:outline-none focus:border-forest-500 focus:ring-1 focus:ring-forest-500"
                            />
                          </div>
                        }
                      </div>
                    }
                  </div>
                </div>
              }

              @if (feedLoading()) {
                <div class="flex justify-center py-4">
                  <div class="w-6 h-6 border-2 border-warm-200 border-t-forest-600 rounded-full animate-spin"></div>
                </div>
              }
              @if (noMorePosts()) {
                <p class="text-center text-xs text-warm-400 py-4">— Fin du feed —</p>
              }
            </div>
          }
        }
      }
    </div>
  `,
})
export class GroupDetailComponent implements OnInit, OnDestroy {
  private route        = inject(ActivatedRoute);
  private router       = inject(Router);
  private groupService = inject(GroupService);
  private postService  = inject(PostService);
  private toast        = inject(ToastService);
  private auth         = inject(AuthService);

  group         = signal<Group | null>(null);
  posts         = signal<Post[]>([]);
  loading       = signal(true);
  loadError     = signal('');
  feedLoading   = signal(false);
  actionLoading = signal(false);
  postSubmitting = signal(false);
  hasNewPosts   = signal(false);
  noMorePosts   = signal(false);
  rulesOpen     = signal(false);

  editingPostId = signal<number | null>(null);
  editText      = '';
  savingEdit    = signal(false);

  openPostMenu      = signal<number | null>(null);
  openReactionPicker = signal<number | null>(null);
  openComments       = signal<number | null>(null);

  composerText = '';
  commentTexts: Record<number, string> = {};

  private currentPage = 0;
  private groupId     = 0;

  readonly reactionTypes: ReactionType[] = ['LIKE', 'FIRE', 'TROPHY', 'WOW'];
  readonly timeAgo = timeAgo;

  currentUsername = signal('');

  ngOnInit(): void {
    this.groupId = +this.route.snapshot.paramMap.get('id')!;
    const user = this.auth.currentUser$.getValue();
    if (user) this.currentUsername.set(user.username);

    this.groupService.getGroupById(this.groupId).subscribe({
      next: res => {
        this.group.set(res.data);
        this.loading.set(false);
        if (res.data.myStatus === 'MEMBER' || res.data.visibility === 'PUBLIC') {
          this.loadFeed(0);
        }
      },
      error: err => {
        this.loadError.set(err.error?.message ?? 'Groupe introuvable');
        this.loading.set(false);
      },
    });
  }

  ngOnDestroy(): void {}

  get isAdmin(): () => boolean {
    return () => {
      const role = this.group()?.myRole;
      return role === 'OWNER' || role === 'ADMIN';
    };
  }

  loadFeed(page: number): void {
    this.feedLoading.set(true);
    this.postService.getPosts(this.groupId, page).subscribe({
      next: res => {
        const pageData: Page<Post> = res.data;
        if (page === 0) {
          this.posts.set(pageData.content);
        } else {
          this.posts.update(prev => [...prev, ...pageData.content]);
        }
        this.currentPage = page;
        this.noMorePosts.set(page >= pageData.totalPages - 1);
        this.feedLoading.set(false);
        this.hasNewPosts.set(false);
      },
      error: () => this.feedLoading.set(false),
    });
  }

  reloadFeed(): void { this.loadFeed(0); }

  @HostListener('window:scroll')
  onScroll(): void {
    if (this.feedLoading() || this.noMorePosts()) return;
    if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 300) {
      this.loadFeed(this.currentPage + 1);
    }
  }

  @HostListener('document:click')
  onDocClick(): void {
    this.openPostMenu.set(null);
    this.openReactionPicker.set(null);
  }

  joinGroup(): void {
    this.actionLoading.set(true);
    this.groupService.joinGroup(this.groupId).subscribe({
      next: res => {
        this.group.set(res.data);
        this.actionLoading.set(false);
        if (res.data.myStatus === 'MEMBER') {
          this.toast.success(`Tu as rejoint "${res.data.name}" !`);
          this.loadFeed(0);
        } else {
          this.toast.info('Demande envoyée !');
        }
      },
      error: err => {
        this.actionLoading.set(false);
        this.toast.error(err.error?.message ?? 'Impossible de rejoindre le groupe');
      },
    });
  }

  leaveGroup(): void {
    if (this.actionLoading()) return;
    if (!confirm('Quitter ce groupe ?')) return;
    this.actionLoading.set(true);
    this.groupService.leaveGroup(this.groupId).subscribe({
      next: () => {
        this.toast.info('Tu as quitté le groupe');
        this.router.navigate(['/groups']);
      },
      error: err => {
        this.actionLoading.set(false);
        this.toast.error(err.error?.message ?? 'Impossible de quitter');
      },
    });
  }

  createPost(): void {
    if (!this.composerText.trim() || this.postSubmitting()) return;
    this.postSubmitting.set(true);
    this.postService.createPost(this.groupId, { content: this.composerText.trim() }).subscribe({
      next: res => {
        this.posts.update(prev => [res.data, ...prev]);
        this.composerText = '';
        this.postSubmitting.set(false);
        this.toast.success('Post publié !');
      },
      error: err => {
        this.postSubmitting.set(false);
        this.toast.error(err.error?.message ?? 'Impossible de publier');
      },
    });
  }

  togglePostMenu(id: number): void {
    event?.stopPropagation();
    this.openPostMenu.update(cur => cur === id ? null : id);
    this.openReactionPicker.set(null);
  }

  startEditPost(post: Post): void {
    this.editingPostId.set(post.id);
    this.editText = post.content;
    this.openPostMenu.set(null);
  }

  cancelEdit(): void { this.editingPostId.set(null); this.editText = ''; }

  saveEdit(post: Post): void {
    if (!this.editText.trim() || this.savingEdit()) return;
    this.savingEdit.set(true);
    this.postService.updatePost(this.groupId, post.id, this.editText.trim()).subscribe({
      next: res => {
        this.posts.update(prev => prev.map(p => p.id === post.id ? res.data : p));
        this.savingEdit.set(false);
        this.cancelEdit();
      },
      error: err => {
        this.savingEdit.set(false);
        this.toast.error(err.error?.message ?? 'Impossible de modifier');
      },
    });
  }

  deletePost(post: Post): void {
    if (!confirm('Supprimer ce post ?')) return;
    this.openPostMenu.set(null);
    this.postService.deletePost(this.groupId, post.id).subscribe({
      next: () => {
        this.posts.update(prev => prev.filter(p => p.id !== post.id));
        this.toast.success('Post supprimé');
      },
      error: err => this.toast.error(err.error?.message ?? 'Impossible de supprimer'),
    });
  }

  togglePin(post: Post): void {
    this.openPostMenu.set(null);
    const obs = post.pinned
      ? this.postService.unpinPost(this.groupId, post.id)
      : this.postService.pinPost(this.groupId, post.id);
    obs.subscribe({
      next: () => {
        this.posts.update(prev => prev.map(p => p.id === post.id ? { ...p, pinned: !p.pinned } : p));
      },
      error: err => this.toast.error(err.error?.message ?? 'Erreur'),
    });
  }

  reportPost(post: Post): void {
    this.openPostMenu.set(null);
    this.postService.reportPost(this.groupId, post.id).subscribe({
      next: () => {
        this.posts.update(prev => prev.map(p => p.id === post.id ? { ...p, reported: true } : p));
        this.toast.info('Post signalé');
      },
      error: err => this.toast.error(err.error?.message ?? 'Erreur'),
    });
  }

  topReactions(post: Post) {
    return post.reactions
      .filter(r => r.count > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);
  }

  reactionEmoji(type: ReactionType): string { return REACTION_EMOJIS[type]; }

  toggleReactionPicker(id: number): void {
    event?.stopPropagation();
    this.openReactionPicker.update(cur => cur === id ? null : id);
  }

  toggleReaction(post: Post, type: ReactionType): void {
    event?.stopPropagation();
    const existing = post.reactions.find(r => r.reacted);
    if (existing && existing.type === type) {
      this.postService.removeReaction(this.groupId, post.id).subscribe({
        next: () => this.updateReaction(post, type, false),
        error: () => {},
      });
    } else {
      this.addReaction(post, type);
    }
    this.openReactionPicker.set(null);
  }

  addReaction(post: Post, type: ReactionType): void {
    event?.stopPropagation();
    // Remove old if existed
    const old = post.reactions.find(r => r.reacted);
    if (old) {
      this.updateReaction(post, old.type, false);
    }
    this.postService.addReaction(this.groupId, post.id, type).subscribe({
      next: () => this.updateReaction(post, type, true),
      error: () => {},
    });
    this.openReactionPicker.set(null);
  }

  private updateReaction(post: Post, type: ReactionType, reacted: boolean): void {
    this.posts.update(prev => prev.map(p => {
      if (p.id !== post.id) return p;
      const reactions = p.reactions.map(r => {
        if (r.type === type) return { ...r, count: r.count + (reacted ? 1 : -1), reacted };
        if (reacted && r.reacted) return { ...r, reacted: false };
        return r;
      });
      const total = reactions.reduce((s, r) => s + r.count, 0);
      return { ...p, reactions, totalReactions: total };
    }));
  }

  toggleComments(id: number): void {
    this.openComments.update(cur => cur === id ? null : id);
  }

  loadMoreComments(post: Post): void {
    this.postService.getComments(this.groupId, post.id).subscribe({
      next: res => {
        this.posts.update(prev => prev.map(p => p.id === post.id ? { ...p, comments: res.data } : p));
      },
      error: () => {},
    });
  }

  submitComment(post: Post): void {
    const text = this.commentTexts[post.id]?.trim();
    if (!text) return;
    this.postService.addComment(this.groupId, post.id, text).subscribe({
      next: res => {
        this.commentTexts[post.id] = '';
        this.posts.update(prev => prev.map(p => p.id === post.id
          ? { ...p, comments: [...p.comments, res.data], commentCount: p.commentCount + 1 }
          : p
        ));
      },
      error: err => this.toast.error(err.error?.message ?? 'Impossible de commenter'),
    });
  }

  deleteComment(post: Post, comment: Comment): void {
    this.postService.deleteComment(this.groupId, post.id, comment.id).subscribe({
      next: () => {
        this.posts.update(prev => prev.map(p => p.id === post.id
          ? { ...p, comments: p.comments.filter(c => c.id !== comment.id), commentCount: p.commentCount - 1 }
          : p
        ));
      },
      error: err => this.toast.error(err.error?.message ?? 'Erreur'),
    });
  }

  isWithinEditWindow(createdAt: string): boolean {
    return (Date.now() - new Date(createdAt).getTime()) < 15 * 60 * 1000;
  }

  categoryLabel(cat: string): string { return CATEGORY_LABELS[cat] ?? cat; }
  visibilityLabel(v: string): string {
    return v === 'PUBLIC' ? 'Public' : v === 'PRIVATE' ? 'Privé' : 'Secret';
  }
}
