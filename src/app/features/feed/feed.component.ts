import {
  Component, OnInit, inject, signal, computed,
  ElementRef, ViewChild, AfterViewInit, OnDestroy
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { Subject } from 'rxjs';
import { FeedService } from '../../core/services/feed.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { FeedCapture, FeedComment } from '../../core/models/feed.model';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return 'à l\'instant';
  if (m < 60) return `il y a ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `il y a ${h}h`;
  const d = Math.floor(h / 24);
  if (d < 7)  return `il y a ${d}j`;
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

@Component({
  selector: 'app-feed',
  standalone: true,
  imports: [RouterLink, FormsModule, DatePipe, LoadingSpinnerComponent],
  template: `
    <div class="max-w-xl mx-auto px-0 sm:px-4 py-4">

      <!-- Bannière "nouvelles captures" -->
      @if (newCount() > 0) {
        <button (click)="loadFresh()"
                class="w-full mb-4 py-2.5 text-sm font-semibold text-white bg-forest-600 rounded-2xl hover:bg-forest-700 transition-all shadow-sm animate-pulse">
          🎣 {{ newCount() }} nouvelle{{ newCount() > 1 ? 's' : '' }} capture{{ newCount() > 1 ? 's' : '' }} — Voir
        </button>
      }

      <!-- Skeletons loading initial -->
      @if (loading() && posts().length === 0) {
        <div class="space-y-4">
          @for (i of [1,2,3]; track i) {
            <div class="bg-white sm:rounded-2xl overflow-hidden border-b border-warm-100 sm:border sm:shadow-sm">
              <div class="flex items-center gap-3 px-4 py-3">
                <div class="w-9 h-9 rounded-full bg-warm-200 animate-pulse"></div>
                <div class="flex-1 space-y-1.5">
                  <div class="h-3 bg-warm-200 rounded animate-pulse w-24"></div>
                  <div class="h-2.5 bg-warm-200 rounded animate-pulse w-16"></div>
                </div>
              </div>
              <div class="aspect-square bg-warm-200 animate-pulse"></div>
              <div class="px-4 py-3 space-y-2">
                <div class="h-3 bg-warm-200 rounded animate-pulse w-3/4"></div>
                <div class="h-3 bg-warm-200 rounded animate-pulse w-1/2"></div>
              </div>
            </div>
          }
        </div>
      }

      <!-- Empty state -->
      @if (!loading() && posts().length === 0) {
        <div class="text-center py-20 px-6">
          <div class="text-6xl mb-4 opacity-20">🎣</div>
          <h2 class="text-lg font-semibold text-warm-900 mb-2">Ton feed est vide</h2>
          <p class="text-sm text-warm-500 mb-6 leading-relaxed">
            Ajoute des amis pour voir leurs captures ici, ou explore la communauté.
          </p>
          <a routerLink="/friends"
             class="inline-flex items-center gap-2 px-5 py-2.5 bg-forest-600 text-white text-sm font-semibold rounded-xl hover:bg-forest-700 transition-all">
            👥 Trouver des amis
          </a>
        </div>
      }

      <!-- Posts -->
      <div class="space-y-0">
        @for (post of posts(); track post.id) {
          <article class="bg-white border-b border-warm-100 sm:border sm:rounded-2xl sm:mb-4 sm:shadow-sm overflow-hidden">

            <!-- Header -->
            <div class="flex items-center gap-3 px-4 py-3">
              <!-- Avatar initiale -->
              <div class="w-9 h-9 rounded-full bg-gradient-to-br from-forest-400 to-forest-700 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                {{ post.username[0].toUpperCase() }}
              </div>
              <div class="flex-1 min-w-0">
                <a [routerLink]="['/u', post.username]"
                   class="text-sm font-semibold text-warm-900 leading-tight hover:text-forest-700 transition-colors">{{ post.username }}</a>
                <p class="text-xs text-warm-400">{{ timeAgo(post.createdAt) }}
                  @if (post.visibility === 'FRIENDS') { · <span class="text-forest-500">👥 Amis</span> }
                  @if (post.visibility === 'PRIVATE') { · <span class="text-warm-400">🔒 Privé</span> }
                </p>
              </div>
              <!-- Menu si propriétaire (placeholder) -->
              @if (isMe(post.userId)) {
                <span class="text-xs text-warm-400 bg-warm-100 px-2 py-0.5 rounded-full">Ma capture</span>
              }
            </div>

            <!-- Photo -->
            @if (post.photoUrl) {
              <div class="relative aspect-square bg-warm-100 cursor-pointer" (dblclick)="doubleTapLike(post)">
                <img [src]="post.photoUrl" [alt]="post.speciesName"
                     class="w-full h-full object-cover"
                     loading="lazy">
                <!-- Heart animation on double tap -->
                @if (heartAnim() === post.id) {
                  <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span class="text-7xl animate-bounce">❤️</span>
                  </div>
                }
              </div>
            } @else {
              <!-- Placeholder sans photo -->
              <div class="aspect-[4/3] bg-gradient-to-br from-warm-100 to-warm-200 flex flex-col items-center justify-center gap-2">
                <span class="text-5xl opacity-25">🐟</span>
                <p class="text-xs text-warm-400 font-medium">{{ post.speciesName }}</p>
              </div>
            }

            <!-- Actions -->
            <div class="flex items-center gap-1 px-3 pt-2 pb-1">
              <!-- Like -->
              <button (click)="toggleLike(post)"
                      class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all hover:bg-warm-50 active:scale-95"
                      [class.text-red-500]="post.hasLiked"
                      [class.text-warm-400]="!post.hasLiked">
                <svg class="w-5 h-5" [attr.fill]="post.hasLiked ? 'currentColor' : 'none'" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                </svg>
                @if (post.likeCount > 0) {
                  <span class="text-xs font-semibold">{{ post.likeCount }}</span>
                }
              </button>

              <!-- Comment -->
              <button (click)="openComments(post)"
                      class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-warm-400 hover:bg-warm-50 transition-all active:scale-95">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                </svg>
                @if (post.commentCount > 0) {
                  <span class="text-xs font-semibold">{{ post.commentCount }}</span>
                }
              </button>

              <div class="flex-1"></div>

              <!-- Lien vers l'espèce -->
              @if (post.speciesId) {
                <a [routerLink]="['/species', post.speciesId]"
                   class="text-xs text-forest-600 font-medium hover:underline flex items-center gap-1">
                  🔍 Fiche espèce
                </a>
              }
            </div>

            <!-- Infos capture -->
            <div class="px-4 pb-2">
              <p class="text-sm font-semibold text-warm-900">
                <span class="font-bold">{{ post.username }}</span>
                &nbsp;{{ post.speciesName }}
                @if (post.weight) { · <span class="text-forest-700">{{ post.weight }} kg</span> }
                @if (post.length) { · {{ post.length }} cm }
              </p>
              @if (post.note) {
                <p class="text-sm text-warm-600 mt-0.5 line-clamp-2">{{ post.note }}</p>
              }

              <!-- Preview commentaires -->
              @if (post.recentComments?.length) {
                <div class="mt-2 space-y-0.5">
                  @for (c of post.recentComments.slice(0, 2); track c.id) {
                    <p class="text-sm text-warm-700">
                      <span class="font-semibold">{{ c.username }}</span>
                      {{ c.content }}
                    </p>
                  }
                  @if (post.commentCount > 2) {
                    <button (click)="openComments(post)" class="text-xs text-warm-400 hover:text-warm-600">
                      Voir les {{ post.commentCount }} commentaires
                    </button>
                  }
                </div>
              }
            </div>

          </article>
        }
      </div>

      <!-- Infinite scroll sentinel -->
      <div #sentinel class="h-4"></div>

      <!-- Load more spinner -->
      @if (loading() && posts().length > 0) {
        <div class="flex justify-center py-6">
          <app-loading-spinner />
        </div>
      }

      <!-- Fin du feed -->
      @if (!loading() && noMore()) {
        <p class="text-center text-xs text-warm-400 py-8">Tu as tout vu 🎣</p>
      }

    </div>

    <!-- ── Modale commentaires ──────────────────────────────────────────── -->
    @if (activePost()) {
      <div class="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
           (click)="closeComments()">
        <div class="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
        <div class="relative w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl max-h-[80vh] flex flex-col"
             (click)="$event.stopPropagation()">

          <!-- Handle -->
          <div class="w-10 h-1 bg-warm-300 rounded-full mx-auto mt-3 mb-1 sm:hidden"></div>

          <div class="flex items-center justify-between px-5 py-3 border-b border-warm-100">
            <h3 class="font-semibold text-warm-900 text-sm">Commentaires</h3>
            <button (click)="closeComments()" class="text-warm-400 hover:text-warm-700 text-xl leading-none">×</button>
          </div>

          <!-- Liste -->
          <div class="flex-1 overflow-y-auto px-5 py-3 space-y-3">
            @if (loadingComments()) {
              <div class="flex justify-center py-4"><app-loading-spinner /></div>
            } @else if (allComments().length === 0) {
              <p class="text-center text-sm text-warm-400 py-6">Aucun commentaire — sois le premier ! 🎣</p>
            } @else {
              @for (c of allComments(); track c.id) {
                <div class="flex gap-2.5">
                  <div class="w-7 h-7 rounded-full bg-gradient-to-br from-forest-300 to-forest-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {{ c.username[0].toUpperCase() }}
                  </div>
                  <div class="flex-1">
                    <p class="text-sm text-warm-900">
                      <span class="font-semibold">{{ c.username }}</span>
                      {{ c.content }}
                    </p>
                    <p class="text-xs text-warm-400 mt-0.5">{{ timeAgo(c.createdAt) }}</p>
                  </div>
                  @if (isMyComment(c)) {
                    <button (click)="deleteComment(c)" class="text-warm-300 hover:text-red-400 transition-colors flex-shrink-0 text-xs">✕</button>
                  }
                </div>
              }
            }
          </div>

          <!-- Saisie -->
          @if (currentUser()) {
            <div class="border-t border-warm-100 px-4 py-3 flex gap-2">
              <input [(ngModel)]="commentInput"
                     (keydown.enter)="submitComment()"
                     placeholder="Ajoute un commentaire..."
                     class="flex-1 text-sm bg-warm-50 border border-warm-200 rounded-xl px-3.5 py-2 outline-none focus:border-forest-500 focus:ring-1 focus:ring-forest-500 transition-all text-warm-900 placeholder-warm-400">
              <button (click)="submitComment()"
                      [disabled]="!commentInput.trim() || submittingComment()"
                      class="px-4 py-2 text-sm font-semibold text-white bg-forest-600 rounded-xl hover:bg-forest-700 disabled:opacity-40 transition-all">
                {{ submittingComment() ? '…' : 'Envoyer' }}
              </button>
            </div>
          } @else {
            <div class="border-t border-warm-100 px-5 py-3 text-center">
              <a routerLink="/login" class="text-sm text-forest-600 font-semibold hover:underline">
                Connecte-toi pour commenter
              </a>
            </div>
          }
        </div>
      </div>
    }
  `,
})
export class FeedComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('sentinel') private sentinel!: ElementRef;

  private feedService  = inject(FeedService);
  private auth         = inject(AuthService);
  private toast        = inject(ToastService);

  currentUser = toSignal(this.auth.currentUser$, { initialValue: this.auth.currentUser$.getValue() });

  // ── State ─────────────────────────────────────────────────────────────
  posts          = signal<FeedCapture[]>([]);
  loading        = signal(true);
  noMore         = signal(false);
  newCount       = signal(0);
  heartAnim      = signal<number | null>(null);
  activePost     = signal<FeedCapture | null>(null);
  allComments    = signal<FeedComment[]>([]);
  loadingComments= signal(false);
  submittingComment = signal(false);
  commentInput   = '';

  private currentPage = 0;
  private lastSeenAt  = new Date().toISOString();
  private observer!: IntersectionObserver;
  private pollTimer!: ReturnType<typeof setInterval>;

  // ── Helpers ───────────────────────────────────────────────────────────
  readonly timeAgo = timeAgo;

  isMe(userId: number) {
    return this.auth.currentUser$.getValue()?.id === userId;
  }
  isMyComment(c: FeedComment) {
    return this.auth.currentUser$.getValue()?.id === c.userId;
  }

  // ── Lifecycle ─────────────────────────────────────────────────────────

  ngOnInit(): void {
    this.loadPage();
    // Polling "nouvelles captures" toutes les 60s
    this.pollTimer = setInterval(() => this.checkNew(), 60_000);
  }

  ngAfterViewInit(): void {
    // Infinite scroll via IntersectionObserver
    this.observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && !this.loading() && !this.noMore()) {
        this.loadMore();
      }
    }, { rootMargin: '200px' });
    this.observer.observe(this.sentinel.nativeElement);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
    clearInterval(this.pollTimer);
  }

  // ── Chargement ────────────────────────────────────────────────────────

  loadPage(): void {
    this.loading.set(true);
    this.currentPage = 0;
    this.feedService.getFeed(0, 20).subscribe({
      next: res => {
        this.posts.set(res.data?.content ?? []);
        this.noMore.set(res.data?.last ?? true);
        this.loading.set(false);
        this.lastSeenAt = new Date().toISOString();
        this.newCount.set(0);
      },
      error: () => { this.loading.set(false); }
    });
  }

  loadFresh(): void {
    this.loadPage();
  }

  loadMore(): void {
    if (this.loading() || this.noMore()) return;
    this.loading.set(true);
    this.currentPage++;
    this.feedService.getFeed(this.currentPage, 20).subscribe({
      next: res => {
        this.posts.update(prev => [...prev, ...(res.data?.content ?? [])]);
        this.noMore.set(res.data?.last ?? true);
        this.loading.set(false);
      },
      error: () => { this.loading.set(false); this.currentPage--; }
    });
  }

  checkNew(): void {
    if (!this.auth.isAuthenticated()) return;
    this.feedService.countNew(this.lastSeenAt).subscribe({
      next: res => this.newCount.set(res.data?.count ?? 0),
      error: () => {}
    });
  }

  // ── Like ──────────────────────────────────────────────────────────────

  toggleLike(post: FeedCapture): void {
    if (!this.auth.isAuthenticated()) { this.toast.info('Connecte-toi pour liker 🎣'); return; }
    // Optimistic update
    post.hasLiked = !post.hasLiked;
    post.likeCount += post.hasLiked ? 1 : -1;

    this.feedService.toggleLike(post.id).subscribe({
      next: res => {
        post.hasLiked  = res.data!.liked;
        post.likeCount = res.data!.likeCount;
      },
      error: () => {
        // Rollback
        post.hasLiked = !post.hasLiked;
        post.likeCount += post.hasLiked ? 1 : -1;
      }
    });
  }

  doubleTapLike(post: FeedCapture): void {
    if (!post.hasLiked) this.toggleLike(post);
    this.heartAnim.set(post.id);
    setTimeout(() => this.heartAnim.set(null), 800);
  }

  // ── Commentaires ──────────────────────────────────────────────────────

  openComments(post: FeedCapture): void {
    this.activePost.set(post);
    this.allComments.set([]);
    this.commentInput = '';
    this.loadingComments.set(true);
    this.feedService.getComments(post.id).subscribe({
      next: res => { this.allComments.set(res.data ?? []); this.loadingComments.set(false); },
      error: () => this.loadingComments.set(false)
    });
  }

  closeComments(): void {
    this.activePost.set(null);
    this.allComments.set([]);
    this.commentInput = '';
  }

  submitComment(): void {
    const post = this.activePost();
    if (!post || !this.commentInput.trim()) return;
    this.submittingComment.set(true);
    this.feedService.addComment(post.id, this.commentInput.trim()).subscribe({
      next: res => {
        this.allComments.update(prev => [...prev, res.data!]);
        post.commentCount++;
        post.recentComments = [...(post.recentComments ?? []), res.data!];
        this.commentInput = '';
        this.submittingComment.set(false);
      },
      error: () => {
        this.toast.error('Impossible d\'ajouter le commentaire');
        this.submittingComment.set(false);
      }
    });
  }

  deleteComment(c: FeedComment): void {
    const post = this.activePost();
    if (!post) return;
    this.feedService.deleteComment(post.id, c.id).subscribe({
      next: () => {
        this.allComments.update(prev => prev.filter(x => x.id !== c.id));
        post.commentCount = Math.max(0, post.commentCount - 1);
      },
      error: () => this.toast.error('Impossible de supprimer le commentaire')
    });
  }
}
