import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { UserService } from '../../../core/services/user.service';
import { ToastService } from '../../../core/services/toast.service';

/** Page de callback après Google OAuth — lit le token dans les query params */
@Component({
  selector: 'app-auth-callback',
  standalone: true,
  template: `
    <div class="min-h-screen bg-warm-100 flex items-center justify-center">
      <div class="text-center">
        <span class="w-8 h-8 border-2 border-warm-200 border-t-forest-600 rounded-full animate-spin block mx-auto"></span>
        <p class="mt-4 text-sm text-warm-500">Connexion en cours…</p>
      </div>
    </div>
  `,
})
export class AuthCallbackComponent implements OnInit {
  private route       = inject(ActivatedRoute);
  private auth        = inject(AuthService);
  private userService = inject(UserService);
  private router      = inject(Router);
  private toast       = inject(ToastService);

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token');
    const error = this.route.snapshot.queryParamMap.get('error');

    if (error || !token) {
      this.toast.error('Connexion Google échouée.');
      this.router.navigate(['/login']);
      return;
    }

    // Stocker le token puis récupérer l'utilisateur
    localStorage.setItem('fishdex_token', token);
    this.userService.getMe().subscribe({
      next: res => {
        this.auth.handleGoogleCallback(token, res.data);
        this.toast.success('Connexion avec Google réussie !');
        this.router.navigate(['/captures']);
      },
      error: () => {
        localStorage.removeItem('fishdex_token');
        this.toast.error('Erreur lors de la récupération du profil.');
        this.router.navigate(['/login']);
      },
    });
  }
}
