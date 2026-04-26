import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { Friend } from '../models/friend.model';

@Injectable({ providedIn: 'root' })
export class FriendService {
  private readonly api = `${environment.apiUrl}/friends`;
  private http = inject(HttpClient);

  getMyFriends(): Observable<ApiResponse<Friend[]>> {
    return this.http.get<ApiResponse<Friend[]>>(this.api);
  }

  search(q: string): Observable<ApiResponse<Friend[]>> {
    return this.http.get<ApiResponse<Friend[]>>(`${this.api}/search`, { params: { q } });
  }

  getPendingRequests(): Observable<ApiResponse<Friend[]>> {
    return this.http.get<ApiResponse<Friend[]>>(`${this.api}/requests`);
  }

  sendRequest(userId: number): Observable<ApiResponse<Friend>> {
    return this.http.post<ApiResponse<Friend>>(`${this.api}/request/${userId}`, {});
  }

  acceptRequest(friendshipId: number): Observable<ApiResponse<Friend>> {
    return this.http.post<ApiResponse<Friend>>(`${this.api}/${friendshipId}/accept`, {});
  }

  rejectRequest(friendshipId: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.api}/${friendshipId}/reject`);
  }

  removeFriend(friendshipId: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.api}/${friendshipId}`);
  }
}
