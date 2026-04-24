import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { Species } from '../models/species.model';
import { Page } from '../models/capture.model';

export interface SpeciesFilters {
  search?:     string;
  family?:     string;
  waterType?:  string;
  difficulty?: string;
  season?:     number;   // 1-12
  caughtOnly?: boolean;
  sort?:       'name' | 'popularity' | 'difficulty';
  page?:       number;
  size?:       number;
}

@Injectable({ providedIn: 'root' })
export class SpeciesService {
  private readonly api = `${environment.apiUrl}/species`;
  private http = inject(HttpClient);

  getSpecies(filters: SpeciesFilters = {}): Observable<ApiResponse<Page<Species>>> {
    let params = new HttpParams()
      .set('page', filters.page ?? 0)
      .set('size', filters.size ?? 20);
    if (filters.search)    params = params.set('search',     filters.search);
    if (filters.family)    params = params.set('family',     filters.family);
    if (filters.waterType) params = params.set('waterType',  filters.waterType);
    if (filters.difficulty)params = params.set('difficulty', filters.difficulty);
    if (filters.season)    params = params.set('season',     filters.season);
    if (filters.caughtOnly)params = params.set('caughtOnly', 'true');
    if (filters.sort)      params = params.set('sort',       filters.sort);
    return this.http.get<ApiResponse<Page<Species>>>(this.api, { params });
  }

  // Legacy shims used by CaptureNewComponent (speciesId dropdown)
  getAllSpecies(page = 0, size = 20): Observable<ApiResponse<Page<Species>>> {
    return this.getSpecies({ page, size });
  }
  searchSpecies(query: string, page = 0, size = 20): Observable<ApiResponse<Page<Species>>> {
    return this.getSpecies({ search: query, page, size });
  }

  getSpeciesById(id: number): Observable<ApiResponse<Species>> {
    return this.http.get<ApiResponse<Species>>(`${this.api}/${id}`);
  }

  addCommunityTip(speciesId: number, content: string): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.api}/${speciesId}/tips`, { content });
  }

  upvoteTip(tipId: number): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.api}/tips/${tipId}/upvote`, {});
  }
}
