import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { AppNotification } from '../models/notification.model';
import { Page } from '../models/capture.model';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly api = `${environment.apiUrl}/notifications`;
  private http = inject(HttpClient);

  unreadCount = signal(0);
  private pollInterval: ReturnType<typeof setInterval> | null = null;

  getNotifications(page = 0, size = 20): Observable<ApiResponse<Page<AppNotification>>> {
    return this.http.get<ApiResponse<Page<AppNotification>>>(`${this.api}?page=${page}&size=${size}`);
  }

  markAllRead(): Observable<ApiResponse<void>> {
    return this.http.put<ApiResponse<void>>(`${this.api}/read-all`, {});
  }

  markRead(id: number): Observable<ApiResponse<void>> {
    return this.http.put<ApiResponse<void>>(`${this.api}/${id}/read`, {});
  }

  getUnreadCount(): Observable<ApiResponse<{ count: number }>> {
    return this.http.get<ApiResponse<{ count: number }>>(`${this.api}/unread-count`);
  }

  startPolling(): void {
    if (this.pollInterval) return;
    // Fetch immediately, then every 30s
    this.fetchUnreadCount();
    this.pollInterval = setInterval(() => this.fetchUnreadCount(), 30_000);
  }

  stopPolling(): void {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
  }

  private fetchUnreadCount(): void {
    this.getUnreadCount().subscribe({
      next: res => this.unreadCount.set(res.data?.count ?? 0),
      error: () => {},
    });
  }
}
