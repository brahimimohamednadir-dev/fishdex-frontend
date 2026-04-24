export const environment = {
  production: true,
  // En production, l'URL est injectée via index.html → window.__env.apiUrl
  // Fallback sur la variable d'env Angular (à définir dans le CI/CD)
  apiUrl: (window as any).__env?.apiUrl ?? 'https://api.fishdex.fr/api',
};
