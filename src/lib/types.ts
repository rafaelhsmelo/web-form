/**
 * Definição de tipos para o sistema de autenticação e formulários
 * Centraliza a estrutura de dados do projeto
 */

/**
 * Usuário do sistema
 * Armazenado com senha em hash (nunca plaintext)
 */
export type User = {
  id: string
  email: string
  password: string
  name: string
  createdAt: string
};

/**
 * Resposta de um formulário preenchido
 * Referencia o usuário que respondeu
 */

export type FormResponse = {
  id: string
  userId: string
  answers: Record<string, string>;
  createdAt: string
  updatedAt: string
};

/**
 * Contexto de autenticação
 * Disponível globalmente via useAuth()
 */

export type AuthContextType = {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string, name: string) => Promise<void>
  logout: () => void
  isLoading: boolean
  error: string | null
};