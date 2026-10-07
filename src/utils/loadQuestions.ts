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
  section_id: string;
  section_title: string;
  question_id: string;
  question_title: string;
  question_subtitle?: string;
  option_id: string;
  option_label: string;
  option_image?: string;
}

// Função Parse e agrupamento
export function loadQuestionsFromCSV(): Question[] {
  const filePath = path.join(process.cwd(), "src", "data", "questions.csv");
  const fileContent = fs.readFileSync(filePath, "utf-8");

  const parsed = Papa.parse(fileContent, {
    header: true,
    skipEmptyLines: true,
  });

  const rows = parsed.data as CsvRow[];
  const questionMap: { [key: string]: Question } = {};

  rows.forEach((row) => {
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
