'use client'

import { createContext, useContext, useState, ReactNode } from 'react'
import { User, AuthContextType } from '@/lib/types'

// Cria o contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined)

/**
 * Provider: Componente que fornece autenticação a toda a árvore
 * Deve envolver a aplicação no layout raiz
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Login: Autentica usuário por email e senha
   */
  async function login(email: string, password: string) {
    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'login', email, password })
      })

      const data = await res.json()

      if (!data.success) {
        setError(data.error || 'Erro ao fazer login')
        return
      }

      setUser(data.user)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao fazer login')
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Signup: Cria novo usuário
   */
  async function signup(email: string, password: string, name: string) {
    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'signup', email, password, name })
      })

      const data = await res.json()

      if (!data.success) {
        setError(data.error || 'Erro ao cadastrar')
        return
      }

      setUser(data.user)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao cadastrar')
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Logout: Desconecta usuário
   */
  function logout() {
    setUser(null)
    setError(null)
  }

  // Valor que será disponibilizado no contexto
  const value: AuthContextType = {
    user,
    login,
    signup,
    logout,
    isLoading,
    error
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

/**
 * Hook customizado: useAuth
 * Use em qualquer componente para acessar autenticação
 * Ex: const { user, login, error } = useAuth()
 */
export function useAuth() {
  const context = useContext(AuthContext)

  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider')
  }

  return context
}