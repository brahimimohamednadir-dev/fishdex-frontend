import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { FeedCapture, FeedComment } from '../models/feed.model';
import { Page } from '../models/capture.model';

@Injectable({ providedIn: 'root' })
export class FeedService {
  private readonly api = `${environment.apiUrl}/feed`;
  private http = inject(HttpClient);

  getFeed(page = 0, size = 20): Observable<ApiResponse<Page<FeedCapture>>> {
    return this.http.get<ApiResponse<Page<FeedCapture>>>(this.api, { params: { page, size } });
  }

  countNew(since: string): Observable<ApiResponse<{ count: number }>> {
    return this.http.get<ApiResponse<{ count: number }>>(`${this.api}/new`, { params: { since } });
  }

  toggleLike(captureId: number): Observable<ApiResponse<{ liked: boolean; likeCount: number }>> {
    return this.http.post<ApiResponse<{ liked: boolean; likeCount: number }>>(
      `${this.api}/captures/${captureId}/like`, {});
  }

  getComments(captureId: number): Observable<ApiResponse<FeedComment[]>> {
    return this.http.get<ApiResponse<FeedComment[]>>(`${this.api}/captures/${captureId}/comments`);
  }

  addComment(captureId: number, content: string): Observable<ApiResponse<FeedComment>> {
    return this.http.post<ApiResponse<FeedComment>>(
      `${this.api}/captures/${captureId}/comments`, { content });
  }

  deleteComment(captureId: number, commentId: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(
      `${this.api}/captures/${captureId}/comments/${commentId}`);
  }
}
