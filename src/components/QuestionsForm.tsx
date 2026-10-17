"use client";

import { useState } from "react";
import type { Status } from "@/lib/types";
import type { Question } from "@/utils/loadQuestions";

interface QuestionsFormProps {
  questions: Question[];
  initialStatus: Status;
  initialCurrentStep: number;
  initialAnswers: Record<string, string>;
}

interface ApiError {
  error?: string;
}

export default function QuestionsForm({
  questions,
  initialStatus,
  initialCurrentStep,
  initialAnswers,
}: QuestionsFormProps) {
  const [currentStep, setCurrentStep] = useState(() =>
    Math.max(0, Math.min(initialCurrentStep, questions.length - 1)),
  );
  const [answers, setAnswers] = useState(initialAnswers);
  const [status, setStatus] = useState<Status>(initialStatus);
  const [showForm, setShowForm] = useState(false);
  const [isRestarting, setIsRestarting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingSave, setPendingSave] = useState<{
    answers: Record<string, string>;
    currentStep: number;
  } | null>(null);
  const [saveError, setSaveError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [error, setError] = useState("");

  const persistProgress = async (
    nextAnswers: Record<string, string>,
    nextStep: number,
  ): Promise<boolean> => {
    setPendingSave({ answers: nextAnswers, currentStep: nextStep });
    setIsSaving(true);
    setSaveError("");

    try {
      const response = await fetch("/api/respostas", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers: nextAnswers,
          currentStep: nextStep,
        }),
      });
      const data = (await response.json()) as ApiError;

      if (!response.ok) {
        throw new Error(data.error ?? "Não foi possível salvar o progresso.");
      }

      setStatus("EM_PREENCHIMENTO");
      setPendingSave(null);
      return true;
    } catch (saveFailure) {
      setSaveError(
        saveFailure instanceof Error
          ? saveFailure.message
          : "Ocorreu um erro ao salvar.",
      );
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const handleRestart = async () => {
    if (
      !window.confirm(
        "Recomeçar apagará as respostas salvas. Deseja continuar?",
      )
    ) {
      return;
    }

    setError("");
    setIsRestarting(true);

    try {
      const response = await fetch("/api/respostas", { method: "DELETE" });
      const data = (await response.json()) as ApiError;

      if (!response.ok) {
        throw new Error(
          data.error ?? "Não foi possível recomeçar o Formulário.",
        );
      }

      setAnswers({});
      setCurrentStep(0);
      setStatus("NAO_INICIADO");
      setIsReviewing(false);
      setShowForm(true);
    } catch (restartFailure) {
      setError(
        restartFailure instanceof Error
          ? restartFailure.message
          : "Ocorreu um erro ao recomeçar.",
      );
    } finally {
      setIsRestarting(false);
    }
  };

  const handleExit = async () => {
    if (isSaving || isSubmitting || isRestarting) return;

    if (status === "EM_PREENCHIMENTO") {
      const saved = await persistProgress(answers, currentStep);
      if (!saved) return;
    }

    try {
      const response = await fetch("/api/userId", { method: "DELETE" });
      const data = (await response.json()) as ApiError;
      if (!response.ok) {
        throw new Error(data.error ?? "Não foi possível encerrar a sessão.");
      }
      window.location.reload();
    } catch (exitFailure) {
      setError(
        exitFailure instanceof Error
          ? exitFailure.message
          : "Ocorreu um erro ao encerrar a sessão.",
      );
    }
  };

  const handleSelectOption = async (optionId: string) => {
    if (isSaving) return;

    const question = questions[currentStep];
    const nextAnswers = { ...answers, [question.id]: optionId };
    setAnswers(nextAnswers);
    await persistProgress(nextAnswers, currentStep);
  };

  const handlePrevious = async () => {
    if (isSaving || currentStep === 0) return;

    const previousStep = currentStep - 1;
    if (await persistProgress(answers, previousStep)) {
      setCurrentStep(previousStep);
    }
  };

  const handleNext = async () => {
    if (isSaving || currentStep >= questions.length - 1) return;

    const nextStep = currentStep + 1;
    if (await persistProgress(answers, nextStep)) {
      setCurrentStep(nextStep);
    }
  };

  const handleReview = async () => {
    if (isSaving) return;
    if (await persistProgress(answers, currentStep)) {
      setIsReviewing(true);
    }
  };

  const handleSubmit = async () => {
    if (
      isSubmitting ||
      !window.confirm(
        "Após o envio, suas respostas não poderão mais ser alteradas. Deseja enviar?",
      )
    ) {
      return;
    }

    setSubmitError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/enviar", { method: "POST" });
      const data = (await response.json()) as ApiError;

      if (!response.ok) {
        throw new Error(
          data.error ?? "Não foi possível enviar o Formulário.",
        );
      }

      setStatus("FINALIZADO");
      setIsReviewing(false);
    } catch (submitFailure) {
      setSubmitError(
        submitFailure instanceof Error
          ? submitFailure.message
          : "Ocorreu um erro ao enviar.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (questions.length === 0) {
    return (
      <main className="min-h-screen bg-gray-50 p-4 md:p-8">
        <section className="mx-auto w-full max-w-3xl rounded-xl bg-white p-8 shadow-sm">
          <p role="alert" className="text-red-600">
            Não há perguntas configuradas para este Formulário.
          </p>
        </section>
      </main>
    );
  }

  const renderAnswers = () => (
    <div className="space-y-6">
      {questions.map((item) => {
        const selectedOption = item.options.find(
          (option) => option.id === answers[item.id],
        );
        return (
          <section key={item.id} className="border-b border-gray-100 pb-4">
            <h2 className="font-medium text-gray-800">{item.title}</h2>
            <p className="mt-2 text-gray-600">
              {selectedOption?.label ?? "Sem resposta"}
            </p>
          </section>
        );
      })}
    </div>
  );

  if (status === "FINALIZADO") {
    return (
      <main className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="mx-auto w-full max-w-3xl rounded-xl bg-white p-8 shadow-sm">
          <h1 className="mb-2 text-2xl font-semibold text-gray-800">
            Formulário finalizado
          </h1>
          <p className="mb-8 text-gray-500">
            Suas respostas estão disponíveis para consulta.
          </p>
          {renderAnswers()}
          {error && (
            <p role="alert" className="mt-6 text-sm text-red-600">
              {error}
            </p>
          )}
          <button
            onClick={() => void handleExit()}
            className="mt-8 rounded-full border border-gray-300 px-6 py-3 font-medium text-gray-700"
          >
            Sair
          </button>
        </div>
      </main>
    );
  }

  if (isReviewing) {
    return (
      <main className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="mx-auto w-full max-w-3xl rounded-xl bg-white p-8 shadow-sm">
          <h1 className="mb-2 text-2xl font-semibold text-gray-800">
            Revise suas respostas
          </h1>
          <p className="mb-8 text-gray-500">
            Confira as informações. Você ainda pode voltar e editá-las antes do
            envio.
          </p>
          {renderAnswers()}
          {submitError && (
            <p role="alert" className="mt-6 text-sm text-red-600">
              {submitError}
            </p>
          )}
          {saveError && (
            <p role="alert" className="mt-6 text-sm text-red-600">
              {saveError}
            </p>
          )}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-between">
            <button
              onClick={() => {
                setSubmitError("");
                setIsReviewing(false);
              }}
              disabled={isSubmitting}
              className="rounded-full border border-gray-300 px-6 py-3 font-medium text-gray-700 disabled:opacity-50"
            >
              Voltar e editar
            </button>
            <button
              onClick={() => void handleExit()}
              disabled={isSaving || isSubmitting}
              className="rounded-full border border-gray-300 px-6 py-3 font-medium text-gray-700 disabled:opacity-50"
            >
              Sair
            </button>
            <button
              onClick={() => void handleRestart()}
              disabled={isSaving || isSubmitting || isRestarting}
              className="rounded-full border border-gray-300 px-6 py-3 font-medium text-gray-700 disabled:opacity-50"
            >
              Limpar respostas
            </button>
            <button
              onClick={() => void handleSubmit()}
              disabled={isSubmitting}
              className="rounded-full bg-black px-6 py-3 font-medium text-white disabled:opacity-50"
            >
              {isSubmitting ? "Enviando..." : "Enviar Formulário"}
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (status === "NAO_INICIADO" && !showForm) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <section className="w-full max-w-md rounded-xl bg-white p-8 text-center shadow-sm">
          <h1 className="mb-3 text-2xl font-semibold text-gray-800">
            Bem-vindo ao Formulário
          </h1>
          <p className="mb-6 text-gray-500">
            Você está prestes a iniciar o preenchimento do Formulário.
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="w-full rounded-full bg-black px-6 py-3 font-medium text-white"
          >
            Iniciar Formulário
          </button>
        </section>
      </main>
    );
  }

  if (status === "EM_PREENCHIMENTO" && !showForm) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <section className="w-full max-w-md rounded-xl bg-white p-8 text-center shadow-sm">
          <h1 className="mb-3 text-2xl font-semibold text-gray-800">
            Formulário em andamento
          </h1>
          <p className="mb-6 text-gray-500">
            Você pode continuar de onde parou ou descartar as respostas e
            começar novamente.
          </p>
          {error && (
            <p role="alert" className="mb-4 text-sm text-red-600">
              {error}
            </p>
          )}
          <button
            onClick={() => setShowForm(true)}
            className="mb-3 w-full rounded-full bg-black px-6 py-3 font-medium text-white"
          >
            Continuar preenchimento
          </button>
          <button
            onClick={() => void handleRestart()}
            disabled={isRestarting}
            className="w-full rounded-full border border-gray-300 px-6 py-3 font-medium text-gray-700 disabled:opacity-50"
          >
            {isRestarting ? "Recomeçando..." : "Descartar e recomeçar"}
          </button>
        </section>
      </main>
    );
  }

  const question = questions[currentStep];
  const progressPercentage = ((currentStep + 1) / questions.length) * 100;
  const hasAnsweredCurrent = answers[question.id] !== undefined;

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-sm w-full max-w-3xl">
        <div className="mb-8">
          <div className="flex flex-col gap-2 mb-6">
            <div className="flex justify-between text-sm font-medium text-gray-400 uppercase tracking-wider">
              <span>
                Passo {currentStep + 1} de {questions.length}
              </span>
              <span>{Math.round(progressPercentage)}%</span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden block">
              <div
                className="h-full bg-black transition-all duration-500 ease-out"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
          <h2 className="text-3xl font-semibold text-gray-800 mt-2">
            {question.title}
          </h2>
          {question.subtitle && (
            <p className="text-gray-500 mt-2">{question.subtitle}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {question.options.map((option) => {
            const isSelected = answers[question.id] === option.id;
            return (
              <button
                key={option.id}
                onClick={() => void handleSelectOption(option.id)}
                disabled={isSaving}
                className={`p-4 border rounded-xl text-left transition-all flex items-center w-full gap-4 ${
                  isSelected
                    ? "border-black bg-gray-50 ring-2 ring-black"
                    : "border-gray-200 hover:border-gray-400"
                } disabled:cursor-not-allowed disabled:opacity-60`}
              >
                {option.imageUrl && (
                  <div className="flex-shrink-0 w-16 h-16 md:w-20 md:h-20">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={option.imageUrl}
                      alt={option.label}
                      className="w-full h-full object-cover rounded-lg border border-gray-200"
                    />
                  </div>
                )}
                <div className="flex flex-col flex-grow">
                  <span
                    className={`font-medium ${isSelected ? "text-black" : "text-gray-700"}`}
                  >
                    {option.label}
                  </span>
                  {isSelected && (
                    <div className="w-4 h-4 bg-black rounded-full flex items-center justify-center">
                      <span className="text-white text-[10px]">✓</span>
                    </div>
                  )}
                  {option.description && (
                    <p className="text-xs text-gray-500 mt-1">
                      {option.description}
                    </p>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {isSaving && (
          <p role="status" className="mb-4 text-sm text-gray-500">
            Salvando progresso...
          </p>
        )}
        {saveError && (
          <div role="alert" className="mb-4 text-sm text-red-600">
            <p>{saveError}</p>
            <button
              onClick={() => {
                if (pendingSave) {
                  void persistProgress(
                    pendingSave.answers,
                    pendingSave.currentStep,
                  );
                }
              }}
              disabled={isSaving || !pendingSave}
              className="mt-2 underline disabled:opacity-50"
            >
              Tentar salvar novamente
            </button>
          </div>
        )}
        {error && (
          <p role="alert" className="mb-4 text-sm text-red-600">
            {error}
          </p>
        )}

        <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-100">
          <button
            onClick={() => void handlePrevious()}
            disabled={currentStep === 0 || isSaving || isSubmitting}
            className="px-6 py-2 text-gray-500 hover:text-gray-800 disabled:opacity-30 disabled:cursor-not-allowed font-medium transition-colors"
          >
            ← Voltar
          </button>
          <button
            onClick={() => void handleExit()}
            disabled={isSaving || isSubmitting}
            className="px-6 py-2 text-gray-500 hover:text-gray-800 disabled:opacity-30 disabled:cursor-not-allowed font-medium transition-colors"
          >
            Sair
          </button>
          {hasAnsweredCurrent && (
            <button
              onClick={() =>
                void (currentStep === questions.length - 1
                  ? handleReview()
                  : handleNext())
              }
              disabled={isSaving}
              className="px-6 py-2 bg-black text-white rounded-full hover:bg-gray-800 font-medium transition-colors disabled:opacity-50"
            >
              {currentStep === questions.length - 1
                ? "Revisar respostas"
                : "Avançar →"}
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
