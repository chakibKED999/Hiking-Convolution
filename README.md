# 🏔️ TrailKernel — La Convolution d'Image en Haute Montagne

**TrailKernel** est une application web éducative interactive conçue pour apprendre et comprendre la **convolution d'image sans aucun prérequis mathématique**, à travers le thème ludique de la randonnée en montagne.

> **Principe fondamental** : Le thème de la montagne sert l'explication sans la déformer. Tous les calculs matriciels restent transparents, visibles et vérifiables en direct.

---

## 💡 Comprendre la Convolution en 1 Minute Chrono

Imaginez que vous observez un paysage de montagne vu du ciel :

1. **Une image en noir et blanc = une carte d'altitude** :
   - Chaque case (pixel) contient un nombre entre **0** et **255**.
   - `0` = un lac ou une vallée sombre.
   - `128` = un alpage ou une pente moyenne.
   - `255` = un sommet rocheux enneigé et éclatant.

2. **La convolution = une loupe 3×3 qui avance pas à pas** :
   - À chaque pas, le marcheur regarde **les 9 cases sous sa loupe** (ses 8 voisins immédiats et ses propres pieds).
   - Il multiplie chaque altitude par le chiffre écrit sur son filtre (les coefficients).
   - Il additionne les 9 résultats et divise par le total pour obtenir la nouvelle altitude.

3. **À quoi ça sert concrètement ?**
   - **Pour gommer le bruit (flou / brouillard)** : on fait la moyenne des 9 voisins $\rightarrow$ l'image devient douce et lissée.
   - **Pour détecter les falaises (contours / Sobel)** : on compare les voisins de gauche et de droite $\rightarrow$ dès que l'altitude change brutalement, la falaise s'allume en rouge vif !

---

## 🎮 Guide Pratique : Comment Jouer aux 5 Niveaux Essentiels

Le parcours est concentré sur **5 étapes indispensables**, progressives et très simples à prendre en main :

### 🗺️ Étape 1 : Lire la carte (Pixel = Altitude)
* **Ce qu'on apprend** : Une image numérique est simplement une grille de nombres de 0 à 255.
* **Ce que vous faites à l'écran** :
  1. Cliquez avec votre souris sur **6 cases différentes** de la carte.
  2. Regardez l'altimètre à droite afficher l'altitude exacte du point (ex: `192 / 255 m`).
  3. *(Optionnel)* Activez le son en haut à droite : le ton monte dans les aigus quand vous cliquez sur un sommet !
* **Condition de réussite** : Explorer 6 cases. Le bouton orange *« Passer à l'étape suivante → »* se débloque.

---

### 🔭 Étape 2 : La fenêtre 3×3 (Le Cœur du Calcul)
* **Ce qu'on apprend** : Comment la convolution calcule un nouveau pixel en faisant la moyenne pondérée de ses 9 voisins.
* **Ce que vous faites à l'écran** :
  1. Cliquez sur une case de la grille 6×6 pour y poser le randonneur.
  2. Un carré orange 3×3 apparaît sur la carte : c'est la vue du marcheur.
  3. À droite, le tableau vous montre en direct les 9 multiplications et la division par 9.
  4. Cliquez sur le bouton orange **« ✓ Valider le calcul pour la case (x, y) »**.
* **Condition de réussite** : Répéter l'action sur **4 cases différentes**.

---

### ⚖️ Étape 3 : Flou, Poids & Saturation
* **Ce qu'on apprend** : La différence entre flou uniforme et flou gaussien, et pourquoi la division est vitale pour éviter l'éblouissement.
* **Ce que vous faites à l'écran** :
  1. Cliquez sur les 3 boutons de comparaison :
     - *« 🌫️ Brouillard (Box Blur /9) »*
     - *« 🌥️ Brume légère (Gaussien /16) »*
     - *« ⚠️ Sans division (diviseur = 1) »* $\rightarrow$ observez l'image devenir toute blanche (saturation à 255).
  2. Répondez aux 3 questions du mini-quiz en bas :
     - **Question 1** : Choisissez **« Identique »** (la moyenne d'une zone plate ne change pas).
     - **Question 2** : Choisissez **« Saturation à 255 (tout blanc) »** (sans division, la somme explose).
     - **Question 3** : Choisissez **« Le centre pèse 4/16 (25%) »** (le centre a plus d'importance).
* **Condition de réussite** : Obtenir 3 réponses vertes au quiz.

---

### 📐 Étape 4 : Détecter les Falaises (Sobel & Pente)
* **Ce qu'on apprend** : Comment le filtre de Sobel calcule la raideur du sol (gradient) et cartographie le risque d'avalanche.
* **Ce que vous faites à l'écran** :
  1. Observez la décomposition des pentes Est-Ouest (Sobel X) et Nord-Sud (Sobel Y).
  2. Regardez la grande carte de difficulté en bas :
     - 🟢 **Vert** = pente douce (marche facile)
     - 🟡 **Jaune** = pente moyenne
     - 🟠 **Orange** = pente raide
     - 🔴 **Rouge vif** = falaise abrupte / à-pic
  3. **Cliquez directement sur la zone rouge vif** au centre du massif.
* **Condition de réussite** : Toucher la falaise la plus abrupte avec le pointeur.

---

### 🛠️ Étape 5 : L'Atelier Libre du Cartographe
* **Ce qu'on apprend** : Manipuler tous les filtres comme de véritables outils de cartographie ou concevoir son propre masque 3×3.
* **Ce que vous faites à l'écran** :
  1. Cliquez sur **3 filtres différents** dans la barre d'outils (par exemple : *« Brouillard »*, puis *« Crêtes & falaises »*, puis *« Ombrage du relief »*).
  2. Observez la carte de droite se métamorphoser instantanément.
  3. *(Optionnel)* Cliquez sur *« ✏️ Personnalisé »* pour modifier vous-même les 9 chiffres du noyau et observer le résultat en direct !
* **Condition de réussite** : Tester 3 filtres. Vous obtenez alors le rang suprême de **Guide de Haute Montagne** !

---

## 🎒 Gamification & Carnet de Rando

- **Progression en Dénivelé Positif (D+)** : Chaque étape franchie rapporte +250 m D+ pour atteindre 1 250 m D+.
- **Rangs d'alpiniste** :
  - 🌲 *Marcheur Initié* (0 – 299 m D+)
  - 🥾 *Randonneur Aguerri* (300 – 699 m D+)
  - 🧗 *Alpiniste Chevronné* (700 – 1 199 m D+)
  - 🎖️ *Guide de Haute Montagne* (1 200+ m D+)
- **Carnet de Rando interactif (Bouton 📓)** : 5 fiches d'applications réelles débloquées au fil de l'ascension :
  1. *Topographie & Satellites* (Modèles Numériques de Terrain IGN / MNT)
  2. *Drones & Secours alpin* (Vision par ordinateur en haute montagne)
  3. *Optique spatiale* (Radiométrie et saturation des capteurs solaires)
  4. *Sécurité en montagne* (Cartes de vigilance avalanches sur pentes > 30°)
  5. *Intelligence Artificielle* (Réseaux convolutifs profonds CNN)
- **Mascotte Bastien le Guide** : Illustration vectorielle SVG 100% originale et bienveillante accompagnant chaque étape avec des conseils imagés.
- **Sauvegarde LocalStorage sécurisée** : Votre progression est automatiquement enregistrée sur votre navigateur, avec possibilité de réinitialiser à tout moment.

---

## 🛠️ Stack Technique

- **Bundler & Dev Server** : Vite 8
- **Framework UI** : React 19
- **Langage** : TypeScript 5.7 strict (`noUncheckedIndexedAccess`, zéro `any`)
- **Styles** : Tailwind CSS 4 + Design Tokens montagnards (`src/styles/tokens.ts`)
- **Moteur graphique** : Canvas API HTML5 natif (haute performance, rendu pixel art)
- **Audio** : Synthèse Web Audio API pure (altimètre sonore sans fichier audio externe)
- **Tests** : Vitest (54 tests unitaires couvrant la totalité des calculs mathématiques)
- **Linter & Formateur** : ESLint flat config + Prettier

---

## 🚀 Lancement Rapide en Local

### 1. Installation
```bash
npm install
```

### 2. Démarrer le jeu
```bash
npm run dev
```
Ouvrez ensuite votre navigateur sur **[http://localhost:5173/](http://localhost:5173/)**.

### 3. Autres scripts utiles
| Commande | Action |
| :--- | :--- |
| `npm run test` | Lance les 54 tests unitaires avec Vitest |
| `npm run build` | Compile TypeScript et génère le bundle de production |
| `npm run lint` | Analyse la qualité du code avec ESLint |
| `npm run format` | Met en forme le code avec Prettier |

---

## ♿ Accessibilité & Éthique

- **Clavier & Focus** : Entièrement navigable au clavier avec anneaux de focus orange vif contrastés.
- **Réduction des mouvements** : Respect de la directive système `prefers-reduced-motion` (désactivation douce des animations).
- **Confort sonore** : Altimètre audio **désactivé par défaut**, activable au choix de l'utilisateur.
- **Honnêteté des données** : Zéro fausse statistique ; chaque mètre de D+ et chaque calcul reflète strictement vos actions.

---

## 📄 Licence

Projet éducatif sous licence MIT — Conçu pour vulgariser la convolution matricielle de manière simple, visuelle et intuitive.
Tous droits réservés © 2026 TrailKernel.
