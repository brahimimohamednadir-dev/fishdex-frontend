import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-privacy',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="min-h-screen bg-warm-50">

      <!-- Header -->
      <header class="bg-white border-b border-warm-200">
        <div class="max-w-3xl mx-auto px-6 py-5 flex items-center justify-between">
          <a routerLink="/" class="flex items-center gap-2 text-warm-900 hover:text-forest-700 transition-colors">
            <span class="text-xl">🎣</span>
            <span class="font-bold tracking-tight">FishDex</span>
          </a>
          <span class="text-xs text-warm-400">Mise à jour : avril 2026</span>
        </div>
      </header>

      <!-- Content -->
      <main class="max-w-3xl mx-auto px-6 py-12" id="main-content">
        <h1 class="text-3xl font-bold text-warm-900 tracking-tight mb-2">
          Politique de Confidentialité
        </h1>
        <p class="text-sm text-warm-500 mb-10">
          Conformément au Règlement Général sur la Protection des Données (RGPD — UE 2016/679)
        </p>

        <div class="space-y-8 text-warm-700 leading-relaxed text-sm">

          <section>
            <h2 class="text-lg font-semibold text-warm-900 mb-3">1. Responsable du traitement</h2>
            <div class="bg-warm-100 rounded-2xl p-4 space-y-1 text-sm">
              <p><strong>FishDex SAS</strong></p>
              <p>Email : <a href="mailto:rgpd@fishdex.fr" class="text-forest-600 hover:underline">rgpd&#64;fishdex.fr</a></p>
            </div>
          </section>

          <section>
            <h2 class="text-lg font-semibold text-warm-900 mb-3">2. Données collectées</h2>
            <div class="overflow-x-auto">
              <table class="w-full text-sm border-collapse">
                <thead>
                  <tr class="bg-warm-100">
                    <th class="text-left p-3 rounded-tl-xl font-semibold text-warm-800">Donnée</th>
                    <th class="text-left p-3 font-semibold text-warm-800">Finalité</th>
                    <th class="text-left p-3 rounded-tr-xl font-semibold text-warm-800">Base légale</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-warm-200">
                  @for (row of dataTable; track row.data) {
                    <tr class="hover:bg-warm-50">
                      <td class="p-3 font-medium text-warm-900">{{ row.data }}</td>
                      <td class="p-3">{{ row.purpose }}</td>
                      <td class="p-3 text-forest-700 font-medium">{{ row.basis }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 class="text-lg font-semibold text-warm-900 mb-3">3. Durée de conservation</h2>
            <ul class="space-y-2">
              <li class="flex gap-3">
                <span class="text-forest-600 shrink-0">▸</span>
                <span><strong>Données de compte</strong> — conservées jusqu'à la suppression du compte</span>
              </li>
              <li class="flex gap-3">
                <span class="text-forest-600 shrink-0">▸</span>
                <span><strong>Captures et contenu</strong> — supprimés avec le compte (Art. 17 RGPD)</span>
              </li>
              <li class="flex gap-3">
                <span class="text-forest-600 shrink-0">▸</span>
                <span><strong>Logs de sécurité</strong> — 12 mois</span>
              </li>
              <li class="flex gap-3">
                <span class="text-forest-600 shrink-0">▸</span>
                <span><strong>Tokens d'authentification</strong> — 7 jours (refresh token), 1h (access token)</span>
              </li>
            </ul>
          </section>

          <section>
            <h2 class="text-lg font-semibold text-warm-900 mb-3">4. Partage des données</h2>
            <p>
              FishDex ne vend ni ne loue vos données personnelles. Les données peuvent être partagées avec :
            </p>
            <ul class="mt-3 space-y-2">
              <li class="flex gap-3">
                <span class="text-forest-600 shrink-0">▸</span>
                <span><strong>Cloudinary</strong> — hébergement des photos de captures (serveurs UE)</span>
              </li>
              <li class="flex gap-3">
                <span class="text-forest-600 shrink-0">▸</span>
                <span><strong>Google</strong> — authentification OAuth2 (si vous choisissez cette option)</span>
              </li>
              <li class="flex gap-3">
                <span class="text-forest-600 shrink-0">▸</span>
                <span><strong>OpenWeatherMap</strong> — données météo associées à vos spots (anonymisées)</span>
              </li>
            </ul>
            <p class="mt-3">
              Tous nos prestataires sont soumis à des accords de traitement conformes au RGPD.
            </p>
          </section>

          <section>
            <h2 class="text-lg font-semibold text-warm-900 mb-3">5. Cookies et traceurs</h2>
            <p>
              FishDex utilise uniquement des cookies techniques strictement nécessaires au fonctionnement
              du service (authentification JWT en localStorage). Aucun cookie publicitaire ou de tracking
              tiers n'est déposé sans votre consentement explicite.
            </p>
          </section>

          <section>
            <h2 class="text-lg font-semibold text-warm-900 mb-3">6. Vos droits (Art. 12–22 RGPD)</h2>
            <div class="grid sm:grid-cols-2 gap-3">
              @for (right of rights; track right.title) {
                <div class="bg-white border border-warm-200 rounded-2xl p-4">
                  <p class="font-semibold text-warm-900 text-sm">{{ right.article }} — {{ right.title }}</p>
                  <p class="text-xs text-warm-500 mt-1">{{ right.desc }}</p>
                </div>
              }
            </div>
            <p class="mt-4">
              Pour exercer vos droits, contactez-nous à
              <a href="mailto:rgpd@fishdex.fr" class="text-forest-600 hover:underline ml-1">rgpd&#64;fishdex.fr</a>.
              Réponse sous 30 jours. Vous pouvez également introduire une réclamation auprès de la
              <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" class="text-forest-600 hover:underline">CNIL</a>.
            </p>
            <div class="mt-4 bg-forest-50 border border-forest-200 rounded-2xl p-4">
              <p class="text-sm font-semibold text-forest-900">⚡ Droits accessibles directement dans l'app</p>
              <p class="text-xs text-forest-700 mt-1">
                Depuis votre profil : <strong>Exporter mes données</strong> (Art. 20) et
                <strong>Supprimer mon compte</strong> (Art. 17) — immédiat et irrévocable.
              </p>
            </div>
          </section>

          <section>
            <h2 class="text-lg font-semibold text-warm-900 mb-3">7. Sécurité</h2>
            <p>
              FishDex met en œuvre des mesures de sécurité adaptées : chiffrement HTTPS (TLS 1.2+),
              hachage BCrypt des mots de passe, authentification deux facteurs disponible (TOTP),
              verrouillage automatique après tentatives de connexion échouées, headers de sécurité
              (CSP, HSTS, X-Frame-Options).
            </p>
          </section>

          <section>
            <h2 class="text-lg font-semibold text-warm-900 mb-3">8. Modifications</h2>
            <p>
              Cette politique peut être mise à jour. Toute modification substantielle vous sera notifiée
              par email avec un préavis de 30 jours. La date de dernière mise à jour figure en haut de
              cette page.
            </p>
          </section>

        </div>

        <!-- Footer links -->
        <div class="mt-12 pt-8 border-t border-warm-200 flex flex-wrap gap-4 text-sm text-warm-500">
          <a routerLink="/cgu" class="hover:text-forest-700 transition-colors">Conditions d'utilisation</a>
          <a routerLink="/" class="hover:text-forest-700 transition-colors">Retour à l'accueil</a>
          <a routerLink="/register" class="hover:text-forest-700 transition-colors">S'inscrire</a>
        </div>
      </main>
    </div>
  `,
})
export class PrivacyComponent {

  readonly dataTable = [
    { data: 'Email',              purpose: 'Connexion, notifications, vérification',    basis: 'Contrat' },
    { data: 'Nom d\'utilisateur', purpose: 'Identité publique dans la communauté',       basis: 'Contrat' },
    { data: 'Mot de passe',       purpose: 'Authentification (haché BCrypt)',            basis: 'Contrat' },
    { data: 'Captures',           purpose: 'Fonctionnalité principale de l\'app',        basis: 'Contrat' },
    { data: 'Coordonnées GPS',    purpose: 'Localisation des spots (opt-in par capture)',basis: 'Consentement' },
    { data: 'Photos',             purpose: 'Illustration des captures',                  basis: 'Consentement' },
    { data: 'Adresse IP',         purpose: 'Sécurité, anti-fraude, logs',               basis: 'Intérêt légitime' },
    { data: 'Consentements',      purpose: 'Preuve RGPD Art. 7 (marketing/analytics)',   basis: 'Obligation légale' },
  ];

  readonly rights = [
    { article: 'Art. 15', title: 'Accès',       desc: 'Obtenir une copie de vos données' },
    { article: 'Art. 16', title: 'Rectification', desc: 'Corriger des données inexactes' },
    { article: 'Art. 17', title: 'Effacement',  desc: 'Supprimer votre compte et données' },
    { article: 'Art. 18', title: 'Limitation',  desc: 'Geler le traitement de vos données' },
    { article: 'Art. 20', title: 'Portabilité', desc: 'Exporter vos données en JSON' },
    { article: 'Art. 21', title: 'Opposition',  desc: 'Vous opposer au traitement marketing' },
  ];
}
