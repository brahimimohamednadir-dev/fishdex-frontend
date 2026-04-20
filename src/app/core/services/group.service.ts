import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { Group, FeedItem, GroupRequest } from '../models/group.model';
import { Page } from '../models/capture.model';

@Injectable({ providedIn: 'root' })
export class GroupService {
  private readonly api = `${environment.apiUrl}/groups`;
  private http = inject(HttpClient);

  createGroup(request: GroupRequest): Observable<ApiResponse<Group>> {
    return this.http.post<ApiResponse<Group>>(this.api, request);
  }

  getGroupById(id: number): Observable<ApiResponse<Group>> {
    return this.http.get<ApiResponse<Group>>(`${this.api}/${id}`);
  }

  joinGroup(id: number): Observable<ApiResponse<null>> {
    return this.http.post<ApiResponse<null>>(`${this.api}/${id}/join`, {});
  }

  getGroupFeed(id: number, page = 0, size = 20): Observable<ApiResponse<Page<FeedItem>>> {
    return this.http.get<ApiResponse<Page<FeedItem>>>(
      `${this.api}/${id}/feed?page=${page}&size=${size}`
    );
  }
}
