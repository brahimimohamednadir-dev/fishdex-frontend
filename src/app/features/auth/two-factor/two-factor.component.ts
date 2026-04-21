import { Component, OnInit, inject, signal, ElementRef, ViewChildren, QueryList } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-two-factor',
  standalone: true,
  imports: [RouterLink, FormsModule],
  template: `
    <div class="min-h-screen bg-warm-100 flex items-center justify-center px-5">
      <div class="w-full max-w-sm">

        <div class="bg-white border border-warm-200 rounded-2xl p-8 shadow-sm">
          <div class="text-center mb-8">
            <div class="w-14 h-14 rounded-full bg-forest-50 flex items-center justify-center mx-auto mb-4">
              <span class="text-2xl">🔐</span>
            </div>
            <h1 class="text-xl font-semibold text-warm-900">Authentification à deux facteurs</h1>
            <p class="mt-2 text-sm text-warm-500">
              Saisis le code à 6 chiffres de ton application d'authentification.
            </p>
          </div>

          <!-- Saisie code TOTP (6 cases) -->
          <div class="flex gap-2 justify-center mb-6">
            @for (i of [0,1,2,3,4,5]; track i) {
              <input
                #digitInput
                type="text"
                inputmode="numeric"
                maxlength="1"
                [value]="digits[i]"
                (input)="onDigit($event, i)"
                (keydown)="onKeydown($event, i)"
                (paste)="onPaste($event)"
                class="w-11 h-12 text-center text-lg font-bold text-warm-900 bg-white border-2 rounded-xl outline-none transition-all"
                [class.border-forest-500]="digits[i]"
                [class.border-warm-300]="!digits[i]"
                [class.border-red-300]="error()">
            }
          </div>

          @if (error()) {
            <p class="text-center text-xs text-red-500 mb-4">{{ error() }}</p>
          }

          <!-- Trust device -->
          <label class="flex items-center gap-2.5 cursor-pointer select-none mb-5 justify-center">
            <input type="checkbox" [(ngModel)]="trustDevice"
                   class="w-4 h-4 rounded border-warm-300 text-forest-600 focus:ring-forest-500 cursor-pointer">
            <span class="text-sm text-warm-600">Faire confiance à cet appareil 30 jours</span>
          </label>

          <button (click)="verify()" [disabled]="loading() || code().length < 6"
                  class="w-full py-2.5 bg-forest-600 text-white text-sm font-semibold rounded-xl hover:bg-forest-700 disabled:opacity-40 transition-all">
            @if (loading()) {
              <span class="flex items-center justify-center gap-2">
                <span class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                Vérification…
              </span>
            } @else {
              Vérifier →
            }
          </button>

          <div class="mt-5 pt-5 border-t border-warm-100 text-center space-y-2">
            <p class="text-xs text-warm-500">Tu n'as plus accès à ton app ?</p>
            <a routerLink="/2fa/backup" class="text-xs font-semibold text-forest-600 hover:underline">
              Utiliser un code de secours
            </a>
          </div>
        </div>

        <button (click)="auth.logout(); router.navigate(['/login'])"
                class="mt-4 w-full text-center text-sm text-warm-400 hover:text-warm-700 transition-colors">
          Annuler et se déconnecter
        </button>
      </div>
    </div>
  `,
})
export class TwoFactorComponent implements OnInit {
  auth    = inject(AuthService);
  router  = inject(Router);
  private toast = inject(ToastService);

  @ViewChildren('digitInput') digitInputs!: QueryList<ElementRef<HTMLInputElement>>;

  digits     = ['', '', '', '', '', ''];
  trustDevice = false;
  loading    = signal(false);
  error      = signal('');

  code = signal('');

  ngOnInit(): void {
    // Rediriger si pas de token 2FA temporaire
    if (!this.auth.getTempToken()) {
      this.router.navigate(['/login']);
    }
  }

  onDigit(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    const val = input.value.replace(/\D/g, '').slice(-1);
    this.digits[index] = val;
    this.updateCode();
    if (val && index < 5) {
      this.digitInputs.toArray()[index + 1]?.nativeElement.focus();
    }
    if (this.code().length === 6) this.verify();
  }

  onKeydown(event: KeyboardEvent, index: number): void {
    if (event.key === 'Backspace' && !this.digits[index] && index > 0) {
      this.digits[index - 1] = '';
      this.updateCode();
      this.digitInputs.toArray()[index - 1]?.nativeElement.focus();
    }
  }

  onPaste(event: ClipboardEvent): void {
    event.preventDefault();
    const text = event.clipboardData?.getData('text')?.replace(/\D/g, '').slice(0, 6) ?? '';
    text.split('').forEach((c, i) => { if (i < 6) this.digits[i] = c; });
    this.updateCode();
    const nextEmpty = this.digits.findIndex(d => !d);
    const focusIdx  = nextEmpty === -1 ? 5 : nextEmpty;
    setTimeout(() => this.digitInputs.toArray()[focusIdx]?.nativeElement.focus());
    if (this.code().length === 6) setTimeout(() => this.verify(), 100);
  }

  private updateCode(): void {
    this.code.set(this.digits.join(''));
    this.error.set('');
  }

  verify(): void {
    if (this.code().length < 6 || this.loading()) return;
    this.loading.set(true); this.error.set('');
    this.auth.verifyTwoFactor(this.code(), this.trustDevice).subscribe({
      next: () => {
        this.toast.success('Connexion réussie !');
        this.router.navigate(['/captures']);
      },
      error: err => {
        this.loading.set(false);
        this.digits = ['', '', '', '', '', ''];
        this.updateCode();
        const status = err.status;
        if (status === 429) {
          this.error.set('3 codes invalides — session bloquée. Reconnecte-toi.');
          setTimeout(() => this.router.navigate(['/login']), 3000);
        } else {
          this.error.set('Code invalide. Réessaie.');
          setTimeout(() => this.digitInputs.toArray()[0]?.nativeElement.focus());
        }
      },
    });
  }
}
