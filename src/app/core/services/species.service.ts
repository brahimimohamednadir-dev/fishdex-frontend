import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { Species } from '../models/species.model';
import { Page } from '../models/capture.model';

@Injectable({ providedIn: 'root' })
export class SpeciesService {
  private readonly api = `${environment.apiUrl}/species`;
  private http = inject(HttpClient);

  getAllSpecies(page = 0, size = 20): Observable<ApiResponse<Page<Species>>> {
    return this.http.get<ApiResponse<Page<Species>>>(`${this.api}?page=${page}&size=${size}`);
  }

  searchSpecies(query: string, page = 0, size = 20): Observable<ApiResponse<Page<Species>>> {
    return this.http.get<ApiResponse<Page<Species>>>(
      `${this.api}?page=${page}&size=${size}&search=${encodeURIComponent(query)}`
    );
  }

  getSpeciesById(id: number): Observable<ApiResponse<Species>> {
    return this.http.get<ApiResponse<Species>>(`${this.api}/${id}`);
  }
}
