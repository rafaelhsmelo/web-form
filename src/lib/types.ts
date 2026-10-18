// VAZIO representa a ausência de registro para o userId.
export type Status = "VAZIO" | "RASCUNHO" | "FINALIZADO";

// Entrada de data/arquivo.json
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

// Entrada de data/respostas.json (uma por userId)
export type Registro = {
  status: "RASCUNHO" | "FINALIZADO";
  currentStep: number;
  answers: Record<string, string>;
  updatedAt: string;
  finalizedAt: string | null;
};
