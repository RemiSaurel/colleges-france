<script setup lang="ts">
definePageMeta({ layout: false });

useSeoMeta({
  title: "À propos — Carte des Collèges",
  description: "Sources de données, méthode et crédits du projet Carte des Collèges.",
});

const datasets = [
  {
    name: "Indice de Position Sociale (IPS)",
    id: "fr-en-ips-colleges-ap2023",
    description: "Indice synthétique de la position sociale des élèves, calculé par la DEPP à partir des professions des parents. Plus l'IPS est élevé, plus le contexte socio-économique est favorable.",
    year: "2024-2025",
  },
  {
    name: "Indicateurs de valeur ajoutée des collèges (IVAC)",
    id: "fr-en-indicateurs-valeur-ajoutee-colleges",
    description: "Taux de réussite au DNB, notes moyennes, mentions, et valeur ajoutée de chaque collège par rapport à ce qu'on attend compte tenu de sa sociologie.",
    year: "Session 2024",
  },
  {
    name: "Annuaire de l'éducation",
    id: "fr-en-annuaire-education",
    description: "Coordonnées géographiques, adresse, secteur (public/privé), académie et commune de chaque établissement scolaire.",
    year: "Mis à jour en continu",
  },
];
</script>

<template>
  <div class="min-h-screen bg-default">
    <!-- Header -->
    <header class="sticky top-0 z-10 border-b border-default bg-(--ui-bg)/80 backdrop-blur-sm">
      <div class="mx-auto flex max-w-3xl items-center gap-4 px-6 py-4">
        <UButton
          to="/"
          icon="i-lucide-arrow-left"
          variant="ghost"
          color="neutral"
          size="sm"
        />
        <h1 class="text-lg font-semibold text-highlighted">
          À propos
        </h1>
      </div>
    </header>

    <!-- Content -->
    <main class="mx-auto max-w-3xl space-y-10 px-6 py-10">
      <!-- Intro -->
      <section>
        <h2 class="text-2xl font-bold text-highlighted">
          Carte des Collèges
        </h2>
        <p class="mt-3 text-muted leading-relaxed">
          Ce projet explore les données des collèges en France en croisant
          l'<strong class="text-default">indice de position sociale</strong> (IPS)
          avec les <strong class="text-default">résultats au diplôme national du brevet</strong> (DNB).
          Chaque point sur la carte représente un collège,
          coloré selon son IPS, avec ses résultats détaillés accessibles en un clic.
        </p>
      </section>

      <!-- Datasets -->
      <section>
        <h3 class="text-lg font-semibold text-highlighted">
          Sources de données
        </h3>
        <p class="mt-2 text-sm text-muted">
          Toutes les données proviennent de
          <UButton
            to="https://data.education.gouv.fr"
            target="_blank"
            variant="link"
            class="px-0"
            label="data.education.gouv.fr"
          />,
          la plateforme open data du ministère de l'Éducation nationale
          (Licence Ouverte v2.0).
        </p>

        <div class="mt-4 grid gap-3 md:grid-cols-3">
          <DatasetCard
            v-for="ds in datasets"
            :id="ds.id"
            :key="ds.id"
            :name="ds.name"
            :description="ds.description"
            :year="ds.year"
          />
        </div>
      </section>

      <div class="mt-3 space-y-3 text-sm text-muted leading-relaxed">
        <p>
          Les trois jeux de données sont croisés côté serveur via le
          <strong class="text-default">code UAI</strong> (identifiant unique de chaque établissement).
          Seuls les collèges présents dans les trois sources sont affichés,
          soit environ <strong class="text-default">7 000 collèges</strong>.
        </p>
        <p>
          L'IPS utilisé correspond à la rentrée <strong class="text-default">2024-2025</strong>,
          les résultats au DNB à la session <strong class="text-default">2024</strong>.
          La valeur ajoutée mesure l'écart entre le taux de réussite observé et celui attendu
          compte tenu de la composition sociale de l'établissement.
        </p>
        <p>
          Les couleurs sur la carte suivent un gradient divergent :
          <span class="inline-block h-3 w-3 rounded-full bg-[#dc3c32]" /> IPS faible (≤ 80),
          <span class="inline-block h-3 w-3 rounded-full bg-[#e8d832]" /> moyen (~100),
          <span class="inline-block h-3 w-3 rounded-full bg-[#3278c8]" /> élevé (≥ 135).
        </p>
      </div>

      <!-- Footer -->
      <footer class="border-t border-default pt-6 pb-10 text-center text-xs text-dimmed">
        Projet réalisé avec 💙 par <NuxtLink
          to="https://remisaurel.dev"
          target="_blank"
          class="text-highlighted underline"
        >
          Rémi Saurel
        </NuxtLink>
        ·
        Code source disponible sur <a
          href="https://github.com/remisaurel/colleges-france"
          target="_blank"
          class="text-highlighted underline"
        >GitHub</a>
      </footer>
    </main>
  </div>
</template>
