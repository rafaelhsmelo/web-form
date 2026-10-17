// Status que o sistema expõe. NAO_INICIADO nunca é gravado:
// ele representa a ausência de registro para o userId.
export type Status = "NAO_INICIADO" | "EM_PREENCHIMENTO" | "FINALIZADO";

// Entrada de data/arquivo.json
export type UserInfo = {
  userId: string;
  formId: string;
};

// Entrada de data/respostas.json (uma por userId)
export type Registro = {
  status: "EM_PREENCHIMENTO" | "FINALIZADO";
  currentStep: number;
  answers: Record<string, string>;
  updatedAt: string;
  finalizedAt: string | null;
};
