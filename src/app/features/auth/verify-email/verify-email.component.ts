import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { Subscription, interval } from 'rxjs';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="min-h-screen bg-warm-100 flex items-center justify-center px-5">
      <div class="w-full max-w-md">

        @if (verifying()) {
          <!-- Vérification en cours -->
          <div class="bg-white border border-warm-200 rounded-2xl p-10 shadow-sm text-center">
            <div class="w-14 h-14 rounded-full bg-warm-100 flex items-center justify-center mx-auto mb-5">
              <span class="w-6 h-6 border-2 border-warm-200 border-t-forest-600 rounded-full animate-spin block"></span>
            </div>
            <h1 class="text-xl font-semibold text-warm-900">Vérification en cours…</h1>
          </div>

        } @else if (verified()) {
          <!-- Email confirmé -->
          <div class="bg-white border border-warm-200 rounded-2xl p-10 shadow-sm text-center">
            <div class="w-14 h-14 rounded-full bg-forest-50 flex items-center justify-center mx-auto mb-5">
              <span class="text-2xl">✅</span>
            </div>
            <h1 class="text-xl font-semibold text-warm-900 mb-2">Email confirmé !</h1>
            <p class="text-sm text-warm-500 mb-6">Ton compte est activé. Tu peux maintenant accéder à toutes les fonctionnalités.</p>
            <a routerLink="/captures"
               class="inline-flex items-center gap-2 px-6 py-2.5 bg-forest-600 text-white text-sm font-semibold rounded-xl hover:bg-forest-700 transition-all">
              Commencer →
            </a>
          </div>

        } @else if (tokenError()) {
          <!-- Lien invalide / expiré -->
          <div class="bg-white border border-warm-200 rounded-2xl p-10 shadow-sm text-center">
            <div class="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-5">
              <span class="text-2xl">⚠️</span>
            </div>
            <h1 class="text-xl font-semibold text-warm-900 mb-2">Lien invalide ou expiré</h1>
            <p class="text-sm text-warm-500 mb-6">Ce lien de confirmation a expiré (24h) ou a déjà été utilisé.</p>
            <button (click)="resend()" [disabled]="resending()"
                    class="w-full py-2.5 bg-forest-600 text-white text-sm font-semibold rounded-xl hover:bg-forest-700 disabled:opacity-40 transition-all">
              @if (resending()) { Envoi en cours… } @else { Renvoyer un lien }
            </button>
          </div>

        } @else {
          <!-- Page "Vérifie ta boîte mail" (après inscription, pas de token) -->
          <div class="bg-white border border-warm-200 rounded-2xl p-10 shadow-sm text-center">
            <div class="w-16 h-16 rounded-full bg-forest-50 flex items-center justify-center mx-auto mb-5">
              <span class="text-3xl">📬</span>
            </div>
            <h1 class="text-xl font-semibold text-warm-900 mb-2">Vérifie ta boîte mail</h1>
            <p class="text-sm text-warm-500 mb-1">
              Un email de confirmation a été envoyé à
            </p>
            <p class="text-sm font-semibold text-warm-900 mb-6">{{ email }}</p>
            <p class="text-xs text-warm-400 mb-6">
              Le lien expire dans 24h. Vérifie aussi tes spams.
            </p>

            <div class="space-y-3">
              @if (resentSuccess()) {
                <div class="p-3 bg-forest-50 border border-forest-100 rounded-xl text-xs text-forest-700 font-medium">
                  ✓ Email renvoyé avec succès
                </div>
              }
              <button (click)="resend()" [disabled]="resending() || resendCooldown() > 0"
                      class="w-full py-2.5 bg-white border border-warm-200 text-sm font-medium text-warm-700 rounded-xl hover:bg-warm-50 disabled:opacity-40 transition-all">
                @if (resending()) {
                  Envoi en cours…
                } @else if (resendCooldown() > 0) {
                  Renvoyer ({{ resendCooldown() }}s)
                } @else {
                  Renvoyer l'email
                }
              </button>
              <a routerLink="/login" class="block text-center text-sm text-warm-500 hover:text-warm-900 transition-colors">
                Retour à la connexion
              </a>
            </div>
          </div>
        }

      </div>
    </div>
  `,
})
export class VerifyEmailComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private auth  = inject(AuthService);
  private toast = inject(ToastService);
  private router = inject(Router);

  email        = '';
  verifying    = signal(false);
  verified     = signal(false);
  tokenError   = signal(false);
  resending    = signal(false);
  resentSuccess = signal(false);
  resendCooldown = signal(0);

  private cooldownSub: Subscription | null = null;

  ngOnInit(): void {
    this.email = this.route.snapshot.queryParamMap.get('email') ?? '';
    const token = this.route.snapshot.queryParamMap.get('token');
    if (token) this.verify(token);
  }

  private verify(token: string): void {
    this.verifying.set(true);
    this.auth.verifyEmail(token).subscribe({
      next:  () => { this.verifying.set(false); this.verified.set(true); },
      error: () => { this.verifying.set(false); this.tokenError.set(true); },
    });
  }

  resend(): void {
    this.resending.set(true);
    this.resentSuccess.set(false);
    this.auth.resendVerification().subscribe({
      next: () => {
        this.resending.set(false);
        this.resentSuccess.set(true);
        this.toast.success('Email de confirmation renvoyé !');
        this.startCooldown(60);
      },
      error: () => {
        this.resending.set(false);
        this.toast.error('Impossible d\'envoyer l\'email.');
      },
    });
  }

  private startCooldown(seconds: number): void {
    this.resendCooldown.set(seconds);
    this.cooldownSub?.unsubscribe();
    this.cooldownSub = interval(1000).subscribe(() => {
      this.resendCooldown.update(v => {
        if (v <= 1) { this.cooldownSub?.unsubscribe(); return 0; }
        return v - 1;
      });
    });
  }

  ngOnDestroy(): void { this.cooldownSub?.unsubscribe(); }
}
