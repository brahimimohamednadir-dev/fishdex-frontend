import { Component, inject } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-white flex">

      <!-- Panneau gauche — branding -->
      <div class="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 bg-gray-900 text-white">
        <div>
          <span class="text-2xl">🎣</span>
          <span class="ml-2 font-semibold tracking-tight">FishDex</span>
        </div>
        <div>
          <p class="text-4xl font-bold leading-tight tracking-tight">
            Ton carnet de pêche<br>numérique.
          </p>
          <p class="mt-4 text-gray-400 text-sm leading-relaxed max-w-sm">
            Enregistre tes captures, découvre les espèces et rejoins une communauté de 4 millions de pêcheurs.
          </p>
        </div>
        <p class="text-gray-600 text-xs">© 2026 FishDex</p>
      </div>

      <!-- Panneau droit — formulaire -->
      <div class="flex-1 flex flex-col justify-center items-center px-6 py-12">
        <div class="w-full max-w-sm">

          <!-- Mobile logo -->
          <div class="lg:hidden text-center mb-10">
            <span class="text-3xl">🎣</span>
            <p class="mt-2 font-semibold text-gray-900">FishDex</p>
          </div>

          <h1 class="text-2xl font-bold text-gray-900 tracking-tight">Connexion</h1>
          <p class="mt-1 text-sm text-gray-500">Bon retour parmi nous.</p>

          <form [formGroup]="form" (ngSubmit)="submit()" class="mt-8 space-y-4">

            <div>
              <label class="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">
                Email
              </label>
              <input type="email" formControlName="email"
                     class="w-full px-3.5 py-2.5 text-sm bg-white border border-gray-200 rounded-lg outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-all placeholder-gray-400"
                     placeholder="prenom@email.fr">
            </div>

            <div>
              <label class="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">
                Mot de passe
              </label>
              <input type="password" formControlName="password"
                     class="w-full px-3.5 py-2.5 text-sm bg-white border border-gray-200 rounded-lg outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-all placeholder-gray-400"
                     placeholder="••••••••">
            </div>

            @if (error) {
              <div class="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-lg">
                <span class="text-red-500 text-xs">⚠</span>
                <p class="text-xs text-red-600">{{ error }}</p>
              </div>
            }

            <button type="submit" [disabled]="loading || form.invalid"
                    class="w-full py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all mt-2">
              @if (loading) {
                <span class="flex items-center justify-center gap-2">
                  <span class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  Connexion...
                </span>
              } @else {
                Continuer →
              }
            </button>
          </form>

          <p class="mt-6 text-center text-sm text-gray-500">
            Pas de compte ?
            <a routerLink="/register" class="font-semibold text-gray-900 hover:underline ml-1">
              S'inscrire gratuitement
            </a>
          </p>
        </div>
      </div>
    </div>
  `,
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private toast = inject(ToastService);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  loading = false;
  error = '';

  submit(): void {
    if (this.form.invalid) return;
    this.loading = true;
    this.error = '';
    const { email, password } = this.form.value;
    this.auth.login(email!, password!).subscribe({
      next: () => { this.toast.success('Connexion réussie !'); this.router.navigate(['/captures']); },
      error: err => {
        this.error = err.error?.message ?? 'Email ou mot de passe incorrect.';
        this.toast.error(this.error);
        this.loading = false;
      },
    });
  }
}
