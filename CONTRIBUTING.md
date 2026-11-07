# Guide de Contribution — TrailKernel 🏔️

Merci de votre intérêt pour **TrailKernel** ! Voici quelques règles simples pour préserver la qualité pédagogique et mathématique du projet.

## 📐 Règles Fondamentales

1. **Intégrité Mathématique Pure (`src/core`)** :
   - Tout calcul matriciel, convolution, produit scalaire ou métrique doit impérativement résider dans `src/core`.
   - Les modules de `src/core` sont en TypeScript pur : aucun import de React, de hooks ou du DOM.
   - Les composants React se limitent à afficher les données et à capturer les interactions utilisateur.

2. **Séparation de la Langue (`src/data/texts.ts`)** :
   - L'interface utilisateur est entièrement rédigée en **français**.
   - Aucun texte en français ne doit être codé en dur dans les composants. Utilisez `T.*` depuis `src/data/texts.ts`.
   - Le code source (identifiants, types, fonctions, commentaires) reste en **anglais**.

3. **Absence de Nombres Magiques** :
   - Utilisez des constantes nommées ou les design tokens définis dans `src/styles/tokens.ts`.

4. **Honnêteté et Transparence** :
   - Pas de fausses statistiques ni de valeurs pré-remplies factices.
   - Les réponses aux quiz et examens doivent toujours être vérifiables mathématiquement par les tests unitaires.

## 🧪 Cycle de Vérification avant Commit

Avant de soumettre une modification, assurez-vous que toutes les commandes suivantes s'exécutent sans erreur ni avertissement :

```bash
# Vérification du typage strict
npx tsc --noEmit

# Vérification du style de code
npm run lint

# Exécution des tests unitaires
npm run test

# Compilation du bundle de production
npm run build
```

Les messages de commit doivent respecter la convention [Conventional Commits](https://www.conventionalcommits.org/) (ex: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`).
