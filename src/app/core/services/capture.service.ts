import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { Capture, CaptureRequest, Page } from '../models/capture.model';

@Injectable({ providedIn: 'root' })
export class CaptureService {
  private readonly api = `${environment.apiUrl}/captures`;
  private http = inject(HttpClient);

  getMyCaptures(page = 0, size = 12): Observable<ApiResponse<Page<Capture>>> {
    return this.http.get<ApiResponse<Page<Capture>>>(`${this.api}?page=${page}&size=${size}`);
  }

  getCaptureById(id: number): Observable<ApiResponse<Capture>> {
    return this.http.get<ApiResponse<Capture>>(`${this.api}/${id}`);
  }

  createCapture(request: CaptureRequest): Observable<ApiResponse<Capture>> {
    return this.http.post<ApiResponse<Capture>>(this.api, request);
  }

  updateCapture(id: number, request: CaptureRequest): Observable<ApiResponse<Capture>> {
    return this.http.put<ApiResponse<Capture>>(`${this.api}/${id}`, request);
  }

  // DELETE returns 204 No Content — pas de corps de réponse
  deleteCapture(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}`);
  }

  // Backend attend le champ "photo" (multipart)
  uploadPhoto(id: number, file: File): Observable<ApiResponse<Capture>> {
    const form = new FormData();
    form.append('photo', file);
    return this.http.post<ApiResponse<Capture>>(`${this.api}/${id}/photo`, form);
  }

  // DELETE returns 204 No Content
  deletePhoto(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}/photo`);
  }
}
