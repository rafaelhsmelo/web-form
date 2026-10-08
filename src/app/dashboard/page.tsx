'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { FormResponse } from '@/lib/types'

export default function Dashboard() {
  const router = useRouter()
  const { user, logout } = useAuth()

  if (!user) return null

  const userId = user.id

  const [responses, setResponses] = useState<FormResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  useEffect(() => {
    async function loadResponses() {
      try {
        const res = await fetch(`/api/form?userId=${userId}`)
        const data = await res.json()

        if (data.success) {
          const sorted = data.responses.sort(
            (a: FormResponse, b: FormResponse) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
          setResponses(sorted)
        }
      } catch (err) {
        console.error('Erro ao carregar respostas:', err)
      } finally {
        setIsLoading(false)
      }
    }

    loadResponses()
  }, [userId])

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-slate-900 flex">
      {/* Sidebar */}
      <aside className={`${
        sidebarOpen ? 'w-64' : 'w-20'
      } bg-gradient-to-b from-gray-950 to-gray-900 border-r border-gray-800 transition-all duration-300 flex flex-col`}>
        {/* Logo */}
        <div className="h-20 flex items-center justify-center border-b border-gray-800">
          <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center hover:shadow-lg hover:shadow-green-500/50 transition-all">
            <span className="text-white font-bold text-xl">🏗️</span>
          </div>
          {sidebarOpen && <span className="ml-3 font-bold text-white text-lg">ArchiveForm</span>}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-3">
          <div className={`px-4 py-3 rounded-lg bg-green-500/10 border border-green-500/30 ${!sidebarOpen && 'flex justify-center'}`}>
            <div className="flex items-center gap-3">
              <span className="text-2xl">📊</span>
              {sidebarOpen && <span className="text-white font-medium">Projetos</span>}
            </div>
          </div>

          <div className={`px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors cursor-pointer ${!sidebarOpen && 'flex justify-center'}`}>
            <div className="flex items-center gap-3 text-gray-400 hover:text-white">
              <span className="text-2xl">⚙️</span>
              {sidebarOpen && <span>Configurações</span>}
            </div>
          </div>
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-gray-800 space-y-4">
          <div className={`flex items-center ${!sidebarOpen && 'justify-center'} gap-3`}>
            <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-bold">
              {user.name.charAt(0).toUpperCase()}
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium text-sm truncate">{user.name}</p>
                <p className="text-gray-400 text-xs truncate">{user.email}</p>
              </div>
            )}
          </div>

          <button
            onClick={handleLogout}
            className="w-full py-2 px-3 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors text-sm font-medium"
          >
            {sidebarOpen ? 'Sair' : '🚪'}
          </button>
        </div>

        {/* Toggle Sidebar */}
        <div className="p-4 border-t border-gray-800">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full py-2 text-gray-400 hover:text-white transition-colors text-sm"
          >
            {sidebarOpen ? '◀' : '▶'}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-gray-900/50 backdrop-blur-md border-b border-gray-800 sticky top-0 z-10">
          <div className="px-8 py-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  Bem-vindo, {user.name}! 👋
                </h1>
                <p className="text-gray-400">Gerencie seus projetos e respostas</p>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-8 space-y-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-blue-500/20 to-blue-500/5 border border-blue-500/30 rounded-xl p-6 hover:border-blue-500/60 transition-all hover:shadow-lg hover:shadow-blue-500/10">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-400 text-sm font-medium">Total de Projetos</p>
                  <p className="text-4xl font-bold text-white mt-2">{responses.length}</p>
                </div>
                <span className="text-3xl">📋</span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-500/20 to-green-500/5 border border-green-500/30 rounded-xl p-6 hover:border-green-500/60 transition-all hover:shadow-lg hover:shadow-green-500/10">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-400 text-sm font-medium">Concluídos Este Mês</p>
                  <p className="text-4xl font-bold text-white mt-2">{
                    responses.filter(r => {
                      const date = new Date(r.createdAt)
                      const now = new Date()
                      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
                    }).length
                  }</p>
                </div>
                <span className="text-3xl">✅</span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-500/20 to-purple-500/5 border border-purple-500/30 rounded-xl p-6 hover:border-purple-500/60 transition-all hover:shadow-lg hover:shadow-purple-500/10">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-400 text-sm font-medium">Último Projeto</p>
                  <p className="text-lg font-bold text-white mt-2">
                    {responses.length > 0
                      ? new Date(responses[0].createdAt).toLocaleDateString('pt-BR')
                      : 'Nenhum ainda'
                    }
                  </p>
                </div>
                <span className="text-3xl">📅</span>
              </div>
            </div>
          </div>

          {/* Main Section */}
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white">Meus Projetos</h2>
                <p className="text-gray-400 text-sm mt-1">Histórico completo de formulários respondidos</p>
              </div>
              <button
                onClick={() => router.push('/form')}
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold rounded-lg transition-all shadow-lg hover:shadow-green-500/50 hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0"
              >
                + Novo Projeto
              </button>
            </div>

            {/* Loading State */}
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="space-y-4 w-full max-w-2xl">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-24 bg-gray-800/50 rounded-lg animate-pulse border border-gray-700"></div>
                  ))}
                </div>
              </div>
            ) : responses.length === 0 ? (
              <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700 rounded-xl p-12 text-center">
                <span className="text-5xl mb-4 block">📭</span>
                <h3 className="text-xl font-bold text-white mb-2">Nenhum projeto ainda</h3>
                <p className="text-gray-400 mb-6">Comece a criar seus projetos respondendo o formulário de residência</p>
                <button
                  onClick={() => router.push('/form')}
                  className="inline-block px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold rounded-lg transition-all shadow-lg hover:shadow-green-500/50 hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  Criar Primeiro Projeto
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {responses.map((response, index) => (
                  <div
                    key={response.id}
                    className="group bg-gradient-to-r from-gray-800/50 to-gray-900/30 border border-gray-700 hover:border-green-500/50 rounded-xl p-6 transition-all hover:shadow-lg hover:shadow-green-500/10 hover:bg-gray-800/60"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-green-400/20 to-green-600/20 border border-green-500/30 rounded-lg flex items-center justify-center">
                            <span className="text-xl">📐</span>
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-white">
                              Projeto #{responses.length - index}
                            </h3>
                            <p className="text-sm text-gray-400">
                              📅 {new Date(response.createdAt).toLocaleDateString('pt-BR', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>

                        {/* Respostas em Grid */}
                        <div className="grid grid-cols-3 gap-3 mt-4">
                          <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-700">
                            <p className="text-xs text-gray-500 font-medium uppercase">Unidade</p>
                            <p className="text-sm text-green-400 font-semibold mt-1">
                              {response.answers.unidade?.split('_').pop()?.toUpperCase() ?? '—'}
                            </p>
                          </div>
                          <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-700">
                            <p className="text-xs text-gray-500 font-medium uppercase">Uso Principal</p>
                            <p className="text-sm text-green-400 font-semibold mt-1">
                              {response.answers.uso_principal?.split('_').slice(0, 2).join(' ').toUpperCase() ?? '—'}
                            </p>
                          </div>
                          <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-700">
                            <p className="text-xs text-gray-500 font-medium uppercase">Frequência</p>
                            <p className="text-sm text-green-400 font-semibold mt-1">
                              {response.answers.frequencia?.split('_').slice(0, 2).join(' ').toUpperCase() ?? '—'}
                            </p>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => alert(JSON.stringify(response.answers, null, 2))}
                        className="px-4 py-2 bg-green-500/10 text-green-400 hover:bg-green-500/20 border border-green-500/30 rounded-lg font-medium text-sm transition-all whitespace-nowrap group-hover:border-green-500/60 group-hover:shadow-lg group-hover:shadow-green-500/10"
                      >
                        Ver Detalhes
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}