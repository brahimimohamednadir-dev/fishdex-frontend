import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-cgu',
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
          Conditions Générales d'Utilisation
        </h1>
        <p class="text-sm text-warm-500 mb-10">Version 1.0 — En vigueur à compter du 1er mai 2026</p>

        <div class="prose prose-sm max-w-none space-y-8 text-warm-700 leading-relaxed">

          <section>
            <h2 class="text-lg font-semibold text-warm-900 mb-3">1. Présentation du service</h2>
            <p>
              FishDex est une application de carnet de pêche numérique éditée par FishDex SAS, permettant aux utilisateurs
              d'enregistrer leurs captures, d'identifier les espèces aquatiques et d'interagir avec une communauté de pêcheurs.
            </p>
          </section>

          <section>
            <h2 class="text-lg font-semibold text-warm-900 mb-3">2. Accès au service</h2>
            <p>
              L'accès à FishDex est réservé aux personnes physiques majeures (18 ans ou plus) ou aux mineurs dûment autorisés par
              leur représentant légal. En créant un compte, vous déclarez avoir pris connaissance des présentes CGU et les accepter
              sans réserve.
            </p>
            <p class="mt-3">
              L'inscription est gratuite. Certaines fonctionnalités avancées peuvent être soumises à un abonnement payant dont les
              conditions sont précisées lors de la souscription.
            </p>
          </section>

          <section>
            <h2 class="text-lg font-semibold text-warm-900 mb-3">3. Compte utilisateur</h2>
            <p>
              Chaque utilisateur est responsable de la confidentialité de ses identifiants. FishDex ne peut être tenu responsable
              des accès non autorisés résultant d'une négligence de l'utilisateur. Vous vous engagez à :
            </p>
            <ul class="list-disc list-inside mt-2 space-y-1">
              <li>Fournir des informations exactes lors de votre inscription</li>
              <li>Ne pas créer plusieurs comptes</li>
              <li>Signaler immédiatement toute utilisation frauduleuse à <a href="mailto:contact@fishdex.fr" class="text-forest-600 hover:underline">contact@fishdex.fr</a></li>
            </ul>
          </section>

          <section>
            <h2 class="text-lg font-semibold text-warm-900 mb-3">4. Contenu utilisateur</h2>
            <p>
              En publiant du contenu sur FishDex (photos, commentaires, captures), vous accordez à FishDex une licence non exclusive,
              mondiale, gratuite pour afficher et distribuer ce contenu dans le cadre du service. Vous conservez l'intégralité de
              vos droits de propriété intellectuelle.
            </p>
            <p class="mt-3">
              Il est strictement interdit de publier tout contenu illicite, offensant, à caractère haineux, pornographique ou
              portant atteinte aux droits de tiers. FishDex se réserve le droit de supprimer tout contenu non conforme sans
              préavis.
            </p>
          </section>

          <section>
            <h2 class="text-lg font-semibold text-warm-900 mb-3">5. Règles de la communauté</h2>
            <ul class="list-disc list-inside space-y-1">
              <li>Respecter la réglementation en vigueur concernant la pêche dans votre pays</li>
              <li>Ne pas promouvoir de pratiques illégales (braconnage, espèces protégées)</li>
              <li>Traiter les autres membres avec respect</li>
              <li>Ne pas utiliser le service à des fins commerciales sans autorisation</li>
            </ul>
          </section>

          <section>
            <h2 class="text-lg font-semibold text-warm-900 mb-3">6. Disponibilité et responsabilité</h2>
            <p>
              FishDex s'efforce de maintenir le service disponible 24h/24, 7j/7, mais ne garantit pas une disponibilité
              ininterrompue. FishDex ne peut être tenu responsable des pertes de données, interruptions de service ou dommages
              indirects résultant de l'utilisation du service.
            </p>
            <p class="mt-3">
              Les informations relatives aux espèces et aux spots de pêche sont fournies à titre indicatif. FishDex ne garantit
              pas leur exactitude et décline toute responsabilité en cas d'accident lié à la pratique de la pêche.
            </p>
          </section>

          <section>
            <h2 class="text-lg font-semibold text-warm-900 mb-3">7. Résiliation</h2>
            <p>
              Vous pouvez supprimer votre compte à tout moment depuis les paramètres de votre profil. Cette suppression entraîne
              l'effacement définitif de vos données conformément au RGPD (Art. 17). FishDex se réserve le droit de suspendre ou
              supprimer tout compte en violation des présentes CGU.
            </p>
          </section>

          <section>
            <h2 class="text-lg font-semibold text-warm-900 mb-3">8. Modification des CGU</h2>
            <p>
              FishDex peut modifier les présentes CGU à tout moment. Les utilisateurs seront informés par email des modifications
              substantielles. La poursuite de l'utilisation du service après notification vaut acceptation des nouvelles conditions.
            </p>
          </section>

          <section>
            <h2 class="text-lg font-semibold text-warm-900 mb-3">9. Droit applicable</h2>
            <p>
              Les présentes CGU sont soumises au droit français. Tout litige sera soumis à la compétence des tribunaux français.
              Pour tout différend, vous pouvez également recourir à la médiation en ligne via la plateforme européenne
              <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer" class="text-forest-600 hover:underline">ec.europa.eu/consumers/odr</a>.
            </p>
          </section>

          <section>
            <h2 class="text-lg font-semibold text-warm-900 mb-3">10. Contact</h2>
            <p>
              Pour toute question relative aux présentes CGU :
              <a href="mailto:contact@fishdex.fr" class="text-forest-600 hover:underline ml-1">contact&#64;fishdex.fr</a>
            </p>
          </section>

        </div>

        <!-- Footer links -->
        <div class="mt-12 pt-8 border-t border-warm-200 flex flex-wrap gap-4 text-sm text-warm-500">
          <a routerLink="/privacy" class="hover:text-forest-700 transition-colors">Politique de confidentialité</a>
          <a routerLink="/" class="hover:text-forest-700 transition-colors">Retour à l'accueil</a>
          <a routerLink="/register" class="hover:text-forest-700 transition-colors">S'inscrire</a>
        </div>
      </main>
    </div>
  `,
})
export class CguComponent {}
