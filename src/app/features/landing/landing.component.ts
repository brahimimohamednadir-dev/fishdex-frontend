import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [RouterLink],
  template: `
    <!-- ===== HERO ===== -->
    <section class="bg-white">
      <div class="max-w-6xl mx-auto px-5 pt-16 pb-20 md:pt-24 md:pb-28">
        <div class="max-w-3xl">

          <!-- Badge -->
          <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 text-xs font-semibold text-gray-600 mb-8">
            <span class="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
            Gratuit jusqu'à 50 captures
          </div>

          <h1 class="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 tracking-tight leading-tight">
            Ton carnet de pêche<br>
            <span class="text-gray-400">numérique.</span>
          </h1>

          <p class="mt-6 text-lg text-gray-500 leading-relaxed max-w-xl">
            Enregistre chaque prise, découvre 200+ espèces, suis ta progression et rejoins une communauté de pêcheurs passionnés.
          </p>

          <div class="mt-10 flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <a routerLink="/register"
               class="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-700 transition-all shadow-sm">
              Commencer gratuitement →
            </a>
            <a routerLink="/species"
               class="inline-flex items-center gap-2 px-6 py-3 bg-white text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all">
              🐟 Explorer les espèces
            </a>
          </div>

          <!-- Social proof -->
          <div class="mt-10 flex items-center gap-3">
            <div class="flex -space-x-2">
              @for (a of avatars; track a) {
                <div class="w-8 h-8 rounded-full bg-gray-900 border-2 border-white flex items-center justify-center text-xs font-bold text-white">
                  {{ a }}
                </div>
              }
            </div>
            <p class="text-sm text-gray-500">
              <span class="font-semibold text-gray-900">4 millions</span> de pêcheurs en France
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- ===== STATS ===== -->
    <section class="border-t border-b border-gray-100 bg-gray-50">
      <div class="max-w-6xl mx-auto px-5 py-12">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
          @for (stat of stats; track stat.label) {
            <div class="text-center">
              <p class="text-3xl font-bold text-gray-900">{{ stat.value }}</p>
              <p class="text-sm text-gray-500 mt-1">{{ stat.label }}</p>
            </div>
          }
        </div>
      </div>
    </section>

    <!-- ===== FEATURES ===== -->
    <section class="bg-white py-20">
      <div class="max-w-6xl mx-auto px-5">

        <div class="max-w-xl mb-14">
          <h2 class="text-3xl font-bold text-gray-900 tracking-tight">Tout ce qu'il te faut.</h2>
          <p class="mt-3 text-gray-500">De l'enregistrement de ta prise jusqu'à la communauté, FishDex couvre tout le parcours du pêcheur.</p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          @for (feat of features; track feat.title) {
            <div class="group p-6 bg-white border border-gray-100 rounded-2xl hover:border-gray-200 hover:shadow-md transition-all duration-200">
              <div class="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-xl mb-4 group-hover:bg-gray-100 transition-colors">
                {{ feat.icon }}
              </div>
              <h3 class="font-semibold text-gray-900 mb-2">{{ feat.title }}</h3>
              <p class="text-sm text-gray-500 leading-relaxed">{{ feat.desc }}</p>
            </div>
          }
        </div>
      </div>
    </section>

    <!-- ===== HOW IT WORKS ===== -->
    <section class="bg-gray-50 py-20">
      <div class="max-w-6xl mx-auto px-5">
        <h2 class="text-3xl font-bold text-gray-900 tracking-tight text-center mb-14">
          Simple comme une ligne à l'eau.
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          @for (step of steps; track step.num) {
            <div class="text-center">
              <div class="w-12 h-12 rounded-2xl bg-gray-900 text-white font-bold text-lg flex items-center justify-center mx-auto mb-4">
                {{ step.num }}
              </div>
              <h3 class="font-semibold text-gray-900 mb-2">{{ step.title }}</h3>
              <p class="text-sm text-gray-500 leading-relaxed">{{ step.desc }}</p>
            </div>
          }
        </div>
      </div>
    </section>

    <!-- ===== PRICING ===== -->
    <section class="bg-white py-20">
      <div class="max-w-6xl mx-auto px-5">
        <div class="text-center max-w-xl mx-auto mb-14">
          <h2 class="text-3xl font-bold text-gray-900 tracking-tight">Commence gratuitement.</h2>
          <p class="mt-3 text-gray-500">Pas de carte bancaire, pas d'engagement. Passe premium quand tu veux.</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">

          <!-- Free -->
          <div class="p-8 bg-gray-50 border border-gray-100 rounded-2xl">
            <p class="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Freemium</p>
            <p class="text-4xl font-bold text-gray-900">0€</p>
            <p class="text-sm text-gray-500 mt-1">Pour toujours</p>
            <ul class="mt-6 space-y-3">
              @for (item of freeFeatures; track item) {
                <li class="flex items-center gap-3 text-sm text-gray-700">
                  <span class="text-green-500 font-bold">✓</span>
                  {{ item }}
                </li>
              }
            </ul>
            <a routerLink="/register"
               class="mt-8 block w-full text-center py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all">
              Créer un compte
            </a>
          </div>

          <!-- Premium -->
          <div class="relative p-8 bg-gray-900 border border-gray-900 rounded-2xl text-white">
            <span class="absolute top-4 right-4 text-xs font-semibold bg-white/10 text-white px-2.5 py-1 rounded-full">
              Populaire
            </span>
            <p class="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-2">Premium</p>
            <p class="text-4xl font-bold">3€</p>
            <p class="text-sm text-gray-400 mt-1">par mois</p>
            <ul class="mt-6 space-y-3">
              @for (item of premiumFeatures; track item) {
                <li class="flex items-center gap-3 text-sm text-gray-300">
                  <span class="text-amber-400 font-bold">✓</span>
                  {{ item }}
                </li>
              }
            </ul>
            <a routerLink="/register"
               class="mt-8 block w-full text-center py-2.5 text-sm font-semibold text-gray-900 bg-white rounded-xl hover:bg-gray-100 transition-all">
              Essayer Premium →
            </a>
          </div>

        </div>
      </div>
    </section>

    <!-- ===== CTA FINAL ===== -->
    <section class="bg-gray-900 py-20">
      <div class="max-w-2xl mx-auto px-5 text-center">
        <span class="text-5xl">🎣</span>
        <h2 class="mt-6 text-3xl font-bold text-white tracking-tight">
          Prêt pour ta prochaine sortie ?
        </h2>
        <p class="mt-4 text-gray-400">Rejoins FishDex et commence à construire ton journal de pêche.</p>
        <a routerLink="/register"
           class="inline-flex items-center gap-2 mt-8 px-8 py-3.5 bg-white text-gray-900 text-sm font-bold rounded-xl hover:bg-gray-100 transition-all">
          Créer mon compte gratuitement →
        </a>
        <p class="mt-4 text-xs text-gray-600">Déjà inscrit ? <a routerLink="/login" class="underline hover:text-gray-400">Se connecter</a></p>
      </div>
    </section>

    <!-- ===== FOOTER ===== -->
    <footer class="bg-gray-950 py-8">
      <div class="max-w-6xl mx-auto px-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div class="flex items-center gap-2 text-gray-400">
          <span>🎣</span>
          <span class="text-sm font-medium">FishDex</span>
        </div>
        <p class="text-xs text-gray-600">© 2026 FishDex · Carnet de pêche numérique</p>
      </div>
    </footer>
  `,
})
export class LandingComponent {
  avatars = ['J', 'M', 'P', 'T'];

  stats = [
    { value: '4M+',  label: 'Pêcheurs en France' },
    { value: '200+', label: 'Espèces référencées' },
    { value: '50k+', label: 'Captures enregistrées' },
    { value: '4.9★', label: 'Note moyenne' },
  ];

  features = [
    { icon: '📸', title: 'Journal photo', desc: 'Capture le moment avec une photo, le poids, la taille et les coordonnées GPS.' },
    { icon: '🐟', title: 'Encyclopédie', desc: '200+ espèces avec descriptions, tailles légales, habitats et techniques de pêche.' },
    { icon: '🏆', title: 'Badges & défis', desc: "Débloque des badges au fil de tes prises. Premier brochet, record personnel, série..." },
    { icon: '📊', title: 'Statistiques', desc: 'Suivi de ton poids total, meilleures prises, mois les plus actifs et bien plus.' },
    { icon: '👥', title: 'Groupes', desc: 'Rejoins des clubs, partage tes sorties et consulte le fil de tes amis pêcheurs.' },
    { icon: '📍', title: 'Géolocalisation', desc: 'Enregistre automatiquement les coordonnées de tes spots secrets.' },
  ];

  steps = [
    { num: '1', title: 'Crée ton compte', desc: 'Inscription en 30 secondes. Aucune carte bancaire requise.' },
    { num: '2', title: 'Enregistre ta prise', desc: 'Photo, poids, taille, espèce — tout en quelques tapotements.' },
    { num: '3', title: 'Suis ta progression', desc: 'Tes stats, badges et records se construisent à chaque sortie.' },
  ];

  freeFeatures = [
    '50 captures maximum',
    'Accès encyclopédie',
    'Badges de base',
    '1 groupe',
  ];

  premiumFeatures = [
    'Captures illimitées',
    'Export PDF / Excel',
    'Badges exclusifs',
    'Groupes illimités',
    'Support prioritaire',
  ];
}
