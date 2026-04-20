import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { Badge } from '../models/badge.model';

@Injectable({ providedIn: 'root' })
export class BadgeService {
  private readonly api = `${environment.apiUrl}/badges`;
  private http = inject(HttpClient);

  getMyBadges(): Observable<ApiResponse<Badge[]>> {
    return this.http.get<ApiResponse<Badge[]>>(`${this.api}/me`);
  }
}
