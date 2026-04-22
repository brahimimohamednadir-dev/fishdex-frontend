import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { Group, GroupRequest, GroupMember, JoinRequest, GroupRole } from '../models/group.model';
import { Page } from '../models/capture.model';

@Injectable({ providedIn: 'root' })
export class GroupService {
  private readonly api = `${environment.apiUrl}/groups`;
  private http = inject(HttpClient);

  // ─── My groups ────────────────────────────────────────────────────────────

  getMyGroups(): Observable<ApiResponse<Group[]>> {
    return this.http.get<ApiResponse<Group[]>>(this.api);
  }

  // ─── Discover ─────────────────────────────────────────────────────────────

  discoverGroups(search = '', category = '', page = 0, size = 12): Observable<ApiResponse<Page<Group>>> {
    const params: string[] = [`page=${page}`, `size=${size}`];
    if (search) params.push(`search=${encodeURIComponent(search)}`);
    if (category) params.push(`category=${category}`);
    return this.http.get<ApiResponse<Page<Group>>>(`${this.api}/discover?${params.join('&')}`);
  }

  // ─── CRUD ─────────────────────────────────────────────────────────────────

  createGroup(formData: FormData): Observable<ApiResponse<Group>> {
    return this.http.post<ApiResponse<Group>>(this.api, formData);
  }

  getGroupById(id: number): Observable<ApiResponse<Group>> {
    return this.http.get<ApiResponse<Group>>(`${this.api}/${id}`);
  }

  deleteGroup(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.api}/${id}`);
  }

  // ─── Membership ───────────────────────────────────────────────────────────

  joinGroup(id: number, message?: string): Observable<ApiResponse<Group>> {
    return this.http.post<ApiResponse<Group>>(`${this.api}/${id}/join`, { message });
  }

  leaveGroup(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.api}/${id}/leave`);
  }

  // ─── Members ──────────────────────────────────────────────────────────────

  getMembers(id: number, search = '', page = 0, size = 20): Observable<ApiResponse<Page<GroupMember>>> {
    const params: string[] = [`page=${page}`, `size=${size}`];
    if (search) params.push(`search=${encodeURIComponent(search)}`);
    return this.http.get<ApiResponse<Page<GroupMember>>>(`${this.api}/${id}/members?${params.join('&')}`);
  }

  changeMemberRole(groupId: number, userId: number, role: GroupRole): Observable<ApiResponse<void>> {
    return this.http.put<ApiResponse<void>>(`${this.api}/${groupId}/members/${userId}/role`, { role });
  }

  kickMember(groupId: number, userId: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.api}/${groupId}/members/${userId}`);
  }

  // ─── Join requests ────────────────────────────────────────────────────────

  getJoinRequests(id: number): Observable<ApiResponse<JoinRequest[]>> {
    return this.http.get<ApiResponse<JoinRequest[]>>(`${this.api}/${id}/requests`);
  }

  acceptRequest(groupId: number, userId: number): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.api}/${groupId}/requests/${userId}/accept`, {});
  }

  rejectRequest(groupId: number, userId: number): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.api}/${groupId}/requests/${userId}/reject`, {});
  }
}
