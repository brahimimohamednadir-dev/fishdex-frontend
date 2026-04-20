import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { Group, FeedItem } from '../models/group.model';

@Injectable({ providedIn: 'root' })
export class GroupService {
  private readonly api = `${environment.apiUrl}/groups`;

  constructor(private http: HttpClient) {}

  createGroup(name: string): Observable<ApiResponse<Group>> {
    return this.http.post<ApiResponse<Group>>(this.api, { name });
  }

  getGroupById(id: number): Observable<ApiResponse<Group>> {
    return this.http.get<ApiResponse<Group>>(`${this.api}/${id}`);
  }

  joinGroup(id: number): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.api}/${id}/join`, {});
  }

  getGroupFeed(id: number): Observable<ApiResponse<FeedItem[]>> {
    return this.http.get<ApiResponse<FeedItem[]>>(`${this.api}/${id}/feed`);
  }
}
