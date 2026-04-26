import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { User, UserStats } from '../models/user.model';
import { PublicProfile, PersonalStats } from '../models/profile.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly api = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  getMe(): Observable<ApiResponse<User>> {
    return this.http.get<ApiResponse<User>>(`${this.api}/me`);
  }

  updateMe(username: string): Observable<ApiResponse<User>> {
    return this.http.put<ApiResponse<User>>(`${this.api}/me`, { username });
  }

  getMyStats(): Observable<ApiResponse<UserStats>> {
    return this.http.get<ApiResponse<UserStats>>(`${this.api}/me/stats`);
  }

  getPublicProfile(username: string): Observable<ApiResponse<PublicProfile>> {
    return this.http.get<ApiResponse<PublicProfile>>(`${this.api}/${username}`);
  }

  getPersonalStats(): Observable<ApiResponse<PersonalStats>> {
    return this.http.get<ApiResponse<PersonalStats>>(`${this.api}/me/personal-stats`);
  }
}
