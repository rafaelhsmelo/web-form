import {
  FormOverview,
  FormUser,
  Registro,
  Status,
  UserInfo,
} from "./types";
import { turso } from "./turso";
import { loadFormIdsFromCSV } from "@/utils/loadQuestions";

export type FinalizedUserSubmission = {
  userId: string;
  formId: string;
  name: string | null;
  finalizedAt: string;
  answers: Record<string, string>;
};

function parseFinalizedSubmissionRow(
  row: Record<string, unknown>,
  userId: string,
): FinalizedUserSubmission {
  if (typeof row.finalizedAt !== "string" || typeof row.answers !== "string") {
    throw new Error(
      `As respostas finalizadas do userId "${userId}" estão inválidas.`,
    );
  }

  let answers: Record<string, string>;
  try {
    answers = JSON.parse(row.answers) as Record<string, string>;
  } catch (error) {
    throw new Error(
      `As respostas finalizadas do userId "${userId}" estão corrompidas.`,
      { cause: error },
    );
  }

  return {
    userId: row.userId as string,
    formId: row.formId as string,
    name: (row.name as string | null) ?? null,
    finalizedAt: row.finalizedAt,
    answers,
  };
}

export async function getFinalizedUserSubmission(
  formId: string,
  userId: string,
): Promise<FinalizedUserSubmission | null> {
  const result = await turso.execute({
    sql: `
      SELECT r.userId, u.formId, u.name, r.finalizedAt, r.answers
      FROM respostas r
      JOIN users u ON r.userId = u.userId
      WHERE r.userId = ? AND u.formId = ? AND r.status = 'FINALIZADO'
    `,
    args: [userId, formId],
  });

  if (result.rows.length === 0) {
    return null;
  }

  return parseFinalizedSubmissionRow(
    result.rows[0] as unknown as Record<string, unknown>,
    userId,
  );
}

type UserStatusRow = {
  formId: string;
  status: "RASCUNHO" | "FINALIZADO" | null;
};
// RN001: o userId só é válido se existir na tabela users
export async function findUser(userId: string): Promise<UserInfo | null> {
  const result = await turso.execute({
    sql: "SELECT userId, formId FROM users WHERE userId = ?",
    args: [userId],
  });

  if (result.rows.length === 0) return null;

  return {
    userId: result.rows[0].userId as string,
    formId: result.rows[0].formId as string,
  };
}

export async function getRegistro(userId: string): Promise<Registro | null> {
  const result = await turso.execute({
    sql: "SELECT status, currentStep, answers, updatedAt, finalizedAt FROM respostas WHERE userId = ?",
    args: [userId],
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
    status: row.status as "RASCUNHO" | "FINALIZADO",
    currentStep: row.currentStep as number,
    answers: parsedAnswers,
    updatedAt: row.updatedAt as string,
    finalizedAt: row.finalizedAt as string | null,
  };
}

export async function getFinalizedUserSubmissions(): Promise<FinalizedUserSubmission[]> {
  const result = await turso.execute({
    sql: `
      SELECT r.userId, u.formId, u.name, r.finalizedAt, r.answers
      FROM respostas r
      JOIN users u ON r.userId = u.userId
      WHERE r.status = 'FINALIZADO'
      ORDER BY r.finalizedAt DESC
    `,
  });

  return result.rows.map((row) =>
    parseFinalizedSubmissionRow(
      row as unknown as Record<string, unknown>,
      String(row.userId),
    ),
  );
}

export async function getFormsOverview(): Promise<FormOverview[]> {
  const formIds = loadFormIdsFromCSV();
  const result = await turso.execute({
    sql: `
      SELECT u.formId, r.status
      FROM users u
      LEFT JOIN respostas r ON r.userId = u.userId
    `,
  });
  const usersByForm = new Map<string, UserStatusRow[]>();

  for (const row of result.rows as unknown as UserStatusRow[]) {
    const formUsers = usersByForm.get(row.formId) ?? [];
    formUsers.push(row);
    usersByForm.set(row.formId, formUsers);
  }

  return formIds.map((formId) => {
    const users = usersByForm.get(formId) ?? [];
    const completedCount = users.filter(
      (user) => user.status === "FINALIZADO",
    ).length;
    const draftCount = users.filter(
      (user) => user.status === "RASCUNHO",
    ).length;

    return {
      formId,
      name: formId === "villa-piauhy" ? "Villa Piauhy" : formId,
      emptyCount: users.length - completedCount - draftCount,
      draftCount,
      completedCount,
      totalUserCount: users.length,
    };
  });
}

export async function getUsersByFormId(formId: string): Promise<FormUser[]> {
  const result = await turso.execute({
    sql: `
      SELECT u.userId, u.formId, u.name, r.status, r.updatedAt, r.finalizedAt
      FROM users u
      LEFT JOIN respostas r ON r.userId = u.userId
      WHERE u.formId = ?
      ORDER BY u.userId
    `,
    args: [formId],
  });

  return result.rows.map((row) => ({
    userId: row.userId as string,
    formId: row.formId as string,
    name: (row.name as string | null) ?? null,
    status: (row.status as Status | null) ?? "VAZIO",
    updatedAt: (row.updatedAt as string | null) ?? null,
    finalizedAt: (row.finalizedAt as string | null) ?? null,
  }));
}

export async function getStatus(userId: string): Promise<Status> {
  const registro = await getRegistro(userId);
  return registro ? registro.status : "VAZIO";
}

// Cria ou atualiza o progresso no banco de dados. Recusa alteração se já finalizado (RN007)
export async function saveProgress(
  userId: string,
  answers: Record<string, string>,
  currentStep: number,
): Promise<Registro> {
  const registroAtual = await getRegistro(userId);

  if (registroAtual?.status === "FINALIZADO") {
    throw new Error("Formulário já finalizado");
  }

  const agora = new Date().toISOString();
  const answersJson = JSON.stringify(answers);

  await turso.execute({
    sql: `
      INSERT INTO respostas (userId, status, currentStep, answers, updatedAt, finalizedAt)
      VALUES (?, 'RASCUNHO', ?, ?, ?, NULL)
      ON CONFLICT(userId) DO UPDATE SET
        currentStep = excluded.currentStep,
        answers = excluded.answers,
        updatedAt = excluded.updatedAt
    `,
    args: [userId, currentStep, answersJson, agora],
  });

  return {
    status: "RASCUNHO",
    currentStep,
    answers,
    updatedAt: agora,
    finalizedAt: null,
  };
}

// Descarta o preenchimento em andamento (recomeçar). Recusa se finalizado
export async function discardProgress(userId: string): Promise<void> {
  const registroAtual = await getRegistro(userId);

  if (registroAtual?.status === "FINALIZADO") {
    throw new Error("Formulário já finalizado");
  }

  await turso.execute({
    sql: "DELETE FROM respostas WHERE userId = ?",
    args: [userId],
  });
}

// Envio definitivo e irreversível (RF007)
export async function finalize(userId: string): Promise<Registro> {
  const registroAtual = await getRegistro(userId);

  if (!registroAtual) throw new Error("Nada para enviar");
  if (registroAtual.status === "FINALIZADO") throw new Error("Já finalizado");

  const agora = new Date().toISOString();

  await turso.execute({
    sql: `
      UPDATE respostas
      SET status = 'FINALIZADO', updatedAt = ?, finalizedAt = ?
      WHERE userId = ?
    `,
    args: [agora, agora, userId],
  });

  return {
    ...registroAtual,
    status: "FINALIZADO",
    updatedAt: agora,
    finalizedAt: agora,
  };
}