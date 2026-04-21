import { Injectable, inject, NgZone, OnDestroy, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { signal } from '@angular/core';
import { AuthService } from './auth.service';
import { ToastService } from './toast.service';

const TIMEOUT_MS  = 30 * 60 * 1000;  // 30 minutes
const WARNING_MS  = 28 * 60 * 1000;  // avertissement à 28 min

@Injectable({ providedIn: 'root' })
export class InactivityService implements OnDestroy {
  private auth       = inject(AuthService);
  private router     = inject(Router);
  private toast      = inject(ToastService);
  private zone       = inject(NgZone);
  private platformId = inject(PLATFORM_ID);

  showWarning = signal(false);

  private timeoutId: ReturnType<typeof setTimeout> | null = null;
  private warningId: ReturnType<typeof setTimeout> | null = null;
  private boundReset = this.reset.bind(this);
  private readonly EVENTS = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'];

  start(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.EVENTS.forEach(e => document.addEventListener(e, this.boundReset, { passive: true }));
    this.schedule();
  }

  stop(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.EVENTS.forEach(e => document.removeEventListener(e, this.boundReset));
    this.clearTimers();
    this.showWarning.set(false);
  }

  extendSession(): void {
    this.showWarning.set(false);
    this.reset();
  }

  private reset(): void {
    this.showWarning.set(false);
    this.clearTimers();
    this.schedule();
  }

  private schedule(): void {
    this.zone.runOutsideAngular(() => {
      this.warningId = setTimeout(() => {
        this.zone.run(() => this.showWarning.set(true));
      }, WARNING_MS);

      this.timeoutId = setTimeout(() => {
        this.zone.run(() => {
          this.showWarning.set(false);
          this.auth.logout();
          this.toast.info('Session expirée après 30 minutes d\'inactivité.');
          this.router.navigate(['/login']);
        });
      }, TIMEOUT_MS);
    });
  }

  private clearTimers(): void {
    if (this.timeoutId) clearTimeout(this.timeoutId);
    if (this.warningId) clearTimeout(this.warningId);
  }

  ngOnDestroy(): void { this.stop(); }
}
