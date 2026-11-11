# Mapa do sistema

Este documento explica o projeto para quem está começando a programar. A ideia é
servir como um mapa: antes de mudar uma parte, encontre aqui o caminho que os
dados fazem e o arquivo responsável por aquela parte.

## 1. Visão geral

O projeto é um formulário de perguntas de escolha única. Ele possui dois lados:

```text
Pessoa respondente
        |
        v
  / (página do formulário)
        |
        +--> salva respostas e progresso
        +--> finaliza respostas
        +--> encerra a sessão
        |
        v
 Banco Turso (tabelas users e respostas)
        ^
        |
 Administrador
        |
        +--> /admin
        +--> /admin/forms/[formId]
        +--> /admin/forms/[formId]/responses
        +--> /admin/forms/[formId]/users/[userId]
```

O CSV em `src/data/villa-piauhy.csv` é a fonte das perguntas, opções, seções e
identificadores dos formulários. O banco guarda quem deve responder e o que
cada pessoa respondeu.

## 2. Como encontrar um arquivo

```text
src/
├── app/                  Páginas visíveis e rotas de API
│   ├── page.tsx          Entrada da pessoa respondente
│   ├── admin/            Páginas do administrador
│   └── api/              Endpoints chamados pelo navegador
├── components/           Partes visuais reutilizáveis
├── data/                 CSV com perguntas e opções
├── lib/                  Banco, autenticação, tipos e regras centrais
└── utils/                Leitura do CSV, respostas de API e regras visuais
```

### Se você quer mudar...

| O que mudar | Arquivo principal |
|---|---|
| Pergunta, opção ou seção | `src/data/villa-piauhy.csv` |
| Ordem e leitura do CSV | `src/utils/loadQuestions.ts` |
| Tela do formulário | `src/components/QuestionsForm.tsx` |
| Login da pessoa respondente | `src/components/LoginUser.tsx` e `src/app/api/user/route.ts` |
| Salvamento das respostas | `src/components/QuestionsForm.tsx`, `src/app/api/respostas/route.ts` e `src/lib/storage.ts` |
| Envio definitivo | `src/app/api/enviar/route.ts` e `src/lib/storage.ts` |
| Dashboard administrativo | `src/app/admin/page.tsx` |
| Usuários de um formulário | `src/app/admin/forms/[formId]/page.tsx` |
| Tabela geral detalhada | `src/components/CompiledResponsesTable.tsx` |
| Tabela geral compacta | `src/components/CompactResponsesTable.tsx` |
| Abas das tabelas gerais | `src/components/CompiledResponsesTabs.tsx` |
| Respostas de uma pessoa | `src/app/admin/forms/[formId]/users/[userId]/page.tsx` |
| Download CSV | componentes `Admin*Export` e rotas em `src/app/api/admin/**/export` |
| Cores das respostas | `src/utils/responseDisplay.ts` |
| Sessão administrativa | `src/lib/adminAuth.ts` |
| Banco de dados | `src/lib/turso.ts` e `src/lib/storage.ts` |
| Tipos compartilhados | `src/lib/types.ts` |
| Validação de nomes e identificadores | `src/lib/validation.ts` |

## 3. Rotas da aplicação

### Rotas de páginas

```text
/                                      formulário da pessoa respondente
/admin                                 lista de formulários
/admin/forms/[formId]                  lista de usuários daquele formulário
/admin/forms/[formId]/responses        comparação geral das respostas
/admin/forms/[formId]/users/[userId]   respostas de uma pessoa específica
```

`[formId]` e `[userId]` significam partes variáveis da URL. Por exemplo:

```text
/admin/forms/villa-piauhy/users/cliente-01
```

### Rotas de API

```text
/api/user                         cria/encerra a sessão do respondente
/api/respostas                    lê, salva e apaga o rascunho
/api/enviar                       finaliza o formulário
/api/exportar                     exportação usada pelo formulário público
/api/admin/login                  entra no painel administrativo
/api/admin/logout                 encerra a sessão administrativa
/api/admin/export                 baixa respostas finalizadas
/api/admin/forms/[formId]/export  baixa respostas de um formulário
/api/admin/forms/[formId]/users   cria/lista usuários do formulário
/api/admin/forms/[formId]/users/[userId]
                                  edita ou exclui um usuário
/api/admin/forms/[formId]/users/[userId]/export
                                  baixa respostas de uma pessoa
```

As rotas de API não devem ser chamadas diretamente sem conferir a autenticação
e os dados recebidos. As páginas fazem essa proteção com `hasAdminSession` ou
com a sessão do respondente.

## 4. Caminho dos dados

### 4.1 Perguntas

```text
CSV
  |
  v
loadQuestionsFromCSV(formId)
  |
  v
Question[] { id, title, section, options[] }
  |
  +--> QuestionsForm
  +--> tabelas administrativas
  +--> exportações CSV
```

Não coloque perguntas diretamente nos componentes. Se uma pergunta mudar,
altere o CSV e confirme se o `option_id` continua igual. As respostas salvas
usam esse identificador, não o texto visível.

### 4.2 Respostas

```text
usuário escolhe uma opção
        |
        v
QuestionsForm
        |
        v PUT /api/respostas
        |
        v
saveProgress() em storage.ts
        |
        v
respostas { status, currentStep, answers JSON, updatedAt }
```

Quando a pessoa envia:

```text
POST /api/enviar
        |
        v
finalize()
        |
        v
status = FINALIZADO
finalizedAt preenchido
```

O status tem três valores:

- `VAZIO`: não existe linha em `respostas`;
- `RASCUNHO`: existe progresso, mas ainda não foi enviado;
- `FINALIZADO`: envio definitivo.

`VAZIO` é um estado calculado. Ele não deve ser gravado na tabela
`respostas`.

### 4.3 Comparação administrativa

```text
users LEFT JOIN respostas
          |
          v
getCompiledFormResponses(formId)
          |
          v
CompiledResponsesTabs
       /          \
      v            v
 Detalhada     Compacta
```

O `LEFT JOIN` é importante: ele mantém na comparação as pessoas que ainda não
responderam. Por isso usuários sem respostas continuam aparecendo como `VAZIO`.

## 5. Modelo simples do banco

```text
users
├── userId       identificador usado pela pessoa
├── formId       formulário ao qual ela pertence
└── name         nome editável no painel

respostas
├── userId       liga a resposta ao usuário
├── status       RASCUNHO ou FINALIZADO
├── currentStep  última pergunta visitada
├── answers      objeto JSON: { "pergunta": "opção" }
├── updatedAt    última gravação
└── finalizedAt  data do envio definitivo
```

Ao excluir um usuário, suas respostas também precisam ser excluídas. Essa
operação fica na rota administrativa do usuário e deve continuar transacional.

## 6. Autenticação

### Respondente

1. A pessoa informa o `userId`.
2. `/api/user` procura esse identificador em `users`.
3. Se encontrar, grava um cookie `userId`.
4. `getAuthenticatedUserInfo()` lê o cookie e confirma novamente no banco.

### Administrador

1. `ADMIN_KEY` fica no `.env.local`, nunca no Git.
2. `/api/admin/login` valida a chave.
3. `adminAuth.ts` cria um valor de sessão com HMAC.
4. As páginas e rotas administrativas usam `hasAdminSession()`.

Se uma alteração envolver cookies, sessões ou permissões, revise primeiro
`src/lib/auth.ts`, `src/lib/adminAuth.ts` e as rotas de login.

## 7. Organização visual

As telas administrativas seguem a mesma ideia:

```text
cartão branco
├── título e identificadores
├── ações principais: Baixar / Voltar
├── informações complementares
└── tabela ou lista principal
```

Na comparação:

```text
Pergunta + barra percentual | Opções | Usuários/Resposta
```

As cores são escolhidas pela quantidade de respostas: maior quantidade recebe
a primeira cor; empates seguem a ordem das opções no CSV. A lista de cores e
a divisão em duas colunas ficam em `src/utils/responseDisplay.ts`.

## 8. Regras para alterações futuras

1. Leia o tipo em `src/lib/types.ts` antes de mudar dados compartilhados.
2. Se alterar o banco, atualize `storage.ts`, a rota de API e a tela que usa o
   dado.
3. Se alterar uma pergunta, preserve seus identificadores.
4. Não coloque segredo em código, CSV, documentação ou commits.
5. Use os helpers existentes antes de criar outro parser ou outra paleta.
6. Mensagens para a pessoa devem ser claras; erros técnicos devem chegar ao
   tratamento de erro, não virar uma resposta vazia sem explicação.
7. Depois de qualquer mudança, execute:

```text
npm run check
git diff --check
```

## 9. Fluxo recomendado para uma mudança manual

```text
1. Descobrir a tela ou rota envolvida
2. Encontrar o tipo e a função de banco usados
3. Conferir quem chama essa função
4. Fazer a menor alteração completa
5. Conferir estados vazio, rascunho e finalizado
6. Rodar lint/build
7. Testar no navegador quando a mudança for visual
```

Se uma mudança parecer pequena, mas envolver dados, verifique as três camadas:

```text
componente visual <-> rota de API <-> storage/banco
```

