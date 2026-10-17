import { Registro, Status, TokenInfo } from "./types";
import { turso } from "./turso";

export type FinalizedSubmission = {
  token: string;
  questionarioId: string;
  finalizedAt: string;
  answers: Record<string, string>;
};
// RN001: o token só é válido se existir na tabela tokens
export async function findToken(token: string): Promise<TokenInfo | null> {
  const result = await turso.execute({
    sql: "SELECT token, questionarioId FROM tokens WHERE token = ?",
    args: [token],
  });

  if (result.rows.length === 0) return null;

  return {
    token: result.rows[0].token as string,
    questionarioId: result.rows[0].questionarioId as string,
  };
}

export async function getRegistro(token: string): Promise<Registro | null> {
  const result = await turso.execute({
    sql: "SELECT status, currentStep, answers, updatedAt, finalizedAt FROM respostas WHERE token = ?",
    args: [token],
  });

  if (result.rows.length === 0) return null;

  const row = result.rows[0];

  // Proteção contra dados nulos, vazios ou corrompidos no banco de dados
  let parsedAnswers: Record<string, string> = {};
  if (row.answers && typeof row.answers === "string") {
    try {
      parsedAnswers = JSON.parse(row.answers);
    } catch {
      parsedAnswers = {}; // Falha silenciosa segura, assume que não há respostas
    }
  }

  return {
    status: row.status as "EM_PREENCHIMENTO" | "FINALIZADO",
    currentStep: row.currentStep as number,
    answers: parsedAnswers,
    updatedAt: row.updatedAt as string,
    finalizedAt: row.finalizedAt as string | null,
  };
}

export async function getFinalizedSubmissions(): Promise<FinalizedSubmission[]> {
  const result = await turso.execute({
    sql: `
      SELECT r.token, t.questionarioId, r.finalizedAt, r.answers
      FROM respostas r
      JOIN tokens t ON r.token = t.token
      WHERE r.status = 'FINALIZADO'
      ORDER BY r.finalizedAt DESC
    `,
  });

  return result.rows.map((row) => {
    if (typeof row.finalizedAt !== "string") {
      throw new Error(
        `O questionário finalizado do token "${String(row.token)}" não possui data de envio.`,
      );
    }
    if (typeof row.answers !== "string") {
      throw new Error(
        `As respostas finalizadas do token "${String(row.token)}" estão inválidas.`,
      );
    }

    let answers: Record<string, string>;
    try {
      answers = JSON.parse(row.answers) as Record<string, string>;
    } catch (error) {
      throw new Error(
        `As respostas finalizadas do token "${String(row.token)}" estão corrompidas.`,
        { cause: error },
      );
    }

    return {
      token: row.token as string,
      questionarioId: row.questionarioId as string,
      finalizedAt: row.finalizedAt,
      answers,
    };
  });
}

export async function getStatus(token: string): Promise<Status> {
  const registro = await getRegistro(token);
  return registro ? registro.status : "NAO_INICIADO";
}

// Cria ou atualiza o progresso no banco de dados. Recusa alteração se já finalizado (RN007)
export async function saveProgress(
  token: string,
  answers: Record<string, string>,
  currentStep: number,
): Promise<Registro> {
  const registroAtual = await getRegistro(token);

  if (registroAtual?.status === "FINALIZADO") {
    throw new Error("Questionário já finalizado");
  }

  const agora = new Date().toISOString();
  const answersJson = JSON.stringify(answers);

  await turso.execute({
    sql: `
      INSERT INTO respostas (token, status, currentStep, answers, updatedAt, finalizedAt)
      VALUES (?, 'EM_PREENCHIMENTO', ?, ?, ?, NULL)
      ON CONFLICT(token) DO UPDATE SET
        currentStep = excluded.currentStep,
        answers = excluded.answers,
        updatedAt = excluded.updatedAt
    `,
    args: [token, currentStep, answersJson, agora],
  });

  return {
    status: "EM_PREENCHIMENTO",
    currentStep,
    answers,
    updatedAt: agora,
    finalizedAt: null,
  };
}

// Descarta o preenchimento em andamento (recomeçar). Recusa se finalizado
export async function discardProgress(token: string): Promise<void> {
  const registroAtual = await getRegistro(token);

  if (registroAtual?.status === "FINALIZADO") {
    throw new Error("Questionário já finalizado");
  }

  await turso.execute({
    sql: "DELETE FROM respostas WHERE token = ?",
    args: [token],
  });
}

// Envio definitivo e irreversível (RF007)
export async function finalize(token: string): Promise<Registro> {
  const registroAtual = await getRegistro(token);

  if (!registroAtual) throw new Error("Nada para enviar");
  if (registroAtual.status === "FINALIZADO") throw new Error("Já finalizado");

  const agora = new Date().toISOString();

  await turso.execute({
    sql: `
      UPDATE respostas
      SET status = 'FINALIZADO', updatedAt = ?, finalizedAt = ?
      WHERE token = ?
    `,
    args: [agora, agora, token],
  });

  return {
    ...registroAtual,
    status: "FINALIZADO",
    updatedAt: agora,
    finalizedAt: agora,
  };
}