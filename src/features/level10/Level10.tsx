import React, { useState, useMemo } from 'react';
import { T } from '@/data/texts';
import { generateTerrain } from '@/core/terrain';
import { convolve2d } from '@/core/convolve2d';
import { sobelX, boxBlur, gaussian } from '@/core/kernels';
import {
  convolve5x5,
  DOUBLE_BOX_BLUR_5X5_VALUES,
  DOUBLE_BOX_BLUR_5X5_DIVISOR,
} from '@/core/composition';
import PixelGrid from '@/components/PixelGrid';
import HikerMascot from '@/components/HikerMascot';

const GRID_SIZE = 12;
const SEED = 48;
const TERRAIN = generateTerrain('massif', SEED, GRID_SIZE);

interface Level10Props {
  onComplete: () => void;
}

/**
 * Level 10: "Convolution vs Corrélation & Composition".
 * Interactive demonstration of:
 * 1) Kernel flipping (180° rotation) for asymmetric vs symmetric kernels.
 * 2) 3×3 double blur cascade equivalence to a single 5×5 pyramidal convolution.
 */
export default function Level10({ onComplete }: Level10Props): React.JSX.Element {
  const [activeTab, setActiveTab] = useState<'flip' | 'cascade'>('flip');
  const [testedFlip, setTestedFlip] = useState(false);
  const [testedCascade, setTestedCascade] = useState(false);
  const [kernelType, setKernelType] = useState<'asymmetric' | 'symmetric'>('asymmetric');

  // --- Part 1: Flip Demo ---
  const activeKernel = kernelType === 'asymmetric' ? sobelX : gaussian;

  const noFlipResult = useMemo(() => {
    return convolve2d(TERRAIN, activeKernel, { flipKernel: false });
  }, [activeKernel]);

  const withFlipResult = useMemo(() => {
    return convolve2d(TERRAIN, activeKernel, { flipKernel: true });
  }, [activeKernel]);

  const areOutputsIdentical = useMemo(() => {
    return noFlipResult.data.every((val, idx) => val === withFlipResult.data[idx]);
  }, [noFlipResult, withFlipResult]);

  // --- Part 2: Composition Demo ---
  const double3x3Result = useMemo(() => {
    const pass1 = convolve2d(TERRAIN, boxBlur, { borderMode: 'clamp' });
    return convolve2d(pass1, boxBlur, { borderMode: 'clamp' });
  }, []);

  const single5x5Result = useMemo(() => {
    return convolve5x5(
      TERRAIN,
      DOUBLE_BOX_BLUR_5X5_VALUES,
      DOUBLE_BOX_BLUR_5X5_DIVISOR,
      0,
      'clamp',
    );
  }, []);

  const handleTestFlip = () => {
    setTestedFlip(true);
    if (testedCascade) onComplete();
  };

  const handleTestCascade = () => {
    setTestedCascade(true);
    if (testedFlip) onComplete();
  };

  const levelInfo = T.levels.find((l) => l.id === 5) ?? T.levels[0];

  return (
    <div className="space-y-5">
      <div className="bg-stone-50 p-3 rounded-lg border border-stone-200">
        <p className="text-sm text-stone-700">{levelInfo?.description}</p>
      </div>

      <HikerMascot
        message="« En traitement d'image, 99 % des logiciels appellent convolution ce qui est en réalité une corrélation croisée ! La vraie convolution mathématique retourne le masque à 180°. Et deux petits filtres 3×3 valent une grande pyramide 5×5 ! »"
        size="sm"
      />

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('flip')}
          className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
            activeTab === 'flip'
              ? 'bg-orange-600 text-white border-orange-700 shadow-xs'
              : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-50'
          }`}
        >
          1. Retournement 180° (Convolution vs Corrélation)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('cascade')}
          className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
            activeTab === 'cascade'
              ? 'bg-orange-600 text-white border-orange-700 shadow-xs'
              : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-50'
          }`}
        >
          2. Composition en cascade (Deux 3×3 = Un 5×5)
        </button>
      </div>

      {activeTab === 'flip' ? (
        <div className="space-y-4 p-5 bg-white rounded-2xl border border-stone-200 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                Noyau testé :
              </span>
              <button
                type="button"
                onClick={() => setKernelType('asymmetric')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                  kernelType === 'asymmetric'
                    ? 'bg-stone-800 text-white border-stone-900'
                    : 'bg-stone-100 text-stone-700 border-stone-300'
                }`}
              >
                Sobel X (Asymétrique)
              </button>
              <button
                type="button"
                onClick={() => setKernelType('symmetric')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                  kernelType === 'symmetric'
                    ? 'bg-stone-800 text-white border-stone-900'
                    : 'bg-stone-100 text-stone-700 border-stone-300'
                }`}
              >
                Gaussien (Symétrique)
              </button>
            </div>

            <button
              type="button"
              onClick={handleTestFlip}
              className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-green-700 hover:bg-green-800 text-white transition-colors cursor-pointer"
            >
              ✓ Valider l'observation du retournement
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col items-center gap-2 p-3 bg-stone-50 rounded-xl border border-stone-200">
              <span className="text-xs font-bold text-stone-700">
                Corrélation croisée (sans retournement)
              </span>
              <PixelGrid
                grid={noFlipResult}
                cellSize={20}
                showNumbers={false}
                showGrid={true}
                allowColorToggle={false}
                ariaLabel="Corrélation croisée sans retournement"
              />
              <span className="text-[11px] text-stone-500 font-mono">k(x, y) direct</span>
            </div>

            <div className="flex flex-col items-center gap-2 p-3 bg-stone-50 rounded-xl border border-stone-200">
              <span className="text-xs font-bold text-orange-700">
                Vraie convolution mathématique (retournement 180°)
              </span>
              <PixelGrid
                grid={withFlipResult}
                cellSize={20}
                showNumbers={false}
                showGrid={true}
                allowColorToggle={false}
                ariaLabel="Convolution mathématique avec retournement"
              />
              <span className="text-[11px] text-stone-500 font-mono">
                k(-x, -y) pivoté
              </span>
            </div>
          </div>

          <div
            className={`p-3 rounded-xl border text-xs leading-relaxed ${
              areOutputsIdentical
                ? 'bg-blue-50 border-blue-200 text-blue-900'
                : 'bg-amber-50 border-amber-200 text-amber-900'
            }`}
          >
            <strong>Bilan mathématique : </strong>
            {areOutputsIdentical
              ? 'Pour le noyau gaussien symétrique, le retournement à 180° redonne exactement la même matrice : la corrélation et la convolution sont identiques !'
              : "Pour Sobel X (asymétrique), la vraie convolution inverse la gauche et la droite par rapport à la corrélation croisée. C'est pourquoi la rigueur des définitions compte !"}
          </div>
        </div>
      ) : (
        <div className="space-y-4 p-5 bg-white rounded-2xl border border-stone-200 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-stone-600 max-w-xl">
              Théorème de cascade : Convoluer deux fois de suite par une boîte 3×3 (1/9)
              équivaut mathématiquement à convoluer une seule fois par un filtre 5×5
              pyramidal (1/81).
            </p>

            <button
              type="button"
              onClick={handleTestCascade}
              className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-green-700 hover:bg-green-800 text-white transition-colors cursor-pointer"
            >
              ✓ Valider la preuve d'équivalence 5×5
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col items-center gap-2 p-3 bg-stone-50 rounded-xl border border-stone-200">
              <span className="text-xs font-bold text-stone-700">
                Deux passes 3×3 successives (÷9 puis ÷9)
              </span>
              <PixelGrid
                grid={double3x3Result}
                cellSize={20}
                showNumbers={false}
                showGrid={true}
                allowColorToggle={false}
                ariaLabel="Double passe 3x3"
              />
              <span className="text-[11px] text-stone-500">
                Passe 1 (box) puis Passe 2 (box)
              </span>
            </div>

            <div className="flex flex-col items-center gap-2 p-3 bg-stone-50 rounded-xl border border-stone-200">
              <span className="text-xs font-bold text-green-700">
                Passe unique 5×5 pyramidale (÷81)
              </span>
              <PixelGrid
                grid={single5x5Result}
                cellSize={20}
                showNumbers={false}
                showGrid={true}
                allowColorToggle={false}
                ariaLabel="Passe unique 5x5"
              />
              <span className="text-[11px] text-stone-500">
                Matrice 5×5 composée directement
              </span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-green-50 border border-green-200 text-green-900 text-xs">
            <strong>Résultat calculé par le moteur :</strong> Les deux approches sont
            quasi-parfaitement identiques (hors effets de lisière et arrondis entiers). En
            Deep Learning moderne, on préfère empiler deux filtres 3×3 car cela requiert
            3×3 + 3×3 = 18 opérations au lieu de 5×5 = 25 opérations !
          </div>
        </div>
      )}

      <div className="flex items-center justify-between text-xs text-stone-500 bg-stone-50 p-3 rounded-xl border border-stone-200">
        <span>Progression des théorèmes :</span>
        <span className="font-bold text-stone-800">
          {(testedFlip ? 1 : 0) + (testedCascade ? 1 : 0)} / 2 démonstrations validées
        </span>
      </div>
    </div>
  );
}
