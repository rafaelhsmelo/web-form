import fs from "fs";
import path from "path";
import Papa from "papaparse";

// Tipagem de dados
export type Option = {
  id: string;
  label: string;
  description?: string;
  imageUrl?: string;
};

export type Question = {
  id: string;
  title: string;
  subtitle?: string;
  type: "choice";
  sectionId: string;
  sectionTitle: string;
  options: Option[];
};

interface CsvRow {
  form_id: string;
  section_id: string;
  section_title: string;
  question_id: string;
  question_title: string;
  question_subtitle?: string;
  option_id: string;
  option_label: string;
  option_image?: string;
}

export function loadFormIdsFromCSV(): string[] {
  const filePath = path.join(process.cwd(), "src", "data", "villa-piauhy.csv");
  const fileContent = fs.readFileSync(filePath, "utf-8");
  const parsed = Papa.parse<CsvRow>(fileContent, {
    header: true,
    skipEmptyLines: true,
  });

  if (parsed.errors.length > 0) {
    throw new Error(
      `Erro ao interpretar o CSV de formulários: ${parsed.errors[0].message}`,
    );
  }

  return [...new Set(parsed.data.map((row) => row.form_id).filter(Boolean))];
}

export function loadQuestionsFromCSV(formId: string): Question[] {
  const filePath = path.join(process.cwd(), "src", "data", "villa-piauhy.csv");
  const fileContent = fs.readFileSync(filePath, "utf-8");

  const parsed = Papa.parse(fileContent, {
    header: true,
    skipEmptyLines: true,
  });

  if (parsed.errors.length > 0) {
    throw new Error(`Erro ao interpretar o CSV de perguntas: ${parsed.errors[0].message}`);
  }

  const rows = (parsed.data as CsvRow[]).filter(
    (row) => row.form_id === formId,
  );
  const questionMap: { [key: string]: Question } = {};

  rows.forEach((row) => {
    if (!row.question_id) {
      throw new Error(
        `Pergunta sem identificador no Formulário "${formId}".`,
      );
    }

    if (!questionMap[row.question_id]) {
      questionMap[row.question_id] = {
        id: row.question_id,
        title: row.question_title,
        subtitle: row.question_subtitle || undefined,
        type: "choice",
        sectionId: row.section_id,
        sectionTitle: row.section_title,
        options: [],
      };
    }

    if (row.option_id) {
      questionMap[row.question_id].options.push({
        id: row.option_id,
        label: row.option_label,
        imageUrl: row.option_image || undefined,
      });
    }
  });

  return Object.values(questionMap);
}
