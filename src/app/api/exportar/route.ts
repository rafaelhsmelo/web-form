import { turso } from "@/lib/turso";
import { loadQuestionsFromCSV } from "@/utils/loadQuestions";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get("key");

  if (key !== process.env.ADMIN_KEY) {
    return NextResponse.json({ error: "Acesso negado." }, { status: 401 });
  }

  try {
    const perguntas = loadQuestionsFromCSV();

    const result = await turso.execute(`
      SELECT r.token_id, r.dados_resposta 
      FROM respostas r
      JOIN tokens t ON r.token_id = t.id
      WHERE t.status = 'FINALIZADO'
    `);

    const respostasBanco = result.rows;

    if (respostasBanco.length === 0) {
      return NextResponse.json(
        { error: "Nenhuma resposta finalizada encontrada." },
        { status: 404 },
      );
    }

    const titulosPerguntas = perguntas.map((p) => p.title.replace(/,/g, ""));
    const cabecalho = ["Token", ...titulosPerguntas].join(",") + "\n";

    let linhas = "";

    for (const row of respostasBanco) {
      const tokenId = row.token_id as string;
      const dadosJson = row.dados_resposta as string;

      let respostasUsuario: Record<string, string> = {};
      try {
        respostasUsuario = JSON.parse(dadosJson);
      } catch {
        continue;
      }

      const linhaUsuario = [tokenId];

      for (const pergunta of perguntas) {
        const idOpcaoEscolhida = respostasUsuario[pergunta.id];

        const opcaoTexto = idOpcaoEscolhida
          ? pergunta.options.find((opt) => opt.id === idOpcaoEscolhida)
              ?.label || "N/A"
          : "";

        linhaUsuario.push(opcaoTexto.replace(/,/g, ""));
      }

      linhas += linhaUsuario.join(",") + "\n";
    }

    const csvContent = cabecalho + linhas;

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="respostas_completas.csv"',
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Erro ao exportar dados." },
      { status: 500 },
    );
  }
}
