# FotoCaloria

PWA instalável para fotografar uma refeição e receber uma **estimativa transparente** de
calorias e macronutrientes. Feito para ser simples e acessível, inclusive para quem tem pouca
familiaridade com tecnologia.

> As estimativas são aproximadas e **não substituem avaliação nutricional profissional**.

---

## O que o app faz

- **Tirar foto** ("Fotografar minha comida") ou **escolher da galeria**.
- Pré-visualização da imagem antes de enviar.
- **Análise por IA** de um provedor multimodal configurável (padrão: Google Gemini).
- Tela de resultado com alimentos, quantidade estimada (g), preparo provável, calorias e
  macronutrientes, além de **incertezas** e do que **não é possível determinar pela foto**.
- **Edição** de cada alimento e da porção (gramas).
- **Histórico local** de refeições e **total diário**.
- Sem pagamentos, sem contas de usuário, sem recursos premium neste MVP.

### Modo demonstração

Sem chave de API o app entra em **modo demonstração**: os resultados são **fictícios**, claramente
rotulados como demonstração na interface, e **não** há análise real da foto. O app nunca finge que
uma análise real aconteceu.

---

## Stack

- **Next.js (App Router)** + **TypeScript**
- **Tailwind CSS**
- **Zod** para validação de todas as entradas e dados persistidos
- **Vitest** para testes de cálculos e validações
- **PWA**: manifesto, ícones e service worker
- Armazenamento local (localStorage) no MVP

---

## Requisitos

- Node.js 20+ (testado com Node 24)
- npm

---

## Instalação e execução

```bash
npm install
cp .env.example .env.local   # no Windows: copy .env.example .env.local
npm run dev                  # http://localhost:3000
```

### Scripts

| Comando             | Descrição                                         |
| ------------------- | ------------------------------------------------- |
| `npm run dev`       | Ambiente de desenvolvimento                       |
| `npm run build`     | Build de produção                                 |
| `npm run start`     | Servidor de produção (após `build`)               |
| `npm test`          | Testes de cálculos e validações (Vitest)          |
| `npm run typecheck` | Verificação de tipos (`tsc --noEmit`)             |
| `npm run lint`      | Lint (ESLint/Next)                                |
| `npm run icons`     | Regenera os ícones do PWA (sem dependências)      |

---

## Configuração da IA

Tudo é configurado por **variáveis de ambiente do servidor** (arquivo `.env.local`). A chave
**nunca** vai para o cliente.

```
AI_PROVIDER=gemini        # gemini | openai | demo
AI_MODEL=                 # opcional; padrão gemini-3.5-flash (ou gpt-4o-mini)
GEMINI_API_KEY=           # chave do Google AI Studio
GOOGLE_API_KEY=           # alternativa aceita
OPENAI_API_KEY=           # opcional (AI_PROVIDER=openai)
OPENAI_BASE_URL=          # opcional, para provedores compatíveis com OpenAI
ANALYZE_RATE_LIMIT=       # análises por IP na janela (padrão 10)
ANALYZE_RATE_WINDOW_SECONDS= # tamanho da janela em segundos (padrão 60)
```

Regras de seleção do provedor (`src/lib/ai/index.ts`):

- `AI_PROVIDER=gemini` e há chave → usa Gemini.
- `AI_PROVIDER=openai` e há chave → usa OpenAI.
- `AI_PROVIDER=demo` → demonstração.
- Sem definir → usa um provedor real se houver chave; senão, demonstração.
- Provedor pedido **sem** chave → demonstração (com aviso), nunca sucesso falso.

Para a análise real funcionar, a foto é enviada ao provedor escolhido **somente após** o usuário
tocar em "Analisar foto".

---

## Dados nutricionais

Os cálculos usam uma base **embutida** de valores de referência por 100 g:

- **Origem:** Tabela Brasileira de Composição de Alimentos (**TACO**), 4ª edição
  (NEPA/UNICAMP, 2011).
- A TACO **não** oferece API pública gratuita, por isso os valores foram embutidos como um
  subconjunto estático (`src/lib/nutrition/taco.data.ts`), sem dependência de serviços externos.
- A base é **intencionalmente curta**: alimentos fora dela são sinalizados como
  **"sem correspondência confiável"** em vez de receberem um valor inventado.
- Os valores são de **referência** (alimento genérico por 100 g); o resultado da tela é uma
  **estimativa** para a porção informada.
- O cálculo é proporcional à quantidade (`src/lib/nutrition/calculate.ts`).

---

## Privacidade, segurança e custos

- **Segredos só no servidor** (variáveis de ambiente). Nada de chave no código cliente.
- **Entrada validada**: tipo MIME declarado, tamanho (limite de 6 MB) e *magic bytes* reais
  (`src/lib/security/validateImage.ts`); corpo da requisição limitado a 9 MB.
- **Limite de requisições** por IP (`src/lib/security/rateLimit.ts`), com `429` e `Retry-After`.
  Observação: o limitador é em memória; em ambiente serverless multi-instância ele não é
  compartilhado (para produção, use um store distribuído).
- **Sem logs de imagem ou dados pessoais.** Em caso de erro, registra-se apenas uma mensagem
  genérica.
- **Imagens não são armazenadas** por padrão: o histórico guarda só os itens e totais (JSON).
- **Sem envio a serviços externos** antes da ação explícita do usuário.

---

## Acessibilidade

- Idioma `pt-BR`, tipografia legível e bom contraste (verde-escuro sobre fundo claro).
- Botões grandes com rótulos explícitos; ações **não** dependem só de cor ou ícone.
- Foco sempre visível (`:focus-visible`) e navegação por teclado, com link "Pular para o
  conteúdo".
- Regiões `aria-live` para status e alertas; rótulos `<label>` associados aos campos.

---

## PWA e instalação

- Manifesto em `public/manifest.webmanifest`, ícones (incluindo *maskable*) em `public/icons/`.
- Service worker `public/sw.js` faz cache do app shell e de assets estáticos.
- **Importante:** a análise de foto **depende de rede** (API remota). O app funciona offline para
  abrir o histórico local, mas **a análise de fotos não funciona offline**.
- Instalação: no celular, abra o site e use "Adicionar à tela inicial" (Android/Chrome) ou
  "Compartilhar → Adicionar à Tela de Início" (iOS/Safari).

---

## Estrutura

```
src/
  app/
    layout.tsx              # metadados, PWA, navegação acessível
    page.tsx                # fluxo: captura → prévia → análise → resultado
    globals.css             # Tailwind + estilos base acessíveis
    history/page.tsx        # histórico e total diário
    api/analyze/route.ts    # rota protegida de análise (server)
  components/               # PhotoCapture, AnalysisStatus, ResultEditor, HistoryView, ...
  lib/
    ai/                     # provider, gemini, openai, demo, schema (Zod)
    nutrition/              # taco.data, match, calculate, schema
    meal/build.ts           # análise → itens editáveis → refeição
    storage/                # histórico local validado (Zod)
    security/               # validateImage, rateLimit
```

---

## Testes

```bash
npm test
```

Cobrem: cálculo proporcional de nutrientes e somas (sem contagem dupla), casamento de alimentos,
validação do esquema da IA e extração de JSON, validação de imagem (magic bytes), e o ciclo do
histórico local (salvar/ler/remover, dados corrompidos, total diário).

---

## Deploy

O projeto é um app Next.js padrão. Na **Vercel**:

1. Importe o repositório.
2. Configure as variáveis de ambiente (`AI_PROVIDER`, `GEMINI_API_KEY`, etc.).
3. Deploy. Não é necessário passo de build especial.

Alternativa: qualquer host que rode `npm run build` + `npm run start`.

---

## Limitações conhecidas

- Base nutricional embutida e curta (subconjunto TACO) — itens fora dela não são calculados.
- A quantidade estimada pela IA é aproximada; corrija as gramas quando possível.
- O rate limit em memória não é compartilhado entre instâncias serverless.
- O histórico é local ao dispositivo e pode não sincronizar entre aparelhos.
- A análise de fotos exige conexão e uma chave de IA configurada.
