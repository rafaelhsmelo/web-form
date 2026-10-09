// Uso exclusivo no servidor (API Routes): depende de 'fs'.
import fs from "fs/promises";
import path from "path";
import { Registro, Status, TokenInfo } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const TOKENS_FILE = path.join(DATA_DIR, "arquivo.json");
const RESPOSTAS_FILE = path.join(DATA_DIR, "respostas.json");

type Respostas = Record<string, Registro>;

async function readRespostas(): Promise<Respostas> {
  try {
    return JSON.parse(await fs.readFile(RESPOSTAS_FILE, "utf-8"));
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return {};
    throw err;
  }
}

// Grava em arquivo temporário e renomeia: evita deixar o JSON pela metade (RF005.5)
async function writeRespostas(data: Respostas): Promise<void> {
  const tmp = `${RESPOSTAS_FILE}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(data, null, 2));
  await fs.rename(tmp, RESPOSTAS_FILE);
}

// RN001: o token só é válido se existir em arquivo.json
export async function findToken(token: string): Promise<TokenInfo | null> {
  const file = JSON.parse(await fs.readFile(TOKENS_FILE, "utf-8")) as {
    tokens: TokenInfo[];
  };
  return file.tokens.find((t) => t.token === token) ?? null;
}

export async function getRegistro(token: string): Promise<Registro | null> {
  const respostas = await readRespostas();
  return respostas[token] ?? null;
}

export async function getStatus(token: string): Promise<Status> {
  const registro = await getRegistro(token);
  return registro ? registro.status : "NAO_INICIADO";
}

// Cria ou atualiza o progresso. Recusa alteração se já finalizado (RN007)
export async function saveProgress(
  token: string,
  answers: Record<string, string>,
  currentStep: number,
): Promise<Registro> {
  const respostas = await readRespostas();
  if (respostas[token]?.status === "FINALIZADO") {
    throw new Error("Questionário já finalizado");
  }
  const registro: Registro = {
    status: "EM_PREENCHIMENTO",
    currentStep,
    answers,
    updatedAt: new Date().toISOString(),
    finalizedAt: null,
  };
  respostas[token] = registro;
  await writeRespostas(respostas);
  return registro;
}

// Descarta o preenchimento em andamento (recomeçar). Recusa se finalizado
export async function discardProgress(token: string): Promise<void> {
  const respostas = await readRespostas();
  if (respostas[token]?.status === "FINALIZADO") {
    throw new Error("Questionário já finalizado");
  }
  delete respostas[token];
  await writeRespostas(respostas);
}

// Envio definitivo e irreversível (RF007)
export async function finalize(token: string): Promise<Registro> {
  const respostas = await readRespostas();
  const atual = respostas[token];
  if (!atual) throw new Error("Nada para enviar");
  if (atual.status === "FINALIZADO") throw new Error("Já finalizado");
  const agora = new Date().toISOString();
  respostas[token] = {
    ...atual,
    status: "FINALIZADO",
    updatedAt: agora,
    finalizedAt: agora,
  };
  await writeRespostas(respostas);
  return respostas[token];
}
