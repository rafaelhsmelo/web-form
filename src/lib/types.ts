// Tipos compartilhados: descrevem os dados que passam entre telas, API e banco.
// VAZIO representa a ausência de registro para o userId.
export type Status = "VAZIO" | "RASCUNHO" | "FINALIZADO";

// Dados básicos usados para encontrar o formulário da pessoa.
export type UserInfo = {
  userId: string;
  formId: string;
};

export type FormOverview = {
  formId: string;
  name: string;
  emptyCount: number;
  draftCount: number;
  completedCount: number;
  totalUserCount: number;
};

export type FormUser = {
  userId: string;
  formId: string;
  name: string | null;
  status: Status;
  updatedAt: string | null;
  finalizedAt: string | null;
};

export type CompiledFormResponse = {
  userId: string;
  name: string | null;
  status: Status;
  updatedAt: string | null;
  finalizedAt: string | null;
  answers: Record<string, string>;
};

// Formato salvo em respostas para continuar ou finalizar um preenchimento.
export type Registro = {
  status: "RASCUNHO" | "FINALIZADO";
  currentStep: number;
  answers: Record<string, string>;
  updatedAt: string;
  finalizedAt: string | null;
};
