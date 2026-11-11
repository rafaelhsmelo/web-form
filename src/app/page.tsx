import { cookies } from "next/headers";

// Entrada do formulário: identifica a pessoa e carrega as perguntas do CSV.
import LoginUser from "@/components/LoginUser";
import QuestionsForm from "@/components/QuestionsForm";
import { findUser, getRegistro } from "@/lib/storage";
import { loadQuestionsFromCSV } from "@/utils/loadQuestions";

export default async function Home() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;
  const userInfo = userId ? await findUser(userId) : null;

  if (!userId || !userInfo) {
    return <LoginUser />;
  }

  const questions = loadQuestionsFromCSV(userInfo.formId);
  const registration = await getRegistro(userId);

  return (
    <QuestionsForm
      questions={questions}
      initialStatus={registration?.status ?? "VAZIO"}
      initialCurrentStep={registration?.currentStep ?? 0}
      initialAnswers={registration?.answers ?? {}}
    />
  );
}
