# 🏔️ TrailKernel — La Convolution d'Image en Haute Montagne

**TrailKernel** est une application web éducative interactive conçue pour apprendre et comprendre la **convolution d'image sans aucun prérequis mathématique**, à travers le thème ludique de la randonnée en montagne.

> **Principe fondamental :** Le thème de la montagne sert l'explication sans la déformer. Tous les calculs matriciels restent transparents, visibles et vérifiables en direct.

---

## 💡 Comprendre la convolution en 1 minute

Imaginez que vous observez un paysage de montagne vu du ciel.

### 1. Une image en noir et blanc = une carte d'altitude

- Chaque case (pixel) contient un nombre entre **0 et 255**.
- `0` = un lac ou une vallée sombre.
- `128` = un alpage ou une pente moyenne.
- `255` = un sommet rocheux enneigé et éclatant.

### 2. La convolution = une loupe 3×3 qui avance pas à pas

- À chaque pas, le marcheur regarde les **9 cases sous sa loupe**.
- Il multiplie chaque valeur par le coefficient correspondant de son filtre.
- Il additionne les 9 résultats et applique le diviseur pour obtenir la nouvelle valeur du pixel.

### 3. À quoi ça sert concrètement ?

- **Flou (Box Blur / Gaussian Blur) :** on combine les pixels voisins pour lisser l'image.
- **Détection des contours (Sobel) :** on mesure les variations d'intensité pour détecter les changements brusques, comme les falaises sur une carte d'altitude.

---

## 🎮 Guide pratique : les 5 niveaux essentiels

Le parcours est concentré sur **5 étapes indispensables**, progressives et simples à prendre en main.

### 🗺️ Étape 1 : Lire la carte (Pixel = Altitude)

**Ce qu'on apprend :** Une image numérique est simplement une grille de nombres de 0 à 255.

**Ce que vous faites à l'écran :**

1. Cliquez avec votre souris sur **6 cases différentes** de la carte.
2. Regardez l'altimètre à droite afficher l'altitude exacte du point (ex. : `192 / 255 m`).
3. (Optionnel) Activez le son en haut à droite : le ton monte dans les aigus lorsque vous cliquez sur un sommet !

**Condition de réussite :** Explorer 6 cases. Le bouton orange « Passer à l'étape suivante → » se débloque.

---

### 🔭 Étape 2 : La fenêtre 3×3 (Le cœur du calcul)

**Ce qu'on apprend :** Comment la convolution calcule un nouveau pixel en faisant la moyenne pondérée de ses 9 voisins.

**Ce que vous faites à l'écran :**

1. Cliquez sur une case de la grille 6×6 pour y poser le randonneur.
2. Un carré orange 3×3 apparaît sur la carte.
3. À droite, le tableau montre en direct les 9 multiplications et la division par 9.
4. Cliquez sur « ✓ Valider le calcul pour la case (x, y) ».

**Condition de réussite :** Répéter l'action sur **4 cases différentes**.

---

### ⚖️ Étape 3 : Flou, poids et saturation

**Ce qu'on apprend :** La différence entre flou uniforme et flou gaussien, et pourquoi la division est importante pour éviter la saturation.

**Ce que vous faites à l'écran :**

1. Cliquez sur les 3 boutons de comparaison :
   - « 🌫️ Brouillard (Box Blur /9) »
   - « 🌥️ Brume légère (Gaussien /16) »
   - « ⚠️ Sans division (diviseur = 1) » : observez l'image devenir très claire à cause de la saturation à 255.
2. Répondez aux 3 questions du mini-quiz :
   - **Question 1 :** « Identique » (la moyenne d'une zone plate ne change pas).
   - **Question 2 :** « Saturation à 255 (tout blanc) » (sans division, la somme peut dépasser 255).
   - **Question 3 :** « Le centre pèse 4/16 (25 %) » (le centre a plus d'importance dans ce filtre gaussien).

**Condition de réussite :** Obtenir 3 bonnes réponses au quiz.

---

### 📐 Étape 4 : Détecter les falaises (Sobel et pente)

**Ce qu'on apprend :** Comment le filtre de Sobel calcule la raideur du sol (gradient) et représente les variations de pente.

**Ce que vous faites à l'écran :**

1. Observez la décomposition des pentes Est-Ouest (Sobel X) et Nord-Sud (Sobel Y).
2. Regardez la grande carte de difficulté en bas :
   - 🟢 **Vert** = pente douce.
   - 🟡 **Jaune** = pente moyenne.
   - 🟠 **Orange** = pente raide.
   - 🔴 **Rouge vif** = falaise abrupte.
3. Cliquez directement sur la zone rouge vif au centre du massif.

**Condition de réussite :** Toucher la falaise la plus abrupte avec le pointeur.

---

### 🛠️ Étape 5 : L'atelier libre du cartographe

**Ce qu'on apprend :** Manipuler les filtres comme de véritables outils de cartographie ou concevoir son propre masque 3×3.

**Ce que vous faites à l'écran :**

1. Cliquez sur **3 filtres différents** dans la barre d'outils (par exemple : « Brouillard », « Crêtes & falaises », puis « Ombrage du relief »).
2. Observez la carte de droite se transformer instantanément.
3. (Optionnel) Cliquez sur « ✏️ Personnalisé » pour modifier vous-même les 9 coefficients du noyau et observer le résultat en direct.

**Condition de réussite :** Tester 3 filtres. Vous obtenez alors le rang suprême de **Guide de Haute Montagne** !

---

## 🎒 Gamification et carnet de randonnée

### Progression en dénivelé positif (D+)

Chaque étape franchie rapporte **+250 m D+**, pour atteindre un total de 1 250 m D+.

### Rangs d'alpiniste

| Rang | Dénivelé positif |
|---|---:|
| 🌲 Marcheur Initié | 0 – 299 m D+ |
| 🥾 Randonneur Aguerri | 300 – 699 m D+ |
| 🧗 Alpiniste Chevronné | 700 – 1 199 m D+ |
| 🎖️ Guide de Haute Montagne | 1 200 m D+ et plus |

### Carnet de randonnée interactif (bouton 📓)

5 fiches d'applications réelles sont débloquées au fil de l'ascension :

1. **Topographie et satellites :** Modèles numériques de terrain (MNT).
2. **Drones et secours alpin :** Vision par ordinateur en haute montagne.
3. **Optique spatiale :** Radiométrie et saturation des capteurs.
4. **Sécurité en montagne :** Cartes de vigilance et analyse des pentes.
5. **Intelligence artificielle :** Réseaux convolutifs profonds (CNN).

### Autres fonctionnalités

- **Mascotte Bastien le Guide :** Illustration vectorielle SVG 100 % originale accompagnant chaque étape avec des conseils imagés.
- **Sauvegarde LocalStorage :** La progression est automatiquement enregistrée dans le navigateur, avec possibilité de réinitialisation à tout moment.

---

## 🛠️ Stack technique

| Technologie | Utilisation |
|---|---|
| Vite 8 | Bundler et serveur de développement |
| React 19 | Framework UI |
| TypeScript 5.7 | Langage avec configuration stricte |
| Tailwind CSS 4 | Styles et design tokens |
| Canvas API HTML5 | Moteur graphique et rendu pixel art |
| Web Audio API | Synthèse audio de l'altimètre |
| Vitest | Tests unitaires |
| ESLint | Analyse statique du code |
| Prettier | Formatage du code |

**TypeScript :** configuration stricte avec `noUncheckedIndexedAccess` et sans utilisation de `any`.

**Tests :** 54 tests unitaires couvrant les calculs mathématiques.

---

## 🚀 Lancement rapide en local

### 1. Installation

```bash
npm install
```

### 2. Démarrer l'application

```bash
npm run dev
```

Ouvrez ensuite votre navigateur à l'adresse :

[http://localhost:5173/](http://localhost:5173/)

### 3. Autres scripts utiles

| Commande | Action |
|---|---|
| `npm run test` | Lance les tests unitaires avec Vitest |
| `npm run build` | Compile TypeScript et génère le bundle de production |
| `npm run lint` | Analyse la qualité du code avec ESLint |
| `npm run format` | Formate le code avec Prettier |

---

## ♿ Accessibilité et éthique

- **Clavier et focus :** Navigation au clavier avec des anneaux de focus orange contrastés.
- **Réduction des mouvements :** Respect de la directive système `prefers-reduced-motion`.
- **Confort sonore :** Altimètre audio désactivé par défaut, activable au choix de l'utilisateur.
- **Honnêteté des données :** Chaque mètre de D+ et chaque calcul reflète les actions réellement effectuées par l'utilisateur.

---

## 📄 Licence

Projet éducatif sous licence MIT, conçu pour vulgariser la convolution matricielle de manière simple, visuelle et intuitive.

Tous droits réservés © 2026 TrailKernel.