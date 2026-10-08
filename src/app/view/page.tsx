'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { questions } from '@/data/questions'
import { FormResponse } from '@/lib/types'

export default function ViewPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, logout, isLoading } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [responseData, setResponseData] = useState<FormResponse | null>(null)
  const [isLoadingData, setIsLoadingData] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && !isLoading && !user) {
      router.push('/')
    }
  }, [user, isLoading, mounted, router])

  // Carregar resposta para visualização
  useEffect(() => {
    const id = searchParams.get('id')
    if (id && user && !isLoadingData && !responseData) {
      setIsLoadingData(true)

      const loadResponse = async () => {
        try {
          const res = await fetch(`/api/form?userId=${user.id}&responseId=${id}`)
          const data = await res.json()

          if (data.success) {
            setResponseData(data.response)
          }
        } catch (err) {
          console.error('Erro ao carregar resposta:', err)
        } finally {
          setIsLoadingData(false)
        }
      }

      loadResponse()
    }
  }, [searchParams, user])

  if (!mounted || isLoading || !user) return null

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
          <a href="/dashboard" className={`px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors ${!sidebarOpen && 'flex justify-center'}`}>
            <div className="flex items-center gap-3 text-gray-400 hover:text-white">
              <span className="text-2xl">📊</span>
              {sidebarOpen && <span>Voltar</span>}
            </div>
          </a>
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
                  👁️ Visualizar Projeto
                </h1>
                <p className="text-gray-400">Detalhes completos do formulário respondido</p>
              </div>
              <button
                onClick={() => router.push('/dashboard')}
                className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-all"
              >
                ← Voltar
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-8 space-y-6">
          {isLoadingData ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-center">
                <div className="animate-spin w-12 h-12 border-4 border-gray-600 border-t-green-500 rounded-full mx-auto mb-4"></div>
                <p className="text-gray-400">Carregando projeto...</p>
              </div>
            </div>
          ) : responseData ? (
            <>
              {/* Metadata */}
              <div className="bg-gradient-to-r from-green-600/20 to-green-600/5 border border-gray-700 rounded-xl p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-gray-400 text-sm font-medium uppercase">Data de Criação</p>
                    <p className="text-white font-semibold mt-2">
                      {new Date(responseData.createdAt).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm font-medium uppercase">Última Atualização</p>
                    <p className="text-white font-semibold mt-2">
                      {new Date(responseData.updatedAt).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm font-medium uppercase">Status</p>
                    <p className="text-green-400 font-semibold mt-2">✓ Finalizado</p>
                  </div>
                </div>
              </div>

              {/* Respostas */}
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-white">Respostas</h2>
                
                {questions.map((question) => {
                  const selectedOptionId = responseData.answers[question.id]
                  const selectedOption = question.options.find(opt => opt.id === selectedOptionId)

                  return (
                    <div key={question.id} className="bg-gradient-to-br from-gray-800/60 to-gray-900/40 border border-gray-700 rounded-xl p-6">
                      <div className="mb-4">
                        <h3 className="text-lg font-bold text-white">{question.title}</h3>
                        {question.subtitle && (
                          <p className="text-gray-400 text-sm mt-1">{question.subtitle}</p>
                        )}
                      </div>

                      {selectedOption ? (
                        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 flex items-center gap-4">
                          {selectedOption.imageUrl && (
                            <div className="flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden border border-green-500/50">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={selectedOption.imageUrl}
                                alt={selectedOption.label}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          
                          <div className="flex-1">
                            <p className="text-green-400 font-semibold text-lg">{selectedOption.label}</p>
                            {selectedOption.description && (
                              <p className="text-gray-400 text-sm mt-1">{selectedOption.description}</p>
                            )}
                          </div>

                          <div className="flex-shrink-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-bold">✓</span>
                          </div>
                        </div>
                      ) : (
                        <p className="text-gray-400 italic">Sem resposta</p>
                      )}
                    </div>
                  )
                })}
              </div>
            </>
          ) : (
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700 rounded-xl p-12 text-center">
              <span className="text-5xl mb-4 block">❌</span>
              <h3 className="text-xl font-bold text-white mb-2">Projeto não encontrado</h3>
              <p className="text-gray-400 mb-6">Este projeto não existe ou foi removido</p>
              <button
                onClick={() => router.push('/dashboard')}
                className="inline-block px-8 py-3 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition-colors"
              >
                Voltar ao Dashboard
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
