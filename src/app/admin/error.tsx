"use client";

type AdminErrorProps = {
  error: Error & { digest?: string };
};

export default function AdminError({ error }: AdminErrorProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <section className="w-full max-w-lg rounded-xl bg-white p-8 text-center shadow-sm">
        <h1 className="text-2xl font-semibold text-gray-800">
          Não foi possível carregar o painel
        </h1>
        <p className="mt-3 text-gray-600">
          Verifique as variáveis de ambiente e o acesso ao banco de dados da
          aplicação.
        </p>
        {error.digest && (
          <p className="mt-3 text-xs text-gray-400">
            Código do erro: {error.digest}
          </p>
        )}
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-6 rounded-full bg-black px-6 py-3 font-medium text-white"
        >
          Tentar novamente
        </button>
      </section>
    </main>
  );
}
