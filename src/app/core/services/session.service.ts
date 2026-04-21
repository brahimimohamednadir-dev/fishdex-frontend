import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { UserSession } from '../models/session.model';

@Injectable({ providedIn: 'root' })
export class SessionService {
  private http = inject(HttpClient);
  private api  = `${environment.apiUrl}/users/me/sessions`;

  getSessions(): Observable<ApiResponse<UserSession[]>> {
    return this.http.get<ApiResponse<UserSession[]>>(this.api);
  }

  revokeSession(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.api}/${id}`);
  }

  revokeAllOthers(): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.api}/others`);
  }
}
