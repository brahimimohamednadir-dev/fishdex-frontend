import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';
import { environment } from '../../../environments/environment';

interface CapturePoint {
  id: number;
  speciesName: string;
  weight: number | null;
  latitude: number;
  longitude: number;
  caughtAt: string;
  photoUrl: string | null;
}

interface ApiResponse<T> { success: boolean; data: T; }
interface PageData<T> { content: T[]; totalElements: number; last: boolean; }

declare const L: any; // Leaflet global

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="flex flex-col h-screen">
      <!-- Header -->
      <div class="bg-warm-50 border-b border-warm-200 px-4 py-3 flex items-center justify-between flex-shrink-0">
        <div>
          <h1 class="text-base font-semibold text-warm-900">🗺️ Mes spots</h1>
          <p class="text-xs text-warm-400">{{ pointCount() }} captures géolocalisées</p>
        </div>
        <a routerLink="/captures/new"
           class="px-3 py-1.5 rounded-xl text-xs font-semibold text-white bg-forest-600 hover:bg-forest-700 transition-all">
          + Capture
        </a>
      </div>

      <!-- Map container -->
      <div id="fishdex-map" class="flex-1 relative">
        @if (loading()) {
          <div class="absolute inset-0 flex items-center justify-center bg-warm-100 z-10">
            <div class="text-center">
              <div class="w-8 h-8 border-2 border-forest-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p class="text-sm text-warm-500">Chargement de la carte...</p>
            </div>
          </div>
        }
        @if (!loading() && pointCount() === 0) {
          <div class="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
            <div class="bg-white border border-warm-200 rounded-2xl p-6 text-center shadow-lg max-w-xs mx-4">
              <p class="text-3xl mb-2">🎣</p>
              <p class="text-sm font-semibold text-warm-800 mb-1">Aucun spot enregistré</p>
              <p class="text-xs text-warm-400">Active la géolocalisation lors de l'ajout d'une capture</p>
            </div>
          </div>
        }
      </div>
    </div>
  `,
})
export class MapComponent implements OnInit, OnDestroy {
  private http = inject(HttpClient);
  private auth = inject(AuthService);

  loading    = signal(true);
  pointCount = signal(0);
  private map: any = null;

  ngOnInit(): void {
    this.loadLeaflet().then(() => this.initMap());
  }

  ngOnDestroy(): void {
    if (this.map) { this.map.remove(); this.map = null; }
  }

  private loadLeaflet(): Promise<void> {
    return new Promise(resolve => {
      if ((window as any).L) { resolve(); return; }

      // CSS
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);

      // JS
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = () => resolve();
      document.head.appendChild(script);
    });
  }

  private initMap(): void {
    this.map = L.map('fishdex-map', { zoomControl: true }).setView([46.5, 2.3], 6);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
      maxZoom: 18,
    }).addTo(this.map);

    this.loadCaptures();
  }

  private loadCaptures(): void {
    const user = this.auth.currentUser$.getValue();
    if (!user) { this.loading.set(false); return; }

    this.http.get<ApiResponse<PageData<CapturePoint>>>(
      `${environment.apiUrl}/captures?page=0&size=200`
    ).subscribe({
      next: res => {
        const captures = (res.data as any)?.content ?? [];
        const withGps = captures.filter((c: CapturePoint) => c.latitude && c.longitude);
        this.pointCount.set(withGps.length);
        this.addMarkers(withGps);
        this.loading.set(false);

        if (withGps.length > 0) {
          const bounds = L.latLngBounds(withGps.map((c: CapturePoint) => [c.latitude, c.longitude]));
          this.map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
        }
      },
      error: () => this.loading.set(false),
    });
  }

  private addMarkers(captures: CapturePoint[]): void {
    // Icône personnalisée
    const icon = L.divIcon({
      html: `<div style="
        width:32px;height:32px;border-radius:50% 50% 50% 0;
        background:linear-gradient(135deg,#2d6a4f,#40916c);
        border:2px solid white;
        box-shadow:0 2px 6px rgba(0,0,0,0.3);
        display:flex;align-items:center;justify-content:center;
        font-size:14px;transform:rotate(-45deg)
      "><span style="transform:rotate(45deg)">🎣</span></div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      className: '',
    });

    // Cluster manuel par proximité
    const clusters: Map<string, CapturePoint[]> = new Map();
    captures.forEach(c => {
      const key = `${Math.round(c.latitude * 100) / 100},${Math.round(c.longitude * 100) / 100}`;
      if (!clusters.has(key)) clusters.set(key, []);
      clusters.get(key)!.push(c);
    });

    clusters.forEach((group, _key) => {
      const lat = group.reduce((s, c) => s + c.latitude, 0) / group.length;
      const lng = group.reduce((s, c) => s + c.longitude, 0) / group.length;

      const popup = group.map(c => `
        <div style="padding:4px 0;border-bottom:1px solid #eee;last-child:border-0">
          <strong style="font-size:13px">${c.speciesName}</strong>
          ${c.weight ? `<span style="color:#2d6a4f;font-size:12px"> · ${c.weight} kg</span>` : ''}
          <div style="font-size:11px;color:#888">${new Date(c.caughtAt).toLocaleDateString('fr-FR')}</div>
        </div>
      `).join('');

      const markerIcon = group.length > 1
        ? L.divIcon({
            html: `<div style="
              width:36px;height:36px;border-radius:50%;
              background:linear-gradient(135deg,#2d6a4f,#40916c);
              border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);
              display:flex;align-items:center;justify-content:center;
              color:white;font-size:12px;font-weight:700
            ">${group.length}</div>`,
            iconSize: [36, 36],
            iconAnchor: [18, 18],
            className: '',
          })
        : icon;

      L.marker([lat, lng], { icon: markerIcon })
        .addTo(this.map)
        .bindPopup(`<div style="min-width:160px;font-family:sans-serif">${popup}</div>`);
    });
  }
}
