import { GET as exportForms } from "@/app/api/admin/export/route";

// Reaproveita a exportação geral, limitando o resultado a um formulário.

export async function GET(
  request: Request,
  context: { params: Promise<{ formId: string }> },
) {
  const { formId } = await context.params;
  const url = new URL(request.url);
  url.searchParams.set("formId", formId);
  return exportForms(new Request(url, request));
}
