import React, { useState, useMemo } from 'react';
import { T } from '@/data/texts';
import { getExamQuestions, type ExamQuestion } from '@/core/exam';
import HikerMascot from '@/components/HikerMascot';

interface Level11Props {
  onComplete: () => void;
  onNavigateLevel: (levelId: number) => void;
}

const PASS_SCORE = 70;

/**
 * Level 11: "Le Grand Défi du Guide" — 100-Point Alpine Convolution Examination.
 * 10 practical questions calculated dynamically by src/core.
 * Includes instant diagnostic breakdown by skill with weak task alerts and revision links.
 */
export default function Level11({
  onComplete,
  onNavigateLevel,
}: Level11Props): React.JSX.Element {
  const questions: ExamQuestion[] = useMemo(() => getExamQuestions(), []);

  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const handleSelectAnswer = (questionId: number, optionId: string) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  };

  const { score, totalPossible, diagnosticResults } = useMemo(() => {
    let earned = 0;
    const total = questions.reduce((sum, q) => sum + q.points, 0);

    const diagnostics = questions.map((q) => {
      const selected = answers[q.id];
      const isCorrect = selected === q.correctId;
      if (isCorrect) {
        earned += q.points;
      }
      return {
        question: q,
        selected,
        isCorrect,
      };
    });

    return { score: earned, totalPossible: total, diagnosticResults: diagnostics };
  }, [questions, answers]);

  const handleSubmit = () => {
    setSubmitted(true);
    if (score >= PASS_SCORE) {
      onComplete();
    }
  };

  const handleRetry = () => {
    setSubmitted(false);
    setAnswers({});
  };

  const answeredCount = Object.keys(answers).length;
  const isAllAnswered = answeredCount === questions.length;
  const isPassed = submitted && score >= PASS_SCORE;

  const levelInfo = T.levels.find((l) => l.id === 5) ?? T.levels[0];

  // Group weak skills for diagnostic
  const weakSkills = diagnosticResults.filter((d) => !d.isCorrect);

  return (
    <div className="space-y-6">
      <div className="tip-banner">
        <p className="text-sm">{levelInfo?.description}</p>
      </div>

      <HikerMascot
        message={
          submitted
            ? isPassed
              ? "« Félicitations ! Vous avez brillamment réussi l'examen du Sommet. Votre compréhension de la convolution spatiale est totale ! Vous voilà Guide de Haute Montagne Convolutif ! »"
              : '« Belle tentative ! Consultez votre bilan diagnostique ci-dessous pour revoir les notions où vous avez hésité, puis retentez votre chance ! »'
            : "« Bienvenue à l'épreuve finale du Sommet ! 10 cas pratiques alpins pour tester votre science de la convolution. Prenez votre temps et analysez chaque question. »"
        }
        size="md"
      />

      {/* Summary Score Banner when submitted */}
      {submitted && (
        <div
          className={`card-panel text-center space-y-3 ${
            isPassed
              ? 'border-[var(--ok)] bg-[color-mix(in_srgb,var(--ok)_12%,transparent)]'
              : 'border-[var(--c)] bg-[color-mix(in_srgb,var(--c)_12%,transparent)]'
          }`}
        >
          <span className="text-4xl block" role="img" aria-hidden="true">
            {isPassed ? '🏆' : '🧗'}
          </span>
          <h3 className="text-2xl font-black text-[var(--text)]">
            {isPassed ? 'Brevet de Guide Validé !' : 'Ascension Incomplète'}
          </h3>
          <div className="text-4xl font-black font-mono" style={{ color: isPassed ? 'var(--ok)' : 'var(--c)' }}>
            {score} / {totalPossible} points
          </div>
          <p className="text-xs sm:text-sm max-w-md mx-auto text-[var(--muted)]">
            {isPassed
              ? "Vous avez franchi le seuil d'admissibilité de 70 points. Le titre de Guide Suprême de la Randonnée Convolutive vous est décerné !"
              : "Le seuil d'admission est de 70 points. Utilisez le bilan diagnostique ci-dessous pour consolider vos compétences alpines."}
          </p>

          {!isPassed && (
            <button
              type="button"
              onClick={handleRetry}
              className="btn-adventure text-sm cursor-pointer mt-2"
            >
              Réessayer l'examen 🔄
            </button>
          )}
        </div>
      )}

      {/* Weak Skills Diagnostic Alert (inspired by Pixel Detective) */}
      {submitted && weakSkills.length > 0 && (
        <div className="wk-alert">
          <h4>⚠️ Notions à consolider pour votre sécurité ({weakSkills.length})</h4>
          <p className="text-xs text-[var(--muted)] mb-3">
            Prenez note de ces conseils de terrain avant votre prochaine sortie en montagne :
          </p>
          <div className="space-y-2">
            {weakSkills.map((item) => (
              <div key={item.question.id} className="wk-item">
                <div className="wk-head">
                  <span className="text-xs font-bold text-[var(--text)]">
                    Question {item.question.id} : {item.question.skill}
                  </span>
                  <button
                    type="button"
                    onClick={() => onNavigateLevel(item.question.levelToReview)}
                    className="chip py-0.5 px-2 text-[10px] font-bold"
                  >
                    Réviser Zone {item.question.levelToReview} →
                  </button>
                </div>
                <p className="wk-ret">
                  <b>À retenir :</b> {item.question.explanation}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Questions list */}
      <div className="space-y-4">
        {questions.map((q, idx) => {
          const selected = answers[q.id];
          const isCorrect = selected === q.correctId;

          return (
            <div
              key={q.id}
              className={`card-panel space-y-3 ${
                submitted
                  ? isCorrect
                    ? 'border-[var(--ok)] bg-[color-mix(in_srgb,var(--ok)_6%,transparent)]'
                    : 'border-[var(--ko)] bg-[color-mix(in_srgb,var(--ko)_6%,transparent)]'
                  : ''
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[var(--text)] text-[var(--panel)] text-xs font-bold flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <span className="chip py-0.5 px-2 text-[10px] font-bold">
                    {q.skill}
                  </span>
                </div>
                <span className="score-pill py-0.5 px-2.5 text-xs">
                  {q.points} points
                </span>
              </div>

              <h4 className="font-bold text-[var(--text)] text-sm">{q.title}</h4>
              <p className="text-xs text-[var(--muted)] leading-relaxed">{q.context}</p>

              {/* Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                {q.options.map((opt) => {
                  const isOptSelected = selected === opt.id;
                  let optClass = 'opt-choice';

                  if (!submitted) {
                    if (isOptSelected) {
                      optClass += ' ok';
                    }
                  } else {
                    if (opt.id === q.correctId) {
                      optClass += ' ok';
                    } else if (isOptSelected) {
                      optClass += ' ko';
                    } else {
                      optClass += ' opacity-50';
                    }
                  }

                  return (
                    <button
                      key={opt.id}
                      type="button"
                      disabled={submitted}
                      onClick={() => handleSelectAnswer(q.id, opt.id)}
                      className={optClass}
                    >
                      <span>{opt.label}</span>
                      {submitted && opt.id === q.correctId && <span>✓</span>}
                    </button>
                  );
                })}
              </div>

              {/* Explanation when submitted */}
              {submitted && (
                <div
                  className={`p-3 rounded-xl text-xs leading-relaxed border ${
                    isCorrect
                      ? 'bg-[color-mix(in_srgb,var(--ok)_12%,transparent)] border-[var(--ok)] text-[var(--ok)]'
                      : 'bg-[color-mix(in_srgb,var(--ko)_12%,transparent)] border-[var(--ko)] text-[var(--ko)]'
                  }`}
                >
                  <span className="font-bold mr-1">
                    {isCorrect ? '✓ Exact !' : '✗ Erreur :'}
                  </span>
                  {q.explanation}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Submit Button */}
      {!submitted && (
        <div className="card-panel flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-[var(--muted)] font-mono">
            Questions complétées :{' '}
            <strong className="text-[var(--text)]">
              {answeredCount} / {questions.length}
            </strong>
          </div>
          <button
            type="button"
            disabled={!isAllAnswered}
            onClick={handleSubmit}
            className="btn-adventure text-sm flex items-center gap-2 cursor-pointer"
          >
            Soumettre ma copie d'examen 🏔️
          </button>
        </div>
      )}
    </div>
  );
}
