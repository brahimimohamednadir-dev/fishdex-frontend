import { Component, inject } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-white flex">

      <!-- Panneau gauche -->
      <div class="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 bg-gray-900 text-white">
        <div>
          <span class="text-2xl">🎣</span>
          <span class="ml-2 font-semibold tracking-tight">FishDex</span>
        </div>
        <div>
          <p class="text-4xl font-bold leading-tight tracking-tight">
            Rejoins 4 millions<br>de pêcheurs.
          </p>
          <div class="mt-8 space-y-3">
            @for (feat of features; track feat.icon) {
              <div class="flex items-center gap-3">
                <span class="text-xl">{{ feat.icon }}</span>
                <span class="text-sm text-gray-300">{{ feat.text }}</span>
              </div>
            }
          </div>
        </div>
        <p class="text-gray-600 text-xs">© 2026 FishDex · Gratuit jusqu'à 50 captures</p>
      </div>

      <!-- Panneau droit -->
      <div class="flex-1 flex flex-col justify-center items-center px-6 py-12">
        <div class="w-full max-w-sm">

          <div class="lg:hidden text-center mb-10">
            <span class="text-3xl">🎣</span>
            <p class="mt-2 font-semibold text-gray-900">FishDex</p>
          </div>

          <h1 class="text-2xl font-bold text-gray-900 tracking-tight">Créer un compte</h1>
          <p class="mt-1 text-sm text-gray-500">Gratuit, sans carte bancaire.</p>

          <form [formGroup]="form" (ngSubmit)="submit()" class="mt-8 space-y-4">

            <div>
              <label class="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">
                Pseudo
              </label>
              <input type="text" formControlName="username"
                     class="w-full px-3.5 py-2.5 text-sm bg-white border border-gray-200 rounded-lg outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-all placeholder-gray-400"
                     placeholder="TonPseudo">
            </div>

            <div>
              <label class="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">
                Email
              </label>
              <input type="email" formControlName="email"
                     class="w-full px-3.5 py-2.5 text-sm bg-white border border-gray-200 rounded-lg outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-all placeholder-gray-400"
                     placeholder="prenom@email.fr">
              @if (form.get('email')?.touched && form.get('email')?.hasError('email')) {
                <p class="text-xs text-red-500 mt-1">Email invalide</p>
              }
            </div>

            <div>
              <label class="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">
                Mot de passe
              </label>
              <input type="password" formControlName="password"
                     class="w-full px-3.5 py-2.5 text-sm bg-white border border-gray-200 rounded-lg outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-all placeholder-gray-400"
                     placeholder="Minimum 8 caractères">
              @if (form.get('password')?.touched && form.get('password')?.hasError('minlength')) {
                <p class="text-xs text-red-500 mt-1">8 caractères minimum</p>
              }
            </div>

            @if (error) {
              <div class="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-lg">
                <p class="text-xs text-red-600">{{ error }}</p>
              </div>
            }
            @if (success) {
              <div class="flex items-center gap-2 p-3 bg-green-50 border border-green-100 rounded-lg">
                <p class="text-xs text-green-700">✓ Compte créé ! Redirection...</p>
              </div>
            }

            <button type="submit" [disabled]="loading || form.invalid"
                    class="w-full py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all mt-2">
              @if (loading) {
                <span class="flex items-center justify-center gap-2">
                  <span class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  Création...
                </span>
              } @else {
                Créer mon compte →
              }
            </button>
          </form>

          <p class="mt-6 text-center text-sm text-gray-500">
            Déjà un compte ?
            <a routerLink="/login" class="font-semibold text-gray-900 hover:underline ml-1">
              Se connecter
            </a>
          </p>
        </div>
      </div>
    </div>
  `,
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private toast = inject(ToastService);

  features = [
    { icon: '🎣', text: 'Journal de capture avec photos' },
    { icon: '🐟', text: 'Encyclopédie de 200+ espèces' },
    { icon: '🏆', text: 'Badges et défis gamifiés' },
    { icon: '👥', text: 'Groupes et fil social' },
  ];

  form = this.fb.group({
    username: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  loading = false;
  error = '';
  success = false;

  submit(): void {
    if (this.form.invalid) return;
    this.loading = true;
    this.error = '';
    const { username, email, password } = this.form.value;
    this.auth.register(username!, email!, password!).subscribe({
      next: () => {
        this.success = true;
        this.loading = false;
        this.toast.success('Compte créé ! Connecte-toi pour commencer 🎣');
        setTimeout(() => this.router.navigate(['/login']), 1500);
      },
      error: err => {
        this.error = err.error?.message ?? "Erreur lors de l'inscription.";
        this.toast.error(this.error);
        this.loading = false;
      },
    });
  }
}
