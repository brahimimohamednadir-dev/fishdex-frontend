import { Component, inject, signal } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-warm-100 flex items-center justify-center px-5">
      <div class="w-full max-w-sm">

        <div class="text-center mb-8">
          <a routerLink="/login" class="text-sm text-warm-400 hover:text-warm-700 transition-colors">
            ← Retour à la connexion
          </a>
        </div>

        <div class="bg-white border border-warm-200 rounded-2xl p-8 shadow-sm">

          @if (sent()) {
            <!-- Confirmation -->
            <div class="text-center">
              <div class="w-14 h-14 rounded-full bg-forest-50 flex items-center justify-center mx-auto mb-5">
                <span class="text-2xl">📨</span>
              </div>
              <h1 class="text-xl font-semibold text-warm-900 mb-3">Vérifie ta boîte mail</h1>
              <p class="text-sm text-warm-500 leading-relaxed">
                Si cet email est enregistré, tu recevras un lien de réinitialisation dans les 2 minutes.
              </p>
              <p class="text-xs text-warm-400 mt-3">Le lien expire après 1 heure.</p>
              <a routerLink="/login"
                 class="inline-block mt-6 text-sm font-semibold text-forest-600 hover:underline">
                Retour à la connexion
              </a>
            </div>

          } @else {
            <div class="mb-6">
              <h1 class="text-xl font-semibold text-warm-900 tracking-tight">Mot de passe oublié ?</h1>
              <p class="mt-1 text-sm text-warm-500">
                Saisis ton email et on t'envoie un lien de réinitialisation.
              </p>
            </div>

            <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-4">
              <div>
                <label class="block text-xs font-semibold text-warm-600 uppercase tracking-wide mb-1.5">Email</label>
                <input type="email" formControlName="email"
                       class="w-full px-3.5 py-2.5 text-sm bg-white border border-warm-300 rounded-xl outline-none focus:border-forest-500 focus:ring-1 focus:ring-forest-500 transition-all placeholder-warm-400 text-warm-900"
                       placeholder="prenom@email.fr">
              </div>

              <button type="submit" [disabled]="loading() || form.invalid"
                      class="w-full py-2.5 bg-forest-600 text-white text-sm font-semibold rounded-xl hover:bg-forest-700 disabled:opacity-40 transition-all">
                @if (loading()) {
                  <span class="flex items-center justify-center gap-2">
                    <span class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    Envoi…
                  </span>
                } @else {
                  Envoyer le lien →
                }
              </button>
            </form>
          }
        </div>
      </div>
    </div>
  `,
})
export class ForgotPasswordComponent {
  private fb   = inject(FormBuilder);
  private auth = inject(AuthService);

  loading = signal(false);
  sent    = signal(false);

  form = this.fb.group({ email: ['', [Validators.required, Validators.email]] });

  submit(): void {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.auth.forgotPassword(this.form.value.email!).subscribe({
      // Toujours afficher la même confirmation (anti-énumération)
      next:  () => { this.loading.set(false); this.sent.set(true); },
      error: () => { this.loading.set(false); this.sent.set(true); },
    });
  }
}
