'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import questionsData from '@/data/questions.json';
import Welcome from '@/components/quiz/Welcome';
import Identification from '@/components/quiz/Identification';
import QuestionStep from '@/components/quiz/QuestionStep';
import Review from '@/components/quiz/Review';
import ThankYou from '@/components/quiz/ThankYou';
import ProgressBar from '@/components/quiz/ProgressBar';
import { supabase } from '@/lib/supabase';

const STEPS = {
  WELCOME: 'welcome',
  IDENTIFICATION: 'identification',
  QUESTIONS: 'questions',
  REVIEW: 'review',
  THANK_YOU: 'thank_you',
};

export default function Home() {
  const router = useRouter();
  const [step, setStep] = useState(STEPS.WELCOME);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [direction, setDirection] = useState('forward');

  const [userInfo, setUserInfo] = useState({ nome: '', unidade: '' });
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const totalQuestions = questionsData.length;

  const totalStepsForProgress = totalQuestions + 2; // identification + questions
  const currentProgressStep =
    step === STEPS.IDENTIFICATION
      ? 1
      : step === STEPS.QUESTIONS
        ? 1 + currentQuestionIndex + 1
        : step === STEPS.REVIEW
          ? totalStepsForProgress
          : 0;

  const handleStart = () => {
    setDirection('forward');
    setStep(STEPS.IDENTIFICATION);
  };

  const handleIdentificationSubmit = ({ nome, unidade }) => {
    setUserInfo({ nome, unidade });
    setDirection('forward');
    setCurrentQuestionIndex(0);
    setStep(STEPS.QUESTIONS);
  };

  const handleSelectAnswer = (value) => {
    setAnswers((prev) => ({
      ...prev,
      [questionsData[currentQuestionIndex].id]: value,
    }));
  };

  const handleNextQuestion = () => {
    setDirection('forward');
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      setStep(STEPS.REVIEW);
    }
  };

  const handleBack = () => {
    setDirection('backward');
    if (step === STEPS.QUESTIONS) {
      if (currentQuestionIndex > 0) {
        setCurrentQuestionIndex((prev) => prev - 1);
      } else {
        setStep(STEPS.IDENTIFICATION);
      }
    } else if (step === STEPS.REVIEW) {
      setStep(STEPS.QUESTIONS);
      setCurrentQuestionIndex(totalQuestions - 1);
    } else if (step === STEPS.IDENTIFICATION) {
      setStep(STEPS.WELCOME);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);

    try {
      const { error } = await supabase
        .from('quiz_responses')
        .insert({
          nome: userInfo.nome,
          unidade: userInfo.unidade,
          respostas: answers,
        });

      if (error) throw error;
    } catch (error) {
      console.error('Erro ao enviar respostas:', error);
    } finally {
      setSubmitting(false);
      setDirection('forward');
      setStep(STEPS.THANK_YOU);
    }
  };

  const handleRestart = () => {
    setStep(STEPS.WELCOME);
    setCurrentQuestionIndex(0);
    setUserInfo({ nome: '', unidade: '' });
    setAnswers({});
  };

  const handleGoToResults = () => {
    router.push('/resultados');
  };

  const animationClass =
    direction === 'forward'
      ? 'animate-slide-in-right'
      : 'animate-slide-in-left';

  return (
    <main className="min-h-screen bg-stone-50 flex flex-col">
      {step !== STEPS.WELCOME && step !== STEPS.THANK_YOU && (
        <div className="sticky top-0 z-50 bg-stone-50/80 backdrop-blur-sm border-b border-stone-200/60">
          <div className="max-w-3xl mx-auto px-6 py-4">
            <ProgressBar
              current={currentProgressStep}
              total={totalStepsForProgress}
            />
          </div>
        </div>
      )}

      <div className="flex-1 flex items-center justify-center px-6 py-12 sm:py-16">
        <div key={`${step}-${currentQuestionIndex}`} className={animationClass}>
          {step === STEPS.WELCOME && <Welcome onStart={handleStart} />}

          {step === STEPS.IDENTIFICATION && (
            <Identification
              initialName={userInfo.nome}
              initialUnidade={userInfo.unidade}
              onSubmit={handleIdentificationSubmit}
              onBack={handleBack}
            />
          )}

          {step === STEPS.QUESTIONS && (
            <QuestionStep
              question={questionsData[currentQuestionIndex]}
              questionIndex={currentQuestionIndex}
              totalQuestions={totalQuestions}
              selectedValue={answers[questionsData[currentQuestionIndex].id]}
              onSelect={handleSelectAnswer}
              onNext={handleNextQuestion}
              onBack={handleBack}
            />
          )}

          {step === STEPS.REVIEW && (
            <Review
              questions={questionsData}
              answers={answers}
              userInfo={userInfo}
              onSubmit={handleSubmit}
              onBack={handleBack}
              submitting={submitting}
            />
          )}

          {step === STEPS.THANK_YOU && (
            <ThankYou
              name={userInfo.nome}
              onRestart={handleRestart}
              onGoToResults={handleGoToResults}
            />
          )}
        </div>
      </div>
    </main>
  );
}
