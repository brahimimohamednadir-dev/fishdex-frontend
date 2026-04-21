import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { TotpSetupResponse } from '../../../core/models/session.model';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-two-factor-setup',
  standalone: true,
  imports: [RouterLink, FormsModule],
  template: `
    <div class="max-w-lg mx-auto px-5 py-8">

      <a routerLink="/profile" class="text-sm text-warm-400 hover:text-warm-700 transition-colors">
        ← Mon profil
      </a>

      <h1 class="mt-4 text-2xl font-semibold text-warm-900 tracking-tight">Activer la 2FA</h1>
      <p class="mt-1 text-sm text-warm-500">Sécurise ton compte avec Google Authenticator ou Authy.</p>

      @if (loading()) {
        <div class="flex justify-center py-16">
          <span class="w-7 h-7 border-2 border-warm-200 border-t-forest-600 rounded-full animate-spin block"></span>
        </div>

      } @else if (setup) {

        <!-- Étape 1 : Scanner le QR code -->
        <div class="mt-6 bg-white border border-warm-200 rounded-2xl p-6 shadow-sm">
          <div class="flex items-center gap-2 mb-4">
            <span class="w-6 h-6 rounded-full bg-forest-600 text-white text-xs flex items-center justify-center font-bold shrink-0">1</span>
            <h2 class="font-semibold text-warm-900 text-sm">Scanner le QR code</h2>
          </div>
          <p class="text-xs text-warm-500 mb-4">
            Ouvre Google Authenticator ou Authy, puis scanne ce code.
          </p>
          <!-- QR code affiché via l'URI (image data URI ou lien vers API) -->
          <div class="flex justify-center mb-4">
            <div class="bg-warm-50 border border-warm-200 rounded-xl p-4 inline-block">
              <img [src]="setup.qrCodeUri" alt="QR Code 2FA" class="w-40 h-40" onerror="this.style.display='none'">
              <div class="text-center mt-2">
                <p class="text-xs text-warm-400 mb-1">Ou saisis la clé manuellement :</p>
                <code class="text-xs font-mono bg-warm-100 px-2 py-1 rounded-md text-warm-800 break-all select-all">
                  {{ setup.secret }}
                </code>
              </div>
            </div>
          </div>
        </div>

        <!-- Étape 2 : Confirmer le code -->
        <div class="mt-3 bg-white border border-warm-200 rounded-2xl p-6 shadow-sm">
          <div class="flex items-center gap-2 mb-4">
            <span class="w-6 h-6 rounded-full bg-forest-600 text-white text-xs flex items-center justify-center font-bold shrink-0">2</span>
            <h2 class="font-semibold text-warm-900 text-sm">Confirmer avec un code</h2>
          </div>
          <p class="text-xs text-warm-500 mb-4">
            Saisis un code généré par l'app pour confirmer l'activation.
          </p>
          <input type="text" [(ngModel)]="confirmCode" inputmode="numeric" maxlength="6"
                 class="w-full px-3.5 py-2.5 text-sm bg-white border border-warm-300 rounded-xl outline-none focus:border-forest-500 focus:ring-1 focus:ring-forest-500 transition-all text-warm-900 text-center tracking-widest font-mono text-base"
                 placeholder="000 000">

          @if (error()) {
            <p class="text-xs text-red-500 mt-2">{{ error() }}</p>
          }

          <button (click)="enable()" [disabled]="enabling() || confirmCode.length < 6"
                  class="mt-4 w-full py-2.5 bg-forest-600 text-white text-sm font-semibold rounded-xl hover:bg-forest-700 disabled:opacity-40 transition-all">
            @if (enabling()) {
              <span class="flex items-center justify-center gap-2">
                <span class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                Activation…
              </span>
            } @else {
              Activer la 2FA →
            }
          </button>
        </div>
      }
    </div>
  `,
})
export class TwoFactorSetupComponent implements OnInit {
  private auth  = inject(AuthService);
  private router = inject(Router);
  private toast  = inject(ToastService);

  setup:       TotpSetupResponse | null = null;
  confirmCode  = '';
  loading      = signal(true);
  enabling     = signal(false);
  error        = signal('');

  ngOnInit(): void {
    this.auth.setup2FA().subscribe({
      next: res => { this.setup = res.data; this.loading.set(false); },
      error: () => {
        this.toast.error('Impossible de démarrer la configuration.');
        this.router.navigate(['/profile']);
      },
    });
  }

  enable(): void {
    if (this.confirmCode.length < 6) return;
    this.enabling.set(true); this.error.set('');
    this.auth.enable2FA(this.confirmCode).subscribe({
      next: () => {
        this.toast.success('2FA activée !');
        this.router.navigate(['/2fa/backup-codes'], {
          state: { backupCodes: this.setup?.backupCodes ?? [] },
        });
      },
      error: err => {
        this.enabling.set(false);
        this.error.set(err.error?.message ?? 'Code invalide. Réessaie.');
        this.confirmCode = '';
      },
    });
  }
}
