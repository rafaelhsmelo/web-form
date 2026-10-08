// Simula banco de dados com arquivo JSON
// Em produção, seria Prisma + SQLite

import { User, FormResponse } from './types'
import fs from 'fs/promises'
import path from 'path'
import bcrypt from 'bcrypt'

// Diretório onde dados são armazenados
const DATA_DIR = path.join(process.cwd(), 'data')
const USERS_FILE = path.join(DATA_DIR, 'users.json')
const RESPONSES_FILE = path.join(DATA_DIR, 'responses.json')

/**
 * Garante que arquivos JSON existem
 * Se não existem, cria vazios
 */
async function ensureDataFilesExist() {
    try {
        await fs.mkdir(DATA_DIR, { recursive: true })
    try {
        await fs.access(USERS_FILE)
    } catch {
        await fs.writeFile(USERS_FILE, JSON.stringify([], null, 2))
    }

    // Se responses.json não existe, cria vazio
    try {
        await fs.access(RESPONSES_FILE)
    } catch {
        await fs.writeFile(RESPONSES_FILE, JSON.stringify([], null, 2))
    }
  } catch (error) {
    console.error('Erro ao garantir arquivos de dados:', error)
    throw error
  }
}

/**
 * Lê todos os usuários do arquivo
 */
async function getAllUsers(): Promise<User[]> {
  await ensureDataFilesExist()
  const data = await fs.readFile(USERS_FILE, 'utf-8')
  return JSON.parse(data)
}

/**
 * Lê todas as respostas do arquivo
 */
async function getAllResponses(): Promise<FormResponse[]> {
  await ensureDataFilesExist()
  const data = await fs.readFile(RESPONSES_FILE, 'utf-8')
  return JSON.parse(data)
}

/**
 * Busca usuário por email
 * Retorna null se não encontra
 */
export async function findUserByEmail(email: string): Promise<User | null> {
  const users = await getAllUsers()
  return users.find(u => u.email === email) || null
}

/**
 * Busca usuário por ID
 * Retorna null se não encontra
 */
export async function findUserById(id: string): Promise<User | null> {
  const users = await getAllUsers()
  return users.find(u => u.id === id) || null
}

/**
 * Salva novo usuário
 * Retorna o usuário criado
 */
export async function saveUser(user: User): Promise<User> {
  const users = await getAllUsers()
  
  if (users.some(u => u.email === user.email)) {
    throw new Error('Email já existe')
  }
  
  users.push(user)
  await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2))
  return user
}

// Adicionar nova função helper:
export async function createUser(email: string, password: string, name: string): Promise<User> {
  const hashedPassword = await hashPassword(password)
  
  const newUser: User = {
    id: generateId(),
    email,
    password: hashedPassword,
    name,
    createdAt: new Date().toISOString()
  }
  
  return saveUser(newUser)
}
/**
 * Salva resposta de formulário
 * Retorna a resposta criada
 */
export async function saveFormResponse(response: FormResponse): Promise<FormResponse> {
  const responses = await getAllResponses()
  
  // Verifica se usuário existe
  const user = await findUserById(response.userId)
  if (!user) {
    throw new Error('Usuário não existe')
  }

  responses.push(response)
  await fs.writeFile(RESPONSES_FILE, JSON.stringify(responses, null, 2))
  return response
}
/**
 * Busca todas as respostas de um usuário
 */
export async function getUserResponses(userId: string): Promise<FormResponse[]> {
  const responses = await getAllResponses()
  return responses.filter(r => r.userId === userId)
}

/**
 * Gera ID aleatório único
 * Usado para criar IDs de usuário e resposta
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2, 11) + Date.now().toString(36)
}

/**
 * Hash simples de senha (desenvolvimento apenas)
 * Em produção, use bcrypt
 */

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)  // 10 = salt rounds
}

export async function validatePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(plainPassword, hashedPassword)
}