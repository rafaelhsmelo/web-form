// Status que o sistema expõe. NAO_INICIADO nunca é gravado:
// ele representa a ausência de registro para o token.
export type Status = "NAO_INICIADO" | "EM_PREENCHIMENTO" | "FINALIZADO";

// Entrada de data/arquivo.json
export type TokenInfo = {
  token: string;
  questionarioId: string;
};

// Entrada de data/respostas.json (uma por token)
export type Registro = {
  status: "EM_PREENCHIMENTO" | "FINALIZADO";
  currentStep: number;
  answers: Record<string, string>;
  updatedAt: string;
  finalizedAt: string | null;
};
