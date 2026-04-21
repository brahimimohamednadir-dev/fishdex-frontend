import { Component, OnInit, OnDestroy, inject, PLATFORM_ID } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { ToastComponent } from './shared/components/toast/toast.component';
import { InactivityService } from './core/services/inactivity.service';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, ToastComponent],
  template: `
    <app-navbar />
    <main class="min-h-screen bg-warm-100">
      <router-outlet />
    </main>
    <app-toast />

    <!-- Avertissement inactivité -->
    @if (inactivity.showWarning()) {
      <div class="fixed inset-0 z-[9998] bg-black/40 flex items-center justify-center px-4">
        <div class="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full text-center border border-warm-200">
          <div class="text-4xl mb-4">⏱️</div>
          <h2 class="text-lg font-semibold text-warm-900 mb-2">Tu es toujours là ?</h2>
          <p class="text-sm text-warm-500 mb-6">
            Ta session expirera dans <span class="font-semibold text-warm-900">2 minutes</span> par inactivité.
          </p>
          <button (click)="inactivity.extendSession()"
                  class="w-full py-2.5 bg-forest-600 text-white text-sm font-semibold rounded-xl hover:bg-forest-700 transition-all">
            Rester connecté
          </button>
        </div>
      </div>
    }
  `,
})
export class App implements OnInit, OnDestroy {
  inactivity   = inject(InactivityService);
  private auth = inject(AuthService);
  private platformId = inject(PLATFORM_ID);

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId) && this.auth.isAuthenticated()) {
      this.inactivity.start();
    }
    // Démarrer / arrêter le service selon l'état auth
    this.auth.currentUser$.subscribe(user => {
      if (isPlatformBrowser(this.platformId)) {
        user ? this.inactivity.start() : this.inactivity.stop();
      }
    });
  }

  ngOnDestroy(): void { this.inactivity.stop(); }
}
