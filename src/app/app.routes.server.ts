import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  // Routes avec paramètres dynamiques → rendu côté serveur (SSR)
  { path: 'captures/:id',              renderMode: RenderMode.Server },
  { path: 'species/:id',               renderMode: RenderMode.Server },
  { path: 'groups/:id',                renderMode: RenderMode.Server },
  { path: 'groups/:id/members',        renderMode: RenderMode.Server },
  { path: 'groups/:id/admin',          renderMode: RenderMode.Server },
  { path: 'groups/:id/admin/requests', renderMode: RenderMode.Server },
  { path: 'groups/:id/admin/reports',  renderMode: RenderMode.Server },
  { path: 'u/:username',              renderMode: RenderMode.Server },
  // Toutes les autres routes → prerender
  { path: '**',                        renderMode: RenderMode.Prerender },
];
