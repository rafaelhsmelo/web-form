"use client";

import { useState, type FormEvent } from "react";
import { questions as initialQuestions, type question } from "@/data/questions";

type TokenResponse = {
  token: string;
  questionarioId: string;
  status: "NAO_INICIADO" | "EM_PREENCHIMENTO" | "FINALIZADO";
  currentStep: number;
  answers: Record<string, string>;
  perguntas: question[];
};

export default function Home() {
  // 1. Definição dos Estados
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [questions, setQuestions] = useState<question[]>(initialQuestions);
  const [tokenInput, setTokenInput] = useState("");
  const [tokenValidated, setTokenValidated] = useState(false);
  const [status, setStatus] = useState<TokenResponse["status"] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
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

  const handleValidateToken = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: tokenInput.trim() }),
      });
      const data = (await response.json()) as TokenResponse;

      if (!response.ok) {
        throw new Error(
          "error" in data
            ? String(data.error)
            : "Não foi possível validar o token.",
        );
      }

      if (data.perguntas.length === 0) {
        throw new Error(
          "O questionário associado a este token não possui perguntas.",
        );
      }

      setQuestions(data.perguntas);
      setAnswers(data.answers);
      setCurrentStep(
        Math.max(0, Math.min(data.currentStep, data.perguntas.length - 1)),
      );
      setStatus(data.status);
      sessionStorage.setItem("questionnaireToken", data.token);
      setTokenValidated(true);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Ocorreu um erro ao validar o token.",
      );
    } finally {
      setIsLoading(false);
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

    const token = sessionStorage.getItem("questionnaireToken");
    if (!token) {
      setError("Token da sessão não encontrado. Valide o token novamente.");
      return;
    }

    setError("");
    setIsRestarting(true);

    try {
      const response = await fetch("/api/respostas", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(
          data.error ?? "Não foi possível recomeçar o questionário.",
        );
      }

      setAnswers({});
      setCurrentStep(0);
      setStatus("NAO_INICIADO");
      setIsReviewing(false);
      setShowQuestionnaire(true);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Ocorreu um erro ao recomeçar.",
      );
    } finally {
      setIsRestarting(false);
    }
  };

  const persistProgress = async (
    nextAnswers: Record<string, string>,
    nextStep: number,
  ): Promise<boolean> => {
    const token = sessionStorage.getItem("questionnaireToken");
    if (!token) {
      setSaveError("Token da sessão não encontrado. Valide o token novamente.");
      return false;
    }

    setPendingSave({ answers: nextAnswers, currentStep: nextStep });
    setIsSaving(true);
    setSaveError("");

    try {
      const response = await fetch("/api/respostas", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          answers: nextAnswers,
          currentStep: nextStep,
        }),
      });
      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "Não foi possível salvar o progresso.");
      }

      setStatus("EM_PREENCHIMENTO");
      setPendingSave(null);
      return true;
    } catch (error) {
      setSaveError(
        error instanceof Error ? error.message : "Ocorreu um erro ao salvar.",
      );
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  // 2.Variável de apoio para a pergunta da vez
  const question = questions[currentStep];

  // Calcula a porcentafem da barra de progresso
  const progressPercentage = ((currentStep + 1) / questions.length) * 100;

  // Verifica se existe uma resposta grava para o ID da pergunta atual
  const hasAnsweredCurrent = answers[question.id] !== undefined;

  // 3. Funções de interação e navegação
  const handleSelectOption = async (optionId: string) => {
    if (isSaving) return;

    const nextAnswers = {
      ...answers,
      [question.id]: optionId,
    };
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
    if (isSaving || !hasAnsweredCurrent) return;

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

    const token = sessionStorage.getItem("questionnaireToken");
    if (!token) {
      setSubmitError(
        "Token da sessão não encontrado. Valide o token novamente.",
      );
      return;
    }

    setSubmitError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/enviar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(
          data.error ?? "Não foi possível enviar o questionário.",
        );
      }

      setStatus("FINALIZADO");
      setIsReviewing(false);
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Ocorreu um erro ao enviar.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!tokenValidated) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <form
          onSubmit={handleValidateToken}
          className="w-full max-w-md rounded-xl bg-white p-8 shadow-sm"
        >
          <h1 className="mb-2 text-2xl font-semibold text-gray-800">
            Acesse seu questionário
          </h1>
          <p className="mb-6 text-gray-500">
            Informe o token recebido para continuar.
          </p>
          <label
            htmlFor="token"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Token de acesso
          </label>
          <input
            id="token"
            value={tokenInput}
            onChange={(event) => setTokenInput(event.target.value)}
            required
            className="w-full rounded-lg border border-gray-300 p-3"
          />
          {error && (
            <p role="alert" className="mt-3 text-sm text-red-600">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={isLoading}
            className="mt-6 w-full rounded-full bg-black px-6 py-3 font-medium text-white disabled:opacity-50"
          >
            {isLoading ? "Validando..." : "Continuar"}
          </button>
        </form>
      </main>
    );
  }

  if (status === "FINALIZADO") {
    return (
      <main className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="mx-auto w-full max-w-3xl rounded-xl bg-white p-8 shadow-sm">
          <h1 className="mb-2 text-2xl font-semibold text-gray-800">
            Questionário finalizado
          </h1>
          <p className="mb-8 text-gray-500">
            Suas respostas estão disponíveis para consulta.
          </p>
          <div className="space-y-6">
            {questions.map((item) => {
              const selectedOption = item.options.find(
                (option) => option.id === answers[item.id],
              );
              return (
                <section
                  key={item.id}
                  className="border-b border-gray-100 pb-4"
                >
                  <h2 className="font-medium text-gray-800">{item.title}</h2>
                  <p className="mt-2 text-gray-600">
                    {selectedOption?.label ?? "Sem resposta"}
                  </p>
                </section>
              );
            })}
          </div>
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
          <div className="space-y-6">
            {questions.map((item) => {
              const selectedOption = item.options.find(
                (option) => option.id === answers[item.id],
              );
              return (
                <section
                  key={item.id}
                  className="border-b border-gray-100 pb-4"
                >
                  <h2 className="font-medium text-gray-800">{item.title}</h2>
                  <p className="mt-2 text-gray-600">
                    {selectedOption?.label ?? "Sem resposta"}
                  </p>
                </section>
              );
            })}
          </div>
          {submitError && (
            <p role="alert" className="mt-6 text-sm text-red-600">
              {submitError}
            </p>
          )}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-between">
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
              onClick={() => void handleRestart()}
              disabled={isSubmitting || isRestarting}
              className="rounded-full border border-gray-300 px-6 py-3 font-medium text-gray-700 disabled:opacity-50"
            >
              Limpar respostas
            </button>
            <button
              onClick={() => void handleSubmit()}
              disabled={isSubmitting}
              className="rounded-full bg-black px-6 py-3 font-medium text-white disabled:opacity-50"
            >
              {isSubmitting ? "Enviando..." : "Enviar questionário"}
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (status === "NAO_INICIADO" && !showQuestionnaire) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <section className="w-full max-w-md rounded-xl bg-white p-8 text-center shadow-sm">
          <h1 className="mb-3 text-2xl font-semibold text-gray-800">
            Bem-vindo ao questionário
          </h1>
          <p className="mb-6 text-gray-500">
            Você está prestes a iniciar o preenchimento do questionário.
          </p>
          <button
            onClick={() => setShowQuestionnaire(true)}
            className="w-full rounded-full bg-black px-6 py-3 font-medium text-white"
          >
            Iniciar questionário
          </button>
        </section>
      </main>
    );
  }

  if (status === "EM_PREENCHIMENTO" && !showQuestionnaire) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <section className="w-full max-w-md rounded-xl bg-white p-8 text-center shadow-sm">
          <h1 className="mb-3 text-2xl font-semibold text-gray-800">
            Questionário em andamento
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
            onClick={() => setShowQuestionnaire(true)}
            className="mb-3 w-full rounded-full bg-black px-6 py-3 font-medium text-white"
          >
            Continuar preenchimento
          </button>
          <button
            onClick={handleRestart}
            disabled={isRestarting}
            className="w-full rounded-full border border-gray-300 px-6 py-3 font-medium text-gray-700 disabled:opacity-50"
          >
            {isRestarting ? "Recomeçando..." : "Descartar e recomeçar"}
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      {/* Contêiner Principal do Card */}
      <div className="bg-white p-8 rounded-xl shadow-sm w-full max-w-3xl">
        {/* --- CABEÇALHO --- */}
        <div className="mb-8">
          {/* Progresso visual */}
          <div className="flex flex-col gap-2 mb-6">
            {/* Texto do progresso */}
            <div className="flex justify-between text-sm font-medium text-gray-400 uppercase tracking-wider">
              <span>
                Passo {currentStep + 1} de {questions.length}
              </span>
              <span>{Math.round(progressPercentage)}%</span>
            </div>

            {/* Barra de progresso */}
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden block">
              {/* Preenchimento do progresso */}
              <div
                className="h-full bg-black transition-all duration-500 ease-out"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>

          {/* Título */}
          <h2 className="text-3xl font-semibold text-gray-800 mt-2">
            {question.title}
          </h2>

          {/* Subtítulo */}
          {question.subtitle && (
            <p className="text-gray-500 mt-2">{question.subtitle}</p>
          )}
        </div>

        {/* --- OPÇÕES DE RESPOSTA --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {/* Percorre a lista de opções da pergunta atual */}
          {question.options.map((option) => {
            // Verifica se a respost guardada para a pergunta é igual a este botão
            const isSelected = answers[question.id] === option.id;

            return (
              <button
                key={option.id}
                onClick={() => void handleSelectOption(option.id)}
                disabled={isSaving}
                // CORREÇÃO: Adicionado 'flex' e corrigido 'items-center' (com hífen)
                className={`p-4 border rounded-xl text-left transition-all flex items-center w-full gap-4 ${
                  isSelected
                    ? "border-black bg-gray-50 ring-2 ring-black"
                    : "border-gray-200 hover:border-gray-400"
                } disabled:cursor-not-allowed disabled:opacity-60`}
              >
                {/* Renderiza imagem da opção, se houver */}
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

                  {/* Renderiza um ✓ na opção selectionada */}
                  {isSelected && (
                    <div className="w-4 h-4 bg-black rounded-full flex items-center justify-center">
                      <span className="text-white text-[10px]">✓</span>
                    </div>
                  )}

                  {/* Renderiza descrição da opção, se houver */}
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

        {/* --- RODAPÉ E NAVEGAÇÃO --- */}
        <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-100">
          {/* Botão de voltar */}
          <button
            onClick={() => void handlePrevious()}
            disabled={currentStep === 0 || isSaving}
            className="px-6 py-2 text-gray-500 hover:text-gray-800 disabled:opacity-30 disabled:cursor-not-allowed font-medium transition-colors"
          >
            ← Voltar
          </button>

          {/* Botão de avançar */}
          {hasAnsweredCurrent && (
            <button
              onClick={() =>
                void (currentStep === questions.length - 1
                  ? handleReview()
                  : handleNext())
              }
              disabled={isSaving}
              className="px-6 py-2 bg-black text-white rounded-full hover:bg-gray-800 font-medium transition-colors"
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
