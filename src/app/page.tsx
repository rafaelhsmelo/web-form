import { cookies } from "next/headers";
import LoginToken from "@/components/LoginToken";
import QuestionsForm from "@/components/QuestionsForm";
import { findToken, getRegistro } from "@/lib/storage";
import { loadQuestionsFromCSV } from "@/utils/loadQuestions";

export default async function Home() {
  const cookieStore = await cookies();
  const token = cookieStore.get("questionnaireToken")?.value;
  const tokenInfo = token ? await findToken(token) : null;

  if (!token || !tokenInfo) {
    return <LoginToken />;
  }

  const questions = loadQuestionsFromCSV();
  const registration = await getRegistro(token);

  return (
    <QuestionsForm
      questions={questions}
      initialStatus={registration?.status ?? "NAO_INICIADO"}
      initialCurrentStep={registration?.currentStep ?? 0}
      initialAnswers={registration?.answers ?? {}}
    />
  );
}
