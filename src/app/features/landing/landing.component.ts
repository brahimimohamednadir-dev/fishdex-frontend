import { Component, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [RouterLink],
  styles: [`
    @keyframes float      { 0%,100%{transform:translateY(0) rotate(-1deg)} 50%{transform:translateY(-16px) rotate(1deg)} }
    @keyframes floatSlow  { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
    @keyframes ripple     { 0%{transform:scale(.8);opacity:.6} 100%{transform:scale(3.5);opacity:0} }
    @keyframes ripple2    { 0%{transform:scale(.8);opacity:.4} 100%{transform:scale(4);opacity:0} }
    @keyframes shimmerAmber { 0%{background-position:-200% center} 100%{background-position:200% center} }
    @keyframes glowAmber  { 0%,100%{box-shadow:0 0 24px rgba(196,108,42,.45),0 0 60px rgba(196,108,42,.15)} 50%{box-shadow:0 0 40px rgba(196,108,42,.65),0 0 90px rgba(196,108,42,.25)} }
    @keyframes fadeUp     { from{opacity:0;transform:translateY(32px)} to{opacity:1;transform:translateY(0)} }
    @keyframes scaleIn    { from{opacity:0;transform:scale(.88)} to{opacity:1;transform:scale(1)} }
    @keyframes mistDrift  { 0%{transform:translateX(-5%);opacity:0} 15%{opacity:.6} 85%{opacity:.4} 100%{transform:translateX(5%);opacity:0} }
    @keyframes slideRight { from{transform:translateX(-40px);opacity:0} to{transform:translateX(0);opacity:1} }

    .amber-text {
      background: linear-gradient(90deg,#8b4c18 0%,#c4742a 20%,#e8953f 42%,#f2b05e 55%,#e8953f 70%,#c4742a 85%,#8b4c18 100%);
      background-size: 200% auto;
      -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
      animation: shimmerAmber 4s linear infinite;
    }

    .btn-cta {
      background: linear-gradient(135deg,#2a5c35,#3a7448);
      transition: all .3s ease;
      animation: glowAmber 4s ease-in-out infinite;
    }
    .btn-cta:hover { transform:translateY(-3px) scale(1.02); box-shadow:0 14px 42px rgba(196,108,42,.35),0 0 60px rgba(58,116,72,.25); }

    .glass { background:rgba(255,255,255,.045); backdrop-filter:blur(20px); -webkit-backdrop-filter:blur(20px); border:1px solid rgba(255,255,255,.08); }

    .feat-card {
      background:rgba(255,255,255,.03); border:1px solid rgba(255,255,255,.07);
      transition: all .4s cubic-bezier(.175,.885,.32,1.275);
    }
    .feat-card:hover {
      background:rgba(255,255,255,.065); border-color:rgba(196,108,42,.35);
      transform:perspective(900px) translateY(-10px) rotateX(-3deg);
      box-shadow:0 28px 56px rgba(0,0,0,.6),0 0 0 1px rgba(196,108,42,.12);
    }

    .stat-card { background:rgba(255,255,255,.03); border:1px solid rgba(255,255,255,.055); transition:all .3s ease; }
    .stat-card:hover { background:rgba(255,255,255,.055); border-color:rgba(92,158,112,.3); transform:translateY(-5px); box-shadow:0 14px 36px rgba(0,0,0,.5); }

    .mock-app {
      background:linear-gradient(160deg,#0e2214 0%,#091510 100%);
      border:1px solid rgba(255,255,255,.09);
      box-shadow:0 48px 96px rgba(0,0,0,.7),inset 0 1px 0 rgba(255,255,255,.06);
      transition:transform .07s ease-out;
    }

    .step-num { background:linear-gradient(135deg,#2a5c35,#3a7448); box-shadow:0 8px 28px rgba(42,92,53,.5); }

    .ripple-ring  { position:absolute; border-radius:50%; border:1.5px solid rgba(92,158,112,.5);  animation:ripple  4s ease-out infinite; }
    .ripple-ring-2{ position:absolute; border-radius:50%; border:1px   solid rgba(196,108,42,.3);  animation:ripple2 5s ease-out infinite; }

    .mist { animation:mistDrift 18s ease-in-out infinite; }

    .a-float     { animation:float      5.5s ease-in-out infinite; }
    .a-floatSlow { animation:floatSlow  8s   ease-in-out infinite; }
    .a-fadeUp    { animation:fadeUp    .85s ease both; }
    .a-fadeUp-1  { animation:fadeUp    .85s .12s ease both; }
    .a-fadeUp-2  { animation:fadeUp    .85s .26s ease both; }
    .a-fadeUp-3  { animation:fadeUp    .85s .42s ease both; }
    .a-scaleIn   { animation:scaleIn    .8s .5s  ease both; }

    .testi-card { background:rgba(255,255,255,.03); border:1px solid rgba(255,255,255,.07); transition:all .3s ease; }
    .testi-card:hover { background:rgba(255,255,255,.06); transform:translateY(-4px); }
  `],
  template: `

    <!-- ══ HERO ══════════════════════════════════════════════════════ -->
    <section class="relative overflow-hidden"
             style="min-height:100vh;background:radial-gradient(ellipse 70% 60% at 60% 30%,rgba(92,80,40,.18) 0%,transparent 65%),radial-gradient(ellipse 55% 65% at 10% 80%,rgba(15,35,20,.55) 0%,transparent 70%),linear-gradient(170deg,#0a1a0c 0%,#0e1e10 40%,#0c1a0e 100%);">

      <div class="mist pointer-events-none absolute bottom-0 left-0 right-0"
           style="height:45%;background:linear-gradient(to top,rgba(92,158,112,.06) 0%,rgba(140,180,120,.03) 40%,transparent 100%);filter:blur(30px);"></div>

      <div class="pointer-events-none absolute a-floatSlow"
           style="width:650px;height:650px;border-radius:50%;background:radial-gradient(circle,rgba(196,108,42,.14),transparent 70%);filter:blur(90px);top:-180px;right:-80px;"></div>
      <div class="pointer-events-none absolute"
           style="width:400px;height:400px;border-radius:50%;background:radial-gradient(circle,rgba(42,92,53,.2),transparent 70%);filter:blur(70px);bottom:5%;left:5%;"></div>

      @for (r of ripples; track r.id) {
        <div [class]="r.cls" [style]="r.style"></div>
      }

      <div class="relative max-w-6xl mx-auto px-5 flex flex-col lg:flex-row items-center gap-12 lg:gap-8"
           style="min-height:100vh;padding-top:5rem;padding-bottom:5rem;">

        <!-- Texte gauche -->
        <div class="flex-1 max-w-xl lg:max-w-none lg:flex-[1.1]">

          <div class="a-fadeUp inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass text-xs font-semibold mb-8"
               style="color:rgba(92,158,112,1);">
            <span class="w-1.5 h-1.5 rounded-full animate-pulse" style="background:#5c9e70;"></span>
            100% gratuit · Aucune carte requise
          </div>

          <h1 class="a-fadeUp-1 font-black tracking-tight leading-[1.06] mb-6"
              style="font-size:clamp(2.6rem,6vw,4.4rem);color:#f0ebe2;">
            Ton carnet de pêche,<br>
            <span class="amber-text">enfin à la hauteur</span><br>
            <span style="color:rgba(240,235,226,.55);">de ta passion.</span>
          </h1>

          <p class="a-fadeUp-2 leading-relaxed max-w-md mb-10"
             style="font-size:1.08rem;color:rgba(240,235,226,.42);">
            Enregistre chaque prise avec photo et GPS, découvre 200&nbsp;+ espèces, suis ta progression et partage tes sorties avec d'autres passionnés.
          </p>

          <div class="a-fadeUp-3 flex flex-col sm:flex-row gap-3 mb-12">
            <a routerLink="/register"
               class="btn-cta inline-flex items-center justify-center gap-2.5 px-8 py-4 text-white text-sm font-bold rounded-2xl">
              Commencer gratuitement
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
              </svg>
            </a>
            <a routerLink="/species"
               class="glass inline-flex items-center justify-center gap-2 px-8 py-4 text-sm font-medium rounded-2xl transition-all"
               style="color:rgba(240,235,226,.45);"
               onmouseenter="this.style.color='rgba(240,235,226,.8)'"
               onmouseleave="this.style.color='rgba(240,235,226,.45)'">
              Explorer les espèces →
            </a>
          </div>

          <!-- Preuve sociale -->
          <div class="a-scaleIn flex items-center gap-4">
            <div class="flex -space-x-2.5">
              @for (a of avatars; track a.letter) {
                <div class="w-9 h-9 rounded-full border-2 flex items-center justify-center text-xs font-black"
                     style="border-color:#0a1a0c;color:#f0ebe2;"
                     [style.background]="a.color">{{ a.letter }}</div>
              }
            </div>
            <div>
              <div class="flex items-center gap-0.5 mb-0.5">
                @for (s of [1,2,3,4,5]; track s) {
                  <svg class="w-3 h-3" fill="#c4742a" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                }
              </div>
              <p class="text-xs" style="color:rgba(240,235,226,.3);">
                <span style="color:rgba(240,235,226,.6);font-weight:600;">4 millions</span> de pêcheurs en France
              </p>
            </div>
          </div>
        </div>

        <!-- Maquette app droite -->
        <div class="flex-1 flex items-center justify-center lg:justify-end a-scaleIn">
          <div class="relative a-float" style="width:295px;">

            <div class="absolute pointer-events-none"
                 style="inset:-28px;border-radius:2rem;background:radial-gradient(circle,rgba(196,108,42,.14),rgba(42,92,53,.1) 50%,transparent 70%);filter:blur(36px);"></div>

            <div style="position:absolute;bottom:-18px;left:50%;transform:translateX(-50%);width:180px;height:180px;">
              <div class="ripple-ring"   style="inset:20%;animation-delay:0s;"></div>
              <div class="ripple-ring"   style="inset:30%;animation-delay:1.3s;"></div>
              <div class="ripple-ring-2" style="inset:10%;animation-delay:0.7s;"></div>
            </div>

            <div class="mock-app rounded-3xl overflow-hidden p-1 cursor-default"
                 (mousemove)="onCardMove($event)"
                 (mouseleave)="onCardLeave()"
                 [style.transform]="cardTransform()">

              <div class="rounded-2xl overflow-hidden" style="background:#09130b;">
                <div class="flex justify-between items-center px-4 pt-5 pb-2">
                  <span class="text-xs font-medium" style="color:rgba(240,235,226,.22);">5:47</span>
                  <div class="flex items-center gap-1">
                    <div class="w-3 h-1.5 rounded-sm" style="background:rgba(240,235,226,.18);"></div>
                    <div class="w-1 h-1.5 rounded-sm" style="background:rgba(240,235,226,.18);"></div>
                    <div class="w-4 h-1.5 rounded-sm" style="background:rgba(240,235,226,.12);"></div>
                  </div>
                </div>

                <div class="flex items-center justify-between px-4 pb-3" style="border-bottom:1px solid rgba(255,255,255,.05);">
                  <div class="flex items-center gap-2">
                    <span class="text-base">🎣</span>
                    <span class="text-sm font-bold" style="color:#f0ebe2;">FishDex</span>
                  </div>
                  <div class="flex items-center gap-1.5">
                    <div class="w-7 h-7 rounded-xl flex items-center justify-center" style="background:rgba(42,92,53,.5);">
                      <span class="text-xs">🔔</span>
                    </div>
                    <div class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black" style="background:#2a5c35;color:#f0ebe2;">M</div>
                  </div>
                </div>

                <div class="px-4 py-3 space-y-3">
                  <div class="flex items-center gap-2 px-3 py-2 rounded-xl"
                       style="background:rgba(196,108,42,.12);border:1px solid rgba(196,108,42,.25);">
                    <span class="text-sm">🌅</span>
                    <div>
                      <p class="text-xs font-bold" style="color:#e8953f;">Sortie du matin</p>
                      <p class="text-xs" style="color:rgba(240,235,226,.35);">Rivière de l'Ain · Auj. 5h30</p>
                    </div>
                  </div>

                  <div class="rounded-2xl overflow-hidden" style="border:1px solid rgba(255,255,255,.06);">
                    <div class="relative flex items-center justify-center" style="height:128px;background:linear-gradient(140deg,#0c2a12,#071508);">
                      <span class="text-7xl opacity-25">🐟</span>
                      <div class="absolute top-2.5 left-2.5 px-2 py-1 rounded-lg text-xs font-semibold"
                           style="background:rgba(0,0,0,.5);backdrop-filter:blur(8px);color:#f0ebe2;">Brochet commun</div>
                      <div class="absolute bottom-2.5 right-2.5 flex gap-1.5">
                        <span class="px-2 py-0.5 rounded-lg text-xs font-black" style="background:rgba(42,92,53,.9);color:#f0ebe2;">4.2 kg</span>
                        <span class="px-2 py-0.5 rounded-lg text-xs font-semibold" style="background:rgba(0,0,0,.6);color:#f0ebe2;">68 cm</span>
                      </div>
                      <div class="absolute top-2.5 right-2.5 flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-bold"
                           style="background:rgba(196,108,42,.85);color:#fff;">🏆 Record</div>
                    </div>
                    <div class="px-3 py-2 flex items-center justify-between" style="background:rgba(255,255,255,.02);">
                      <span class="text-xs" style="color:rgba(240,235,226,.35);">📍 Lac de Vouglans</span>
                      <span class="text-xs" style="color:rgba(240,235,226,.22);">Auj. 06:14</span>
                    </div>
                  </div>

                  <div class="grid grid-cols-3 gap-2 pb-1">
                    @for (ms of mockStats; track ms.label) {
                      <div class="text-center py-2.5 rounded-xl" style="background:rgba(255,255,255,.03);">
                        <p class="text-sm font-black" style="color:#5c9e70;">{{ ms.val }}</p>
                        <p class="text-xs" style="color:rgba(240,235,226,.28);">{{ ms.label }}</p>
                      </div>
                    }
                  </div>
                </div>
              </div>
            </div>

            <div class="absolute -top-6 -right-6 text-3xl a-floatSlow select-none pointer-events-none" style="filter:drop-shadow(0 4px 12px rgba(196,108,42,.3));">🎣</div>
            <div class="absolute -bottom-2 -left-6 text-xl a-float select-none pointer-events-none" style="animation-delay:1.5s;">🐟</div>
          </div>
        </div>
      </div>

      <!-- Vague basse -->
      <div class="absolute bottom-0 left-0 right-0 pointer-events-none">
        <svg viewBox="0 0 1440 52" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" style="height:52px;width:100%;display:block;">
          <path d="M0,26 C240,52 480,0 720,26 C960,52 1200,4 1440,26 L1440,52 L0,52 Z" fill="#0c1a0d"/>
        </svg>
      </div>
    </section>


    <!-- ══ STATS BAR ═════════════════════════════════════════════════ -->
    <section style="background:#0c1a0d;" class="py-16">
      <div class="max-w-5xl mx-auto px-5">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          @for (stat of stats; track stat.label) {
            <div class="stat-card rounded-2xl px-6 py-7 text-center">
              <p class="text-4xl font-black mb-1 tracking-tight" style="color:#f0ebe2;">{{ stat.value }}</p>
              <p class="text-xs uppercase tracking-widest" style="color:rgba(240,235,226,.32);">{{ stat.label }}</p>
            </div>
          }
        </div>
      </div>
    </section>


    <!-- ══ FEATURES ══════════════════════════════════════════════════ -->
    <section style="background:linear-gradient(180deg,#0c1a0d 0%,#0e1e10 100%);" class="py-24">
      <div class="max-w-6xl mx-auto px-5">

        <div class="text-center max-w-2xl mx-auto mb-16">
          <p class="text-xs font-bold uppercase tracking-[4px] mb-5" style="color:#5c9e70;">Ce qu'on a construit pour toi</p>
          <h2 class="text-4xl md:text-5xl font-black tracking-tight leading-tight" style="color:#f0ebe2;">
            Tout ce qu'il faut<br>
            <span class="amber-text">pour pêcher mieux.</span>
          </h2>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          @for (feat of features; track feat.title) {
            <div class="feat-card rounded-2xl p-6 group">
              <div class="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mb-5 transition-transform duration-300 group-hover:scale-110"
                   [style]="'background:' + feat.bg + ';border:1px solid ' + feat.border">
                {{ feat.icon }}
              </div>
              <h3 class="font-bold mb-2" style="color:#f0ebe2;">{{ feat.title }}</h3>
              <p class="text-sm leading-relaxed" style="color:rgba(240,235,226,.36);">{{ feat.desc }}</p>
            </div>
          }
        </div>
      </div>
    </section>


    <!-- ══ HOW IT WORKS ══════════════════════════════════════════════ -->
    <section style="background:#0e1e10;" class="py-24 relative overflow-hidden">

      <div class="pointer-events-none select-none absolute inset-0 flex items-center justify-center overflow-hidden">
        <span class="font-black" style="font-size:20vw;color:rgba(255,255,255,.013);line-height:1;">EAU</span>
      </div>

      <div class="relative max-w-5xl mx-auto px-5">
        <div class="text-center mb-16">
          <p class="text-xs font-bold uppercase tracking-[4px] mb-5" style="color:#5c9e70;">Simple comme</p>
          <h2 class="text-4xl md:text-5xl font-black tracking-tight" style="color:#f0ebe2;">Une ligne à l'eau.</h2>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-10 relative">
          <div class="hidden md:block absolute"
               style="top:2rem;left:calc(16.67% + 1.5rem);right:calc(16.67% + 1.5rem);height:1px;background:linear-gradient(90deg,transparent,rgba(92,158,112,.5),transparent);"></div>

          @for (step of steps; track step.num) {
            <div class="text-center relative">
              <div class="step-num w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-black text-white mx-auto mb-6 relative">
                {{ step.num }}
                <div class="absolute inset-0 rounded-2xl" style="box-shadow:inset 0 1px 0 rgba(255,255,255,.2);"></div>
              </div>
              <h3 class="font-bold mb-2" style="color:#f0ebe2;">{{ step.title }}</h3>
              <p class="text-sm leading-relaxed" style="color:rgba(240,235,226,.36);">{{ step.desc }}</p>
            </div>
          }
        </div>
      </div>
    </section>


    <!-- ══ TÉMOIGNAGES ════════════════════════════════════════════════ -->
    <section style="background:linear-gradient(180deg,#0e1e10 0%,#0c1a0d 100%);" class="py-24">
      <div class="max-w-5xl mx-auto px-5">

        <div class="text-center mb-14">
          <p class="text-xs font-bold uppercase tracking-[4px] mb-5" style="color:#5c9e70;">Ils l'utilisent déjà</p>
          <h2 class="text-4xl md:text-5xl font-black tracking-tight" style="color:#f0ebe2;">
            Des pêcheurs,<br><span class="amber-text">pas des influenceurs.</span>
          </h2>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
          @for (t of testimonials; track t.name) {
            <div class="testi-card rounded-2xl p-6">
              <div class="flex items-center gap-0.5 mb-4">
                @for (s of [1,2,3,4,5]; track s) {
                  <svg class="w-3.5 h-3.5" fill="#c4742a" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                }
              </div>
              <p class="text-sm leading-relaxed mb-5" style="color:rgba(240,235,226,.5);">"{{ t.quote }}"</p>
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-full flex items-center justify-center text-sm font-black"
                     [style]="'background:' + t.color + ';color:#f0ebe2;'">{{ t.initials }}</div>
                <div>
                  <p class="text-sm font-semibold" style="color:#f0ebe2;">{{ t.name }}</p>
                  <p class="text-xs" style="color:rgba(240,235,226,.3);">{{ t.role }}</p>
                </div>
              </div>
            </div>
          }
        </div>
      </div>
    </section>


    <!-- ══ CTA FINAL ══════════════════════════════════════════════════ -->
    <section class="relative overflow-hidden py-36" style="background:#0a1509;">

      <div class="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
           style="width:560px;height:560px;border-radius:50%;background:radial-gradient(circle,rgba(196,108,42,.16),rgba(42,92,53,.1) 45%,transparent 65%);filter:blur(60px);"></div>

      <div class="pointer-events-none absolute inset-0"
           style="background-image:linear-gradient(rgba(255,255,255,.018) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.018) 1px,transparent 1px);background-size:64px 64px;"></div>

      <div class="relative max-w-2xl mx-auto px-5 text-center">
        <div class="text-7xl mb-8 inline-block a-float select-none">🎣</div>

        <h2 class="text-5xl md:text-6xl font-black tracking-tight mb-6 leading-tight" style="color:#f0ebe2;">
          Prêt pour ta<br>
          <span style="color:#5c9e70;">prochaine sortie ?</span>
        </h2>

        <p class="text-lg mb-10" style="color:rgba(240,235,226,.36);">
          Rejoins FishDex. Inscris-toi en 30 secondes et commence à construire ton journal de pêche.
        </p>

        <a routerLink="/register"
           class="btn-cta inline-flex items-center gap-3 px-10 py-4 text-white text-base font-bold rounded-2xl">
          Créer mon compte — c'est gratuit
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
          </svg>
        </a>

        <p class="mt-6 text-sm" style="color:rgba(240,235,226,.2);">
          Déjà inscrit ?
          <a routerLink="/login"
             style="color:rgba(240,235,226,.35);text-decoration:underline;"
             onmouseenter="this.style.color='rgba(240,235,226,.65)'"
             onmouseleave="this.style.color='rgba(240,235,226,.35)'">
            Se connecter
          </a>
        </p>
      </div>
    </section>


    <!-- ══ FOOTER ══════════════════════════════════════════════════════ -->
    <footer style="background:#0a1509;border-top:1px solid rgba(255,255,255,.04);" class="py-8">
      <div class="max-w-6xl mx-auto px-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div class="flex items-center gap-2.5">
          <span class="text-xl">🎣</span>
          <span class="text-sm font-bold" style="color:rgba(240,235,226,.38);">FishDex</span>
        </div>
        <p class="text-xs" style="color:rgba(240,235,226,.18);">© 2026 FishDex · Carnet de pêche numérique</p>
      </div>
    </footer>
  `,
})
export class LandingComponent {

  private rotX = signal(0);
  private rotY = signal(0);

  cardTransform = computed(() =>
    `perspective(1200px) rotateX(${this.rotX()}deg) rotateY(${this.rotY()}deg)`
  );

  onCardMove(e: MouseEvent): void {
    const el   = e.currentTarget as HTMLElement;
    const rect = el.getBoundingClientRect();
    const x    = (e.clientX - rect.left) / rect.width  - 0.5;
    const y    = (e.clientY - rect.top)  / rect.height - 0.5;
    this.rotX.set(y * -12);
    this.rotY.set(x *  12);
  }
  onCardLeave(): void { this.rotX.set(0); this.rotY.set(0); }

  avatars = [
    { letter: 'M', color: '#1e4028' },
    { letter: 'P', color: '#2a5c35' },
    { letter: 'J', color: '#3a7448' },
    { letter: 'S', color: '#243a1e' },
  ];

  ripples = Array.from({ length: 8 }, (_, i) => {
    const size  = 60 + (i * 28 % 100);
    const left  = (i * 23 + 8) % 88;
    const top   = (i * 17 + 12) % 80;
    const delay = (i * 1.4) % 5;
    const dur   = 4 + (i * 0.7) % 3;
    return {
      id:  i,
      cls: i % 3 === 2 ? 'ripple-ring-2' : 'ripple-ring',
      style: `width:${size}px;height:${size}px;left:${left}%;top:${top}%;`
           + `animation-delay:${delay}s;animation-duration:${dur}s;pointer-events:none;`,
    };
  });

  mockStats = [
    { val: '23',    label: 'Prises'  },
    { val: '4.2kg', label: 'Record'  },
    { val: '8',     label: 'Espèces' },
  ];

  stats = [
    { value: '4M+',  label: 'Pêcheurs en France'    },
    { value: '200+', label: 'Espèces référencées'    },
    { value: '50k+', label: 'Captures enregistrées'  },
    { value: '4.9★', label: 'Note moyenne'           },
  ];

  features = [
    { icon: '📸', title: 'Journal photo',        desc: 'Photo, poids, taille et GPS enregistrés en quelques secondes. Chaque prise mérite d\'être immortalisée.',             bg: 'rgba(92,158,112,.1)',  border: 'rgba(92,158,112,.2)'  },
    { icon: '🐟', title: 'Encyclopédie complète', desc: '200+ espèces avec habitats, répartition géographique, calendriers de saison et conseils de pêche détaillés.',       bg: 'rgba(56,189,248,.07)', border: 'rgba(56,189,248,.14)' },
    { icon: '🏆', title: 'Badges & défis',        desc: 'Premier brochet, record personnel, naturaliste… Débloque des badges au fil de tes sorties et défie tes amis.',      bg: 'rgba(196,108,42,.1)',  border: 'rgba(196,108,42,.2)'  },
    { icon: '📊', title: 'Statistiques avancées', desc: 'Évolution mensuelle, top espèces, records de poids et de taille — tout ton historique en un coup d\'œil.',          bg: 'rgba(167,139,250,.07)',border: 'rgba(167,139,250,.15)' },
    { icon: '👥', title: 'Groupes & communauté',  desc: 'Rejoins des clubs, crée des groupes privés avec tes amis, partage tes sorties et commente celles des autres.',      bg: 'rgba(251,146,60,.07)', border: 'rgba(251,146,60,.14)'  },
    { icon: '📍', title: 'Spots GPS & carte',     desc: 'Enregistre tes spots favoris, visualise-les sur la carte et retrouve-les en un tap à la prochaine sortie.',         bg: 'rgba(248,113,113,.07)',border: 'rgba(248,113,113,.14)' },
  ];

  steps = [
    { num: '1', title: 'Crée ton compte',     desc: 'Inscription en 30 secondes. Aucune carte bancaire, aucun engagement.' },
    { num: '2', title: 'Enregistre ta prise', desc: 'Photo, poids, taille, espèce et spot GPS — tout en quelques tapotements.' },
    { num: '3', title: 'Suis ta progression', desc: 'Tes stats, badges et records personnels se construisent à chaque sortie.' },
  ];

  testimonials = [
    {
      quote:    'Enfin une appli pensée pour les vrais pêcheurs. Je note chaque prise depuis 6 mois et c\'est incroyable de voir mes progrès.',
      name:     'Mathieu R.',
      initials: 'MR',
      role:     'Pêcheur de carnassiers · Lyon',
      color:    '#1e4028',
    },
    {
      quote:    'L\'encyclopédie est une mine d\'or. J\'ai découvert des espèces que je n\'aurais jamais reconnues avant.',
      name:     'Pierre D.',
      initials: 'PD',
      role:     'Pêcheur passionné · Bretagne',
      color:    '#2a5c35',
    },
    {
      quote:    'Les stats mensuelles m\'ont aidé à comprendre les meilleures périodes pour chaque espèce sur mon coin de lac.',
      name:     'Julien M.',
      initials: 'JM',
      role:     'Pêcheur compétition · Bordeaux',
      color:    '#3a7448',
    },
  ];
}
