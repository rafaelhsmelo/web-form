'use client';

import { useState } from 'react';
import { Lock, ArrowRight, BarChart3, ArrowLeft, LogOut, Building } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { supabase } from '@/lib/supabase';

const COLORS = ['#44403c', '#78716c', '#a8a29e', '#d6d3d1', '#292524'];

const LABELS = {
  estilo: {
    minimalista: 'Minimalista',
    scandinavo: 'Escandinavo',
    classico: 'Clássico',
    industrial: 'Industrial',
    bohemio: 'Boémio',
  },
  paleta: {
    neutros: 'Tons Neutros',
    quentes: 'Tons Quentes',
    frios: 'Tons Frios',
    contraste: 'Alto Contraste',
  },
  ambiente: {
    sala: 'Sala de Estar',
    cozinha: 'Cozinha & Jantar',
    quarto: 'Quarto Principal',
    escritorio: 'Escritório',
  },
  prioridade: {
    funcionalidade: 'Funcionalidade',
    estetica: 'Estética',
    conforto: 'Conforto',
    sustentabilidade: 'Sustentabilidade',
  },
};

export default function ResultadosPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authenticating, setAuthenticating] = useState(false);

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthenticating(true);
    setAuthError('');

    try {
      const res = await fetch('/api/admin-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const result = await res.json();

      if (res.ok && result.authenticated) {
        setAuthenticated(true);
        fetchResults();
      } else {
        setAuthError('Palavra-passe incorreta. Tente novamente.');
      }
    } catch {
      setAuthError('Erro ao autenticar. Tente novamente.');
    } finally {
      setAuthenticating(false);
    }
  };

  const fetchResults = async () => {
    setLoading(true);
    try {
      const { data: rows, error } = await supabase
        .from('quiz_responses')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setData(rows || []);
    } catch {
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setAuthenticated(false);
    setPassword('');
    setData(null);
  };

  if (!authenticated) {
    return (
      <main className="min-h-screen bg-stone-50 flex items-center justify-center px-6">
        <div className="w-full max-w-md animate-fade-in-up">
          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-stone-900 text-stone-50 mb-4">
                <Lock className="w-6 h-6" strokeWidth={1.5} />
              </div>
              <h1 className="font-serif text-2xl font-bold text-stone-900 mb-2">
                Área Administrativa
              </h1>
              <p className="text-stone-600 text-sm">
                Introduza a palavra-passe para aceder aos resultados.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Palavra-passe"
                  className="w-full px-4 py-3.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-800 focus:ring-2 focus:ring-stone-800/10 transition-all"
                  autoFocus
                />
                {authError && (
                  <p className="mt-2 text-sm text-red-500">{authError}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={!password || authenticating}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-stone-900 text-stone-50 rounded-xl font-medium text-sm hover:bg-stone-800 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {authenticating ? (
                  <>
                    <span className="w-4 h-4 border-2 border-stone-300 border-t-stone-50 rounded-full animate-spin" />
                    A validar...
                  </>
                ) : (
                  <>
                    Entrar
                    <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="text-center mt-6">
            <a
              href="/"
              className="inline-flex items-center gap-2 text-stone-500 hover:text-stone-800 text-sm transition-colors"
            >
              <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
              Voltar ao questionário
            </a>
          </div>
        </div>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <span className="w-8 h-8 border-2 border-stone-300 border-t-stone-900 rounded-full animate-spin" />
          <p className="text-stone-500 text-sm">A carregar resultados...</p>
        </div>
      </main>
    );
  }

  return <Dashboard data={data || []} onLogout={handleLogout} />;
}

function Dashboard({ data, onLogout }) {
  const countByField = (field) => {
    const counts = {};
    data.forEach((item) => {
      const val = item.respostas?.[field];
      if (val) {
        counts[val] = (counts[val] || 0) + 1;
      }
    });
    return Object.entries(counts).map(([key, count]) => ({
      name: LABELS[field]?.[key] || key,
      value: count,
    }));
  };

  const countByUnidade = () => {
    const counts = {};
    data.forEach((item) => {
      if (item.unidade) {
        counts[item.unidade] = (counts[item.unidade] || 0) + 1;
      }
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, respostas: count }))
      .sort((a, b) => a.name.localeCompare(b.name, 'pt'));
  };

  const estiloData = countByField('estilo');
  const paletaData = countByField('paleta');
  const unidadeData = countByUnidade();

  return (
    <main className="min-h-screen bg-stone-50">
      <header className="bg-white border-b border-stone-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-stone-900 text-stone-50">
              <BarChart3 className="w-5 h-5" strokeWidth={1.5} />
            </div>
            <div>
              <h1 className="font-serif text-lg font-bold text-stone-900">
                Resultados
              </h1>
              <p className="text-xs text-stone-500">
                {data.length} resposta{data.length !== 1 ? 's' : ''} registada{data.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/"
              className="inline-flex items-center gap-2 text-stone-500 hover:text-stone-800 text-sm transition-colors"
            >
              <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
              <span className="hidden sm:inline">Questionário</span>
            </a>
            <button
              onClick={onLogout}
              className="inline-flex items-center gap-2 px-4 py-2 text-stone-600 hover:text-stone-900 text-sm font-medium border border-stone-300 rounded-lg hover:bg-stone-50 transition-all"
            >
              <LogOut className="w-4 h-4" strokeWidth={1.5} />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard title="Estilo de Interiores Preferido">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={estiloData} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: '#78716c' }}
                  interval={0}
                  angle={-15}
                  textAnchor="end"
                  height={60}
                />
                <YAxis tick={{ fontSize: 11, fill: '#78716c' }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    borderRadius: '12px',
                    border: '1px solid #e7e5e4',
                    fontSize: '13px',
                  }}
                />
                <Bar dataKey="value" fill="#44403c" radius={[6, 6, 0, 0]} name="Respostas" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Paleta de Cores">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={paletaData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  innerRadius={55}
                  paddingAngle={3}
                >
                  {paletaData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: '12px',
                    border: '1px solid #e7e5e4',
                    fontSize: '13px',
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                  iconType="circle"
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        <ChartCard title="Respostas por Unidade">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={unidadeData} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#78716c' }} />
              <YAxis tick={{ fontSize: 11, fill: '#78716c' }} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  borderRadius: '12px',
                  border: '1px solid #e7e5e4',
                  fontSize: '13px',
                }}
              />
              <Bar dataKey="respostas" fill="#78716c" radius={[6, 6, 0, 0]} name="Respostas" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ResponseTable data={data} />
      </div>
    </main>
  );
}

function ChartCard({ title, children }) {
  return (
    <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 animate-fade-in">
      <h2 className="font-serif text-lg font-bold text-stone-900 mb-4">
        {title}
      </h2>
      {children}
    </div>
  );
}

function ResponseTable({ data }) {
  const getLabel = (field, value) => LABELS[field]?.[value] || value || '—';

  const formatDate = (iso) => {
    if (!iso) return '—';
    try {
      return new Date(iso).toLocaleDateString('pt-PT', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return '—';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden animate-fade-in">
      <div className="p-6 border-b border-stone-200">
        <h2 className="font-serif text-lg font-bold text-stone-900">
          Compilado de Respostas
        </h2>
        <p className="text-sm text-stone-500 mt-1">
          Todas as respostas organizadas por unidade.
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-stone-200 bg-stone-50/50">
              <th className="text-left text-xs font-medium text-stone-500 uppercase tracking-wide px-6 py-3">
                Nome
              </th>
              <th className="text-left text-xs font-medium text-stone-500 uppercase tracking-wide px-6 py-3">
                Unidade
              </th>
              <th className="text-left text-xs font-medium text-stone-500 uppercase tracking-wide px-6 py-3">
                Estilo
              </th>
              <th className="text-left text-xs font-medium text-stone-500 uppercase tracking-wide px-6 py-3">
                Paleta
              </th>
              <th className="text-left text-xs font-medium text-stone-500 uppercase tracking-wide px-6 py-3">
                Ambiente
              </th>
              <th className="text-left text-xs font-medium text-stone-500 uppercase tracking-wide px-6 py-3">
                Prioridade
              </th>
              <th className="text-left text-xs font-medium text-stone-500 uppercase tracking-wide px-6 py-3">
                Data
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {data.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-12 text-stone-400">
                  Nenhuma resposta encontrada.
                </td>
              </tr>
            ) : (
              data.map((item, index) => (
                <tr key={item.id || index} className="hover:bg-stone-50/50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-stone-900">
                    {item.nome || '—'}
                  </td>
                  <td className="px-6 py-4 text-sm text-stone-700">
                    <span className="inline-flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5 text-stone-400" strokeWidth={1.5} />
                      {item.unidade || '—'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-stone-700">
                    {getLabel('estilo', item.respostas?.estilo)}
                  </td>
                  <td className="px-6 py-4 text-sm text-stone-700">
                    {getLabel('paleta', item.respostas?.paleta)}
                  </td>
                  <td className="px-6 py-4 text-sm text-stone-700">
                    {getLabel('ambiente', item.respostas?.ambiente)}
                  </td>
                  <td className="px-6 py-4 text-sm text-stone-700">
                    {getLabel('prioridade', item.respostas?.prioridade)}
                  </td>
                  <td className="px-6 py-4 text-sm text-stone-500">
                    {formatDate(item.created_at)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
