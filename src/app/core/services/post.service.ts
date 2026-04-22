import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { Post, Comment, CreatePostRequest, ReactionType, Report } from '../models/post.model';
import { Page } from '../models/capture.model';

@Injectable({ providedIn: 'root' })
export class PostService {
  private readonly api = `${environment.apiUrl}/groups`;
  private http = inject(HttpClient);

  // ─── Posts ────────────────────────────────────────────────────────────────

  createPost(groupId: number, request: CreatePostRequest): Observable<ApiResponse<Post>> {
    return this.http.post<ApiResponse<Post>>(`${this.api}/${groupId}/posts`, request);
  }

  getPosts(groupId: number, page = 0, size = 20): Observable<ApiResponse<Page<Post>>> {
    return this.http.get<ApiResponse<Page<Post>>>(`${this.api}/${groupId}/posts?page=${page}&size=${size}`);
  }

  updatePost(groupId: number, postId: number, content: string): Observable<ApiResponse<Post>> {
    return this.http.put<ApiResponse<Post>>(`${this.api}/${groupId}/posts/${postId}`, { content });
  }

  deletePost(groupId: number, postId: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.api}/${groupId}/posts/${postId}`);
  }

  // ─── Pin ──────────────────────────────────────────────────────────────────

  pinPost(groupId: number, postId: number): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.api}/${groupId}/posts/${postId}/pin`, {});
  }

  unpinPost(groupId: number, postId: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.api}/${groupId}/posts/${postId}/pin`);
  }

  // ─── Reactions ────────────────────────────────────────────────────────────

  addReaction(groupId: number, postId: number, type: ReactionType): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.api}/${groupId}/posts/${postId}/react`, { type });
  }

  removeReaction(groupId: number, postId: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.api}/${groupId}/posts/${postId}/react`);
  }

  // ─── Comments ─────────────────────────────────────────────────────────────

  getComments(groupId: number, postId: number): Observable<ApiResponse<Comment[]>> {
    return this.http.get<ApiResponse<Comment[]>>(`${this.api}/${groupId}/posts/${postId}/comments`);
  }

  addComment(groupId: number, postId: number, content: string, parentId?: number): Observable<ApiResponse<Comment>> {
    return this.http.post<ApiResponse<Comment>>(`${this.api}/${groupId}/posts/${postId}/comments`, { content, parentId });
  }

  deleteComment(groupId: number, postId: number, commentId: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.api}/${groupId}/posts/${postId}/comments/${commentId}`);
  }

  likeComment(groupId: number, postId: number, commentId: number): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.api}/${groupId}/posts/${postId}/comments/${commentId}/like`, {});
  }

  // ─── Report ───────────────────────────────────────────────────────────────

  reportPost(groupId: number, postId: number, reason?: string): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.api}/${groupId}/posts/${postId}/report`, { reason });
  }

  // ─── Reports list (admin) ─────────────────────────────────────────────────

  getReports(groupId: number): Observable<ApiResponse<Report[]>> {
    return this.http.get<ApiResponse<Report[]>>(`${environment.apiUrl}/groups/${groupId}/reports`);
  }

  deleteReportedContent(groupId: number, reportId: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${environment.apiUrl}/groups/${groupId}/reports/${reportId}`);
  }
}
