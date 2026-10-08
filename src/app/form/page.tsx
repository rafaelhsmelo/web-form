'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { questions } from '@/data/questions'

export default function FormPage() {
  const router = useRouter()
  const { user, logout, isLoading } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [isSaving, setIsSaving] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && !isLoading && !user) {
      router.push('/')
    }
  }, [user, isLoading, mounted, router])

  if (!mounted || isLoading || !user) return null

  const userId = user.id

  const question = questions[currentStep]
  const progressPercentage = ((currentStep + 1) / questions.length) * 100
  const hasAnsweredCurrent = answers[question.id] !== undefined

  const handleSelectOption = (optionId: string) => {
    setAnswers({
      ...answers,
      [question.id]: optionId,
    })
  }

  const handlePrevious = () => {
    setCurrentStep(currentStep - 1)
  }

  const handleNext = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleFinish = async () => {
    setIsSaving(true)

    try {
      const now = new Date().toISOString()
      const response = {
        id: crypto.randomUUID(),
        userId,
        answers,
        createdAt: now,
        updatedAt: now
      }

      const res = await fetch('/api/form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'save', response })
      })

      const data = await res.json()

      if (data.success) {
        router.push('/dashboard')
      } else {
        alert('Erro ao salvar formulário')
      }
    } catch (err) {
      console.error('Erro ao salvar formulário:', err)
      alert('Erro ao salvar formulário')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Backdrop effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
      </div>

      <div className="flex relative z-10">
        {/* Sidebar */}
        <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-gradient-to-b from-slate-800 to-slate-900 border-r border-slate-700 transition-all duration-300 flex flex-col h-screen fixed left-0`}>
          {/* Logo */}
          <div className="p-4 border-b border-slate-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center font-bold text-white">
                🏗️
              </div>
              {sidebarOpen && <span className="font-bold text-white text-lg">ArchiveForm</span>}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            <a href="/dashboard" className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors">
              <span className="text-xl">📊</span>
              {sidebarOpen && <span>Projetos</span>}
            </a>
          </nav>

          {/* User Profile */}
          <div className="p-4 border-t border-slate-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center font-bold text-white text-sm">
                {user.name[0]}
              </div>
              {sidebarOpen && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{user.name}</p>
                  <p className="text-xs text-slate-400 truncate">{user.email}</p>
                </div>
              )}
            </div>
            {sidebarOpen && (
              <button
                onClick={logout}
                className="mt-3 w-full px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-slate-700 rounded-lg transition-colors font-medium"
              >
                Sair
              </button>
            )}
          </div>

          {/* Toggle */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-3 m-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
          >
            {sidebarOpen ? '◀' : '▶'}
          </button>
        </aside>

        {/* Main Content */}
        <main className={`${sidebarOpen ? 'ml-64' : 'ml-20'} flex-1 transition-all duration-300 flex flex-col`}>
          {/* Header */}
          <div className="sticky top-0 z-20 backdrop-blur-md bg-slate-900/50 border-b border-slate-700">
            <div className="p-6 max-w-4xl mx-auto">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-white">📝 Responda o Formulário</h1>
                  <p className="text-slate-400 mt-1">Progresso: Passo {currentStep + 1} de {questions.length}</p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                    {Math.round(progressPercentage)}%
                  </p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-400 to-emerald-500 transition-all duration-500 ease-out"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Form Content */}
          <div className="flex-1 p-6 overflow-auto">
            <div className="max-w-4xl mx-auto">
              {/* Question */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">
                  {question.title}
                </h2>
                {question.subtitle && (
                  <p className="text-slate-400">{question.subtitle}</p>
                )}
              </div>

              {/* Options */}
              <div className="grid grid-cols-1 gap-4 mb-8">
                {question.options.map((option) => {
                  const isSelected = answers[question.id] === option.id

                  return (
                    <button
                      key={option.id}
                      onClick={() => handleSelectOption(option.id)}
                      className={`p-5 rounded-xl border-2 transition-all duration-200 flex items-center gap-4 text-left group ${
                        isSelected
                          ? 'border-green-500 bg-gradient-to-r from-green-500/20 to-emerald-500/20 shadow-lg shadow-green-500/30'
                          : 'border-slate-700 bg-slate-800/50 hover:border-slate-600 hover:bg-slate-800'
                      }`}
                    >
                      {option.imageUrl && (
                        <div className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border border-slate-600 group-hover:border-slate-500 transition-colors">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={option.imageUrl}
                            alt={option.label}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}

                      <div className="flex-1">
                        <span className={`block font-semibold text-lg transition-colors ${isSelected ? 'text-green-400' : 'text-white'}`}>
                          {option.label}
                        </span>

                        {option.description && (
                          <p className="text-sm text-slate-400 mt-1">
                            {option.description}
                          </p>
                        )}
                      </div>

                      {isSelected && (
                        <div className="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm">✓</span>
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>

              {/* Navigation */}
              <div className="flex justify-between items-center">
                <button
                  onClick={handlePrevious}
                  disabled={currentStep === 0}
                  className="px-6 py-3 text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed font-medium transition-colors"
                >
                  ← Voltar
                </button>

                {hasAnsweredCurrent && (
                  <button
                    onClick={
                      currentStep === questions.length - 1 ? handleFinish : handleNext
                    }
                    disabled={isSaving}
                    className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 shadow-lg shadow-green-500/30 hover:shadow-green-500/50"
                  >
                    {isSaving
                      ? 'Salvando...'
                      : currentStep === questions.length - 1
                        ? '✓ Finalizar'
                        : 'Avançar →'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}