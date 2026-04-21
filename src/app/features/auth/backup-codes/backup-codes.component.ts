import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ToastService } from '../../../core/services/toast.service';
import { PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-backup-codes',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="max-w-lg mx-auto px-5 py-8">

      <div class="bg-white border border-warm-200 rounded-2xl shadow-sm overflow-hidden">

        <!-- Header -->
        <div class="bg-forest-800 text-white p-6 text-center">
          <span class="text-3xl">🔑</span>
          <h1 class="mt-3 text-xl font-semibold">Codes de secours</h1>
          <p class="mt-2 text-sm text-forest-200">
            Garde ces codes en lieu sûr. Chaque code ne peut être utilisé qu'une seule fois.
          </p>
        </div>

        <!-- Codes -->
        <div class="p-6">
          <div class="bg-warm-50 border border-warm-200 rounded-xl p-4 mb-5">
            @if (codes.length) {
              <div class="grid grid-cols-2 gap-2">
                @for (code of codes; track code) {
                  <div class="flex items-center gap-2">
                    <span class="w-1.5 h-1.5 rounded-full bg-forest-400 shrink-0"></span>
                    <code class="text-sm font-mono text-warm-800 tracking-wider select-all">{{ code }}</code>
                  </div>
                }
              </div>
            } @else {
              <p class="text-sm text-warm-500 text-center italic">Codes non disponibles</p>
            }
          </div>

          <div class="space-y-3">
            <div class="flex items-start gap-2.5 p-3 bg-amber-50 border border-amber-100 rounded-xl">
              <span class="text-amber-500 shrink-0">⚠️</span>
              <p class="text-xs text-amber-700 leading-relaxed">
                <strong>Important :</strong> ces codes ne seront plus affichés. Sauvegarde-les maintenant dans un gestionnaire de mots de passe ou imprime-les.
              </p>
            </div>

            <button (click)="copyAll()"
                    class="w-full flex items-center justify-center gap-2 py-2.5 bg-white border border-warm-200 rounded-xl text-sm font-medium text-warm-700 hover:bg-warm-50 transition-all">
              📋 Copier tous les codes
            </button>

            <a routerLink="/profile"
               class="block w-full text-center py-2.5 bg-forest-600 text-white text-sm font-semibold rounded-xl hover:bg-forest-700 transition-all">
              J'ai sauvegardé mes codes →
            </a>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class BackupCodesComponent implements OnInit {
  private router     = inject(Router);
  private toast      = inject(ToastService);
  private platformId = inject(PLATFORM_ID);

  codes: string[] = [];

  ngOnInit(): void {
    const nav = this.router.getCurrentNavigation();
    const state = nav?.extras?.state as { backupCodes?: string[] } | undefined;
    this.codes = state?.backupCodes ?? [];

    // Si on arrive directement sans state, rediriger
    if (!this.codes.length && isPlatformBrowser(this.platformId)) {
      setTimeout(() => this.router.navigate(['/profile']));
    }
  }

  copyAll(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    navigator.clipboard.writeText(this.codes.join('\n')).then(() => {
      this.toast.success('Codes copiés !');
    });
  }
}
