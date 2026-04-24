import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../../environments/environment';
import { User } from '../models/user.model';
import { ApiResponse } from '../models/api-response.model';
import { TotpSetupResponse } from '../models/session.model';

export interface LoginResponse {
  token?:              string;
  tokenType?:          string;
  refreshToken?:       string;
  expiresIn?:          number;
  user?:               User;
  requiresTwoFactor?:  boolean;
  tempToken?:          string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY    = 'fishdex_token';
  private readonly REFRESH_KEY  = 'fishdex_refresh';
  private readonly USER_KEY     = 'fishdex_user';
  private readonly TEMP_2FA_KEY = 'fishdex_2fa_temp';
  private readonly api          = `${environment.apiUrl}/auth`;

  private platformId = inject(PLATFORM_ID);
  private http       = inject(HttpClient);

  currentUser$ = new BehaviorSubject<User | null>(this.loadUserFromStorage());

  // ─── Connexion / Inscription ───────────────────────────────────────────────

  login(email: string, password: string, rememberMe = false): Observable<ApiResponse<LoginResponse>> {
    return this.http
      .post<ApiResponse<LoginResponse>>(`${this.api}/login`, { email, password, rememberMe })
      .pipe(tap(res => {
        if (!res.success || !res.data) return;
        if (res.data.requiresTwoFactor && res.data.tempToken) {
          // Stocker le token temporaire pour la page /2fa
          this.setStorage(this.TEMP_2FA_KEY, res.data.tempToken);
        } else if (res.data.token && res.data.user) {
          this.storeSession(res.data.token, res.data.user, rememberMe, res.data.refreshToken);
        }
      }));
  }

  register(username: string, email: string, password: string): Observable<ApiResponse<User>> {
    return this.http.post<ApiResponse<User>>(`${this.api}/register`, { username, email, password });
  }

  loginWithGoogle(): void {
    window.location.href = `${environment.apiUrl.replace('/api', '')}/oauth2/authorization/google`;
  }

  handleGoogleCallback(token: string, user: User): void {
    this.storeSession(token, user, false);
  }

  logout(): void {
    // Appel backend pour invalider le refresh token (best-effort)
    const token = this.getToken();
    if (token) {
      this.http.post(`${this.api}/logout`, {}).subscribe({ error: () => {} });
    }
    this.clearStorage();
    this.currentUser$.next(null);
  }

  // ─── 2FA ──────────────────────────────────────────────────────────────────

  getTempToken(): string | null {
    return this.getStorage(this.TEMP_2FA_KEY);
  }

  verifyTwoFactor(code: string, trustDevice = false): Observable<ApiResponse<LoginResponse>> {
    const tempToken = this.getTempToken();
    return this.http
      .post<ApiResponse<LoginResponse>>(`${environment.apiUrl}/2fa/verify`, { code, tempToken, trustDevice })
      .pipe(tap(res => {
        if (res.success && res.data?.token && res.data?.user) {
          this.removeStorage(this.TEMP_2FA_KEY);
          this.storeSession(res.data.token, res.data.user, false, res.data.refreshToken);
        }
      }));
  }

  setup2FA(): Observable<ApiResponse<TotpSetupResponse>> {
    return this.http.post<ApiResponse<TotpSetupResponse>>(`${environment.apiUrl}/2fa/setup`, {});
  }

  enable2FA(code: string): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${environment.apiUrl}/2fa/enable`, { code });
  }

  disable2FA(password: string): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${environment.apiUrl}/2fa/disable`, { password });
  }

  // ─── Email verification ────────────────────────────────────────────────────

  verifyEmail(token: string): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.api}/verify-email`, { token });
  }

  resendVerification(): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.api}/resend-verification`, {});
  }

  // ─── Mot de passe oublié ──────────────────────────────────────────────────

  forgotPassword(email: string): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.api}/forgot-password`, { email });
  }

  resetPassword(token: string, password: string): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.api}/reset-password`, { token, password });
  }

  // ─── Refresh token ────────────────────────────────────────────────────

  refreshAccessToken(): Observable<ApiResponse<{ token: string; expiresIn: number }>> {
    const refreshToken = this.getStorage(this.REFRESH_KEY);
    return this.http
      .post<ApiResponse<{ token: string; expiresIn: number }>>(`${this.api}/refresh`, { refreshToken })
      .pipe(tap(res => {
        if (res.success && res.data?.token) {
          this.setStorage(this.TOKEN_KEY, res.data.token);
        }
      }));
  }

  // ─── Token / Session ──────────────────────────────────────────────────────

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getToken(): string | null {
    return this.getStorage(this.TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return this.getStorage(this.REFRESH_KEY);
  }

  updateCurrentUser(user: User): void {
    this.setStorage(this.USER_KEY, JSON.stringify(user));
    this.currentUser$.next(user);
  }

  // ─── Private ──────────────────────────────────────────────────────────────

  private storeSession(token: string, user: User, rememberMe: boolean, refreshToken?: string): void {
    this.setStorage(this.TOKEN_KEY, token);
    this.setStorage(this.USER_KEY, JSON.stringify(user));
    if (refreshToken) {
      this.setStorage(this.REFRESH_KEY, refreshToken);
    }
    this.currentUser$.next(user);
  }

  private clearStorage(): void {
    [this.TOKEN_KEY, this.REFRESH_KEY, this.USER_KEY, this.TEMP_2FA_KEY].forEach(k => this.removeStorage(k));
  }

  private loadUserFromStorage(): User | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    try {
      const raw = this.getStorage(this.USER_KEY);
      return raw ? JSON.parse(raw) as User : null;
    } catch { return null; }
  }

  private getStorage(key: string): string | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    return localStorage.getItem(key) ?? sessionStorage.getItem(key);
  }

  private setStorage(key: string, value: string): void {
    if (!isPlatformBrowser(this.platformId)) return;
    localStorage.setItem(key, value);
  }

  private removeStorage(key: string): void {
    if (!isPlatformBrowser(this.platformId)) return;
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  }
}
