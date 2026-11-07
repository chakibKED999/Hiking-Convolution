import React, { useState } from 'react';
import { T } from '@/data/texts';

export interface QuizOption {
  label: string;
  value: string;
  correct: boolean;
  explanation: string;
}

interface QuizProps {
  question: string;
  options: readonly QuizOption[];
  onCorrect: () => void;
}

/**
 * Quiz presents multiple-choice interactive questions with instant feedback
 * and clear mathematical explanations for educational reinforcement.
 */
export default function Quiz({
  question,
  options,
  onCorrect,
}: QuizProps): React.JSX.Element {
  const [selectedVal, setSelectedVal] = useState<string | null>(null);

  const answered = selectedVal !== null;
  const chosenOption = options.find((opt) => opt.value === selectedVal);
  const isCorrect = chosenOption?.correct ?? false;

  const handleSelect = (val: string) => {
    if (answered) return;
    setSelectedVal(val);
    const opt = options.find((o) => o.value === val);
    if (opt?.correct) {
      onCorrect();
    }
  };

  return (
    <div className="card-panel space-y-3">
      <p className="font-extrabold text-[var(--text)] text-sm leading-snug">{question}</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2" role="group" aria-label="Options de réponse">
        {options.map((opt) => {
          const isSelected = selectedVal === opt.value;

          let btnClass = 'opt-choice text-xs m-0 ';
          if (!answered) {
            btnClass += '';
          } else if (isSelected) {
            btnClass += opt.correct ? ' ok' : ' ko';
          } else if (opt.correct) {
            btnClass += ' ok';
          } else {
            btnClass += ' opacity-50 cursor-default';
          }

          return (
            <button
              key={opt.value}
              type="button"
              disabled={answered}
              onClick={() => handleSelect(opt.value)}
              className={btnClass}
              aria-pressed={isSelected}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {answered && chosenOption && (
        <div
          className={`tip-banner text-xs ${
            isCorrect
              ? 'border-[var(--ok)] bg-[color-mix(in_srgb,var(--ok)_12%,transparent)] text-[var(--ok)]'
              : 'border-[var(--ko)] bg-[color-mix(in_srgb,var(--ko)_12%,transparent)] text-[var(--ko)]'
          }`}
        >
          <span className="font-bold mr-1">
            {isCorrect ? T.quiz.correct : T.quiz.wrong}
          </span>
          {chosenOption.explanation}
        </div>
      )}
    </div>
  );
}
