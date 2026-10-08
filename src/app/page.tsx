'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

export default function Home() {
  const router = useRouter()
  const { user, login, signup, error, isLoading } = useAuth()

  const [tab, setTab] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')

  useEffect(() => {
    if (user) {
      router.push('/dashboard')
    }
  }, [user, router])

  if (user) return null

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    await login(email, password)
    if (!error) {
      setEmail('')
      setPassword('')
    }
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    await signup(email, password, name)
    if (!error) {
      setEmail('')
      setPassword('')
      setName('')
      setTab('login')
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Padrão geométrico de fundo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-72 h-72 bg-green-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* Container Principal */}
      <div className="relative z-10 w-full max-w-5xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-0">
          {/* Seção Esquerda: Branding */}
          <div className="hidden lg:flex flex-col justify-center items-center text-white px-8">
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">🏗️</span>
                </div>
                <span className="text-2xl font-bold">ArchiveForm</span>
              </div>
            </div>

            <div className="space-y-4 text-center">
              <h2 className="text-4xl font-bold leading-tight">
                Projetos Residenciais
                <br />
                Profissionais
              </h2>
              <p className="text-lg text-gray-300">
                Planeje, organize e acompanhe cada detalhe de seus projetos de residência com precisão e elegância.
              </p>
            </div>

            {/* Features */}
            <div className="mt-12 space-y-4 w-full max-w-sm">
              <div className="flex gap-3 items-start">
                <div className="w-6 h-6 bg-green-500 rounded-full flex-shrink-0 mt-0.5"></div>
                <span className="text-gray-300">Gestão completa de projetos</span>
              </div>
              <div className="flex gap-3 items-start">
                <div className="w-6 h-6 bg-green-500 rounded-full flex-shrink-0 mt-0.5"></div>
                <span className="text-gray-300">Respostas organizadas e acessíveis</span>
              </div>
              <div className="flex gap-3 items-start">
                <div className="w-6 h-6 bg-green-500 rounded-full flex-shrink-0 mt-0.5"></div>
                <span className="text-gray-300">Interface intuitiva e moderna</span>
              </div>
            </div>
          </div>

          {/* Seção Direita: Formulário */}
          <div className="flex items-center justify-center">
            <div className="w-full max-w-md">
              {/* Card Principal */}
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-white/20">
                {/* Tabs */}
                <div className="flex gap-1 mb-8 bg-gray-100 p-1 rounded-lg">
                  <button
                    onClick={() => setTab('login')}
                    className={`flex-1 py-3 px-4 rounded-md font-semibold transition-all duration-300 ${
                      tab === 'login'
                        ? 'bg-white text-green-600 shadow-md'
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    Entrar
                  </button>
                  <button
                    onClick={() => setTab('signup')}
                    className={`flex-1 py-3 px-4 rounded-md font-semibold transition-all duration-300 ${
                      tab === 'signup'
                        ? 'bg-white text-green-600 shadow-md'
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    Cadastro
                  </button>
                </div>

                {/* Erro */}
                {error && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm animate-shake">
                    <div className="font-semibold">Erro</div>
                    <div>{error}</div>
                  </div>
                )}

                {/* Login Form */}
                {tab === 'login' && (
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                          ✉️
                        </span>
                        <input
                          type="email"
                          placeholder="seu@email.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Senha
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                          🔒
                        </span>
                        <input
                          type="password"
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                          required
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0"
                    >
                      {isLoading ? (
                        <span className="flex items-center justify-center gap-2">
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                          Entrando...
                        </span>
                      ) : (
                        'Entrar'
                      )}
                    </button>

                    <div className="text-center pt-2">
                      <button
                        type="button"
                        className="text-sm text-gray-600 hover:text-green-600 font-medium transition-colors"
                        onClick={() => alert('Recurso em desenvolvimento')}
                      >
                        Esqueci minha senha
                      </button>
                    </div>
                  </form>
                )}

                {/* Signup Form */}
                {tab === 'signup' && (
                  <form onSubmit={handleSignup} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nome Completo
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                          👤
                        </span>
                        <input
                          type="text"
                          placeholder="Seu nome"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                          ✉️
                        </span>
                        <input
                          type="email"
                          placeholder="seu@email.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Senha
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                          🔒
                        </span>
                        <input
                          type="password"
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                          required
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0"
                    >
                      {isLoading ? (
                        <span className="flex items-center justify-center gap-2">
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                          Cadastrando...
                        </span>
                      ) : (
                        'Cadastrar'
                      )}
                    </button>
                  </form>
                )}

                {/* Footer */}
                <div className="mt-8 pt-6 border-t border-gray-200 text-center text-xs text-gray-500">
                  Plataforma segura para arquitetos e designers
                </div>
              </div>

              {/* Mobile: Logo */}
              <div className="lg:hidden text-center mt-6">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold">🏗️</span>
                  </div>
                  <span className="text-xl font-bold text-white">ArchiveForm</span>
                </div>
                <p className="text-gray-400 text-sm">Projetos Residenciais Profissionais</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
