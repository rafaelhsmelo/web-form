// Define o formato de cada opção de resposta
export type option = {
    id: string;
    label: string;
    description?: string; // A interrogação é para dizer que é opcional
    imageUrl?: string;
};

// Define o formato de cada tela/pergunta
export type question ={
    id: string;
    title: string;
    subtitle?: string;
    type: "choice";
    options: option[];
};

// Matriz das perguntas e opções (lista do cliente)
// 1. IDENTIFICAÇÃO
export const questions: question[] = [
  {
    id: "unidade",
    title: "Qual é a sua unidade no condomínio?",
    subtitle: "Selecione a casa correspondente à sua propriedade.",
    type: "choice",
    options: [
      { id: "casa_01", label: "Casa 01"},
      { id: "casa_02", label: "Casa 02"},
      { id: "casa_03", label: "Casa 03"},
      { id: "casa_04", label: "Casa 04"},
      { id: "casa_05", label: "Casa 05"},
      { id: "casa_06", label: "Casa 06"},
      { id: "casa_07", label: "Casa 07"},
      { id: "casa_08", label: "Casa 08"},
    ],
  },
  {
    id: "uso_principal",
    title: "Qual será o principal uso da residência?",
    type: "choice",
    options: [
      { id: "moradia_permanente", label: "Moradia permanente", imageUrl: "https://placehold.co/400x300?text=Moradia" },
      { id: "fim_de_semana", label: "Casa de fim de semana", imageUrl: "https://placehold.co/400x300?text=Fim+de+Semana" },
      { id: "ferias", label: "Casa de férias", imageUrl: "https://placehold.co/400x300?text=Ferias" },
      { id: "uso_eventual", label: "Uso eventual pela família", imageUrl: "https://placehold.co/400x300?text=Eventual" },
      { id: "locacao", label: "Uso para locação por temporada", imageUrl: "https://placehold.co/400x300?text=Locacao" },
      { id: "misto", label: "Uso misto: família e locação", imageUrl: "https://placehold.co/400x300?text=Misto" },
    ],
  },
  {
    id: "frequencia",
    title: "Com que frequência você imagina utilizar a casa?",
    type: "choice",
    options: [
      { id: "todos_dias", label: "Todos os dias" },
      { id: "todos_finais_semana", label: "Todos os finais de semana" },
      { id: "duas_tres_mes", label: "Duas ou três vezes por mês" },
      { id: "uma_vez_mes", label: "Uma vez por mês" },
      { id: "apenas_ferias", label: "Apenas em férias e feriados" },
      { id: "esporadicamente", label: "Esporadicamente" },
    ],
  }
];