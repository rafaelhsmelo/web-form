'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { FormResponse } from '@/lib/types'

export default function Dashboard() {
  const router = useRouter()
  const { user, logout, isLoading: authLoading } = useAuth()

  const [responses, setResponses] = useState<FormResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedResponseId, setSelectedResponseId] = useState<string | null>(null)

  // Todos os hooks ANTES de qualquer return condicional
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && !authLoading && !user) {
      router.push('/')
    }
  }, [user, authLoading, mounted, router])

  useEffect(() => {
    if (!user) return

    const userId = user.id

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
  }, [user])

  // Return condicional DEPOIS de todos os hooks
  if (!mounted || authLoading || !user) return null

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  const handleDelete = async () => {
    if (!selectedResponseId) return

    try {
      const res = await fetch('/api/form', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ responseId: selectedResponseId })
      })

      if (res.ok) {
        setResponses(prev => prev.filter(r => r.id !== selectedResponseId))
        setShowDeleteModal(false)
        setSelectedResponseId(null)
      }
    } catch (err) {
      console.error('Erro ao deletar:', err)
    }
  }

  const handleEdit = (responseId: string) => {
    router.push(`/form?editId=${responseId}`)
  }

  const handleView = (response: FormResponse) => {
    router.push(`/view?id=${response.id}`)
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
              {sidebarOpen && <span className="text-white font-medium">Meus Projetos</span>}
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
                <p className="text-gray-400">Gerenciar seus projetos de residência</p>
              </div>
              <button
                onClick={() => router.push('/form')}
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold rounded-lg transition-all shadow-lg hover:shadow-green-500/50 hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0"
              >
                + Novo Projeto
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-8 space-y-6">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="space-y-4 w-full">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-32 bg-gray-800/50 rounded-xl animate-pulse border border-gray-700"></div>
                ))}
              </div>
            </div>
          ) : responses.length === 0 ? (
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700 rounded-xl p-16 text-center">
              <span className="text-6xl mb-4 block">📭</span>
              <h3 className="text-2xl font-bold text-white mb-2">Nenhum projeto ainda</h3>
              <p className="text-gray-400 mb-8">Comece a criar seus projetos respondendo o formulário de residência</p>
              <button
                onClick={() => router.push('/form')}
                className="inline-block px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold rounded-lg transition-all shadow-lg hover:shadow-green-500/50 hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0"
              >
                Criar Primeiro Projeto
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {responses.map((response, index) => (
                <div
                  key={response.id}
                  className="group bg-gradient-to-br from-gray-800/60 to-gray-900/40 border border-gray-700 hover:border-green-500/50 rounded-xl overflow-hidden transition-all hover:shadow-xl hover:shadow-green-500/10"
                >
                  {/* Card Header */}
                  <div className="bg-gradient-to-r from-green-600/20 to-green-600/5 px-6 py-4 border-b border-gray-700/50">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-bold text-white">
                        Projeto #{responses.length - index}
                      </h3>
                      <span className="px-3 py-1 bg-green-500/20 text-green-300 text-xs font-semibold rounded-full border border-green-500/30">
                        Finalizado
                      </span>
                    </div>
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

                  {/* Card Content - Resume das respostas */}
                  <div className="px-6 py-4 space-y-3">
                    <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-700/50">
                      <p className="text-xs text-gray-500 font-medium uppercase mb-1">Tipo de Unidade</p>
                      <p className="text-sm text-green-400 font-semibold">
                        {response.answers.unidade?.split('_').pop()?.toUpperCase() ?? '—'}
                      </p>
                    </div>

                    <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-700/50">
                      <p className="text-xs text-gray-500 font-medium uppercase mb-1">Uso Principal</p>
                      <p className="text-sm text-green-400 font-semibold">
                        {response.answers.uso_principal?.split('_').slice(0, 2).join(' ').toUpperCase() ?? '—'}
                      </p>
                    </div>

                    <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-700/50">
                      <p className="text-xs text-gray-500 font-medium uppercase mb-1">Frequência de Uso</p>
                      <p className="text-sm text-green-400 font-semibold">
                        {response.answers.frequencia?.split('_').slice(0, 2).join(' ').toUpperCase() ?? '—'}
                      </p>
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div className="px-6 py-4 bg-gray-900/30 border-t border-gray-700/50 flex gap-3">
                    <button
                      onClick={() => handleView(response)}
                      className="flex-1 py-2 px-3 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/30 rounded-lg font-medium text-sm transition-all hover:border-blue-500/60 hover:shadow-lg hover:shadow-blue-500/10"
                    >
                      👁️ Ver
                    </button>
                    <button
                      onClick={() => handleEdit(response.id)}
                      className="flex-1 py-2 px-3 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/30 rounded-lg font-medium text-sm transition-all hover:border-amber-500/60 hover:shadow-lg hover:shadow-amber-500/10"
                    >
                      ✏️ Editar
                    </button>
                    <button
                      onClick={() => {
                        setSelectedResponseId(response.id)
                        setShowDeleteModal(true)
                      }}
                      className="flex-1 py-2 px-3 bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30 rounded-lg font-medium text-sm transition-all hover:border-red-500/60 hover:shadow-lg hover:shadow-red-500/10"
                    >
                      🗑️ Deletar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Modal de Confirmação de Exclusão */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-xl max-w-sm w-full shadow-2xl">
            <div className="p-6">
              <h2 className="text-xl font-bold text-white mb-2">Deletar Projeto?</h2>
              <p className="text-gray-400 mb-6">
                Esta ação não pode ser desfeita. O projeto e todas as suas respostas serão permanentemente removidos.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 py-2 px-4 bg-gray-800 text-gray-300 hover:bg-gray-700 rounded-lg font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 py-2 px-4 bg-red-500 text-white hover:bg-red-600 rounded-lg font-medium transition-colors"
                >
                  Deletar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
