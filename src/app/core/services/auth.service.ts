import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../../environments/environment';
import { User } from '../models/user.model';
import { ApiResponse } from '../models/api-response.model';

export interface LoginResponse {
  token:     string;
  tokenType: string;
  user:      User;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'fishdex_token';
  private readonly USER_KEY  = 'fishdex_user';
  private readonly api = `${environment.apiUrl}/auth`;

  private platformId = inject(PLATFORM_ID);
  private http       = inject(HttpClient);

  currentUser$ = new BehaviorSubject<User | null>(this.loadUserFromStorage());

  login(email: string, password: string): Observable<ApiResponse<LoginResponse>> {
    return this.http
      .post<ApiResponse<LoginResponse>>(`${this.api}/login`, { email, password })
      .pipe(
        tap(res => {
          if (res.success && isPlatformBrowser(this.platformId)) {
            localStorage.setItem(this.TOKEN_KEY, res.data.token);
            localStorage.setItem(this.USER_KEY, JSON.stringify(res.data.user));
            this.currentUser$.next(res.data.user);
          }
        })
      );
  }

  register(username: string, email: string, password: string): Observable<ApiResponse<User>> {
    return this.http.post<ApiResponse<User>>(`${this.api}/register`, { username, email, password });
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
    }
    this.currentUser$.next(null);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getToken(): string | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    return localStorage.getItem(this.TOKEN_KEY);
  }

  private loadUserFromStorage(): User | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    try {
      const raw = localStorage.getItem(this.USER_KEY);
      return raw ? JSON.parse(raw) as User : null;
    } catch {
      return null;
    }
  }
}
