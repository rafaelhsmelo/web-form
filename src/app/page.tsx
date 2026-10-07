import { loadQuestionsFromCSV } from "@/utils/loadQuestions";
import QuestionsForm from "@/components/QuestionsForm";

export default function Home() {
  // Lê as perguntas diretamente do arquivo CSV no servidor
  const questions = loadQuestionsFromCSV();

  // Renderiza o componente de cliente passando as perguntas por propriedade
  return <QuestionsForm questions={questions} />;
}
