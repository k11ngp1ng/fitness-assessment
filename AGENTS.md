# Guia de desenvolvimento — Vértice · Performance Lab

## Propósito e escopo

Este arquivo orienta o trabalho neste repositório. O Vértice parte de uma aplicação de avaliação física e evolui para a gestão do atendimento de um personal trainer e seus clientes: cadastro, agenda, treinos, avaliações, pacotes, acompanhamento e controle financeiro.

O estado atual é uma demonstração funcional de avaliações com persistência local. O destino é um piloto com dados reais para um personal que atende individualmente de forma presencial e online. A operação completa é a visão do produto, não uma descrição do que já existe. Não apresentar funcionalidades planejadas como disponíveis nem cadastrar dados reais no showcase.

Responder ao usuário em português brasileiro. Usar português na interface e documentação de produto; manter a convenção existente de identificadores em inglês no código. Instruções explícitas do usuário delimitam o escopo da tarefa; o plano de evolução não autoriza implementar tudo de uma vez.

## Direção de produto e limites do piloto

- Primeiro atender **um personal e seus clientes**. Não construir antecipadamente gestão de academias, catracas, aulas coletivas, várias unidades, equipe ou um SaaS para vários profissionais. Registrar necessidades futuras sem complicar o primeiro piloto.
- Cobrir a jornada do personal: entrada e situação do cliente; serviços, pacotes e contratos; agenda de sessões presenciais/online, comparecimento e remarcações; planejamento e registro de treinos; avaliações e evolução; vencimentos e pagamentos informados pelo profissional; relatórios e visão operacional. A experiência do cliente deve permitir consultar apenas seus próprios compromissos, treinos e resultados quando esse acesso for implementado.
- **Cobrança dentro da plataforma não faz parte do piloto inicial.** Controle financeiro manual não equivale a pagamento processado, conciliação bancária, documento fiscal ou confirmação automática. Não exibir nenhum desses estados como concluído sem integração e verificação correspondentes.
- O tracker de treinos é parte central do piloto: Lucas cria exercícios e planos, pode gravar e enviar vídeos demonstrativos reutilizáveis por exercício; Lucas e cliente registram a execução; o cliente vê o último resultado comparável enquanto anota as cargas. O registro deve funcionar offline após preparação do treino no dispositivo. Requisitos e aceite em `docs/TRACKER-TREINOS.md`.
- Desenvolver o construtor de treinos sem depender de fichas, vídeos ou dados fornecidos antecipadamente por Lucas. A conta profissional começa vazia, com criação autônoma de exercícios, rotinas e vídeos opcionais; exemplos permanecem apenas em demonstração e testes. Não fixar “Lucas”, exercícios ou prescrições no código de produto.
- Implementar opções iniciais explícitas e ajustáveis usando cenários fictícios; não supor que exemplos representam a rotina de Lucas. Validar com ele antes do piloto real o fluxo, termos, política de cancelamento, reposição e validade de pacotes, formatos de treino, canais de atendimento e o mínimo de dados necessário. Regras ainda não validadas não devem ficar rígidas no código.
- Organizar entregas em fatias completas e demonstráveis, cada uma com regra de negócio, autorização, persistência, estados de erro, acessibilidade e teste. Priorizar a segurança do piloto com dados reais antes de ampliar telas. O detalhamento e o estado de cada frente ficam em `docs/ROADMAP.md`.
- O piloto deve começar sem custo de hospedagem, serviço ou domínio: exportação estática em Cloudflare Pages Free (`*.pages.dev`), Supabase Free para contas/dados/mídia e login Google para Lucas e clientes. Esta é uma proposta técnica ainda não configurada; cotas, pausa por inatividade e ausência de backup automático exigem limites, recuperação testada e aceite antes de dados reais. Detalhes e gatilhos de upgrade em `docs/PILOT-INFRA.md`. Não contratar planos pagos nem domínio por inferência.

## Antes de alterar

1. Ler `README.md`, `docs/PRODUCT.md` e os arquivos envolvidos na tarefa.
2. Consultar `docs/ROADMAP.md` para prioridades, decisões ainda abertas e lacunas conhecidas. `docs/VERIFICATION.md` registra uma execução histórica, não comprova o estado da revisão atual.
3. Inspecionar `git status` e preservar alterações preexistentes. Evitar reformatações, atualizações de dependências e refatorações alheias ao objetivo.
4. Antes de escrever código Next.js, ler os guias pertinentes em `node_modules/next/dist/docs/`. Se ausentes, instalar as dependências pelo lockfile ou consultar a documentação oficial da versão utilizada; não presumir APIs de outra versão.
5. Definir o comportamento esperado, os casos de erro e a forma de verificar a mudança. Avançar autonomamente nas decisões reversíveis dentro do escopo; perguntar apenas quando faltar uma decisão que altere materialmente o resultado.

## Estado técnico e mapa do projeto

- Next.js App Router, React, TypeScript, pnpm, CSS próprio, Recharts e Lucide. Conferir versões em `package.json` e `pnpm-lock.yaml`.
- `src/app/`: rotas, layouts e estados de carregamento, erro e página ausente. Manter páginas pequenas, delegando a interface às features.
- `src/features/`: fluxos de clientes, avaliações, medidas, dashboard e evolução.
- `src/components/`: controles compartilhados, navegação, mapa corporal e gráficos.
- `src/types/`: contratos de domínio; `src/data/seed.ts`: dados demonstrativos e criação de rascunhos.
- `src/lib/calculations/`: fórmulas e comparações; `src/lib/validation/`: parsing, impedimentos e avisos; `src/lib/format.ts`: unidades, rótulos, números e datas.
- `src/lib/store.tsx`: Context/Provider; `src/lib/storage.ts`: repositório e validação local. A chave é `vertice:v1` e o formato atual é v2. Ainda não há repositório remoto.
- `src/lib/workouts/domain.ts` e `src/lib/workouts/plans.ts`: contratos, montagem de prévia e regras puras do primeiro recorte de treinos. `/treinos` é um protótipo com dados fictícios mantidos apenas na aba; criação, execução e comparação não sobrevivem ao recarregamento. Proposta para o piloto real em `docs/PILOT-INFRA.md`.
- `tests/calculations.test.ts`: testes de lógica; `tests/e2e/`: fluxos de navegador, persistência e acessibilidade.
- `next.config.ts` e `.github/workflows/pages.yml`: exportação estática em `out/` e publicação no GitHub Pages, com `basePath` no CI. Páginas fixas com ID na query string atendem novos registros no mesmo navegador.
- Não existem backend, autenticação, autorização entre personal e cliente, sincronização, agenda, tracker persistente, upload de vídeos, pacotes ou financeiro implementados. O protótipo de `/treinos` não equivale ao tracker do piloto.

## Arquitetura e manutenção

- Manter cálculos puros, determinísticos e independentes de React, DOM e armazenamento. Não duplicar fórmulas em telas ou relatórios.
- Centralizar validações e formatação; reaproveitar componentes antes de criar variações.
- Tratar dados externos e persistidos como `unknown` até validação de estrutura e regras. Uma asserção TypeScript não valida dados em execução.
- Evitar `any`, supressões de erros e desativação de regras para contornar problemas. Justificar exceções específicas no código.
- Usar `use client` nas fronteiras que precisam de interação. Acessar APIs do navegador em efeitos ou eventos compatíveis com a pré-renderização.
- Não adicionar bibliotecas, camadas ou serviços sem benefício concreto para a tarefa. Manter `pnpm-lock.yaml` coerente ao alterar dependências.
- Separar persistência e domínio do Provider quando a tarefa exigir migração, testes independentes ou backend; não executar uma reescrita preventiva.
- Registrar decisões arquiteturais relevantes e seus limites em `docs/PRODUCT.md` ou documento específico referenciado por ele.
- Ao ampliar o produto, explicitar entidades e vínculos antes da interface: cliente, serviço/pacote, sessão, treino, avaliação e lançamento financeiro não devem compartilhar estados ou significados ambíguos. Manter regras de domínio testáveis fora de componentes React.

## Porta de entrada para dados reais

- O GitHub Pages e o `localStorage` atuais servem ao showcase, não ao piloto com contas e dados reais. A proposta para o piloto mantém frontend estático e usa a API remota gerenciada do Supabase. Antes do primeiro dado real, verificar essa hospedagem, persistência remota, login Google, autorização por recurso, segregação de acesso entre personal e cliente, transporte seguro, backup e restauração, observabilidade sem dados pessoais e procedimento de incidente.
- Fazer migração explícita dos dados demonstrativos e locais; nenhum seed deve aparecer como cliente real. Não prometer sincronização, retenção, recuperação ou disponibilidade sem testes correspondentes.
- Documentar finalidade e necessidade de cada dado, responsáveis pelo tratamento, hipótese legal aplicável, acesso, retenção, exportação, correção e exclusão. Submeter as decisões legais e profissionais pertinentes à revisão especializada antes do uso real. Um checkbox isolado não comprova conformidade.
- Avaliações e outros dados ligados à saúde exigem cuidado reforçado. Aplicar privilégio mínimo, validação no servidor, auditoria de alterações relevantes e proteção contra acesso por troca de ID/URL. Não copiar dados sensíveis para logs, métricas, capturas ou ambientes de teste.
- A passagem para o piloto só ocorre após critérios de aceitação exercitados com o cliente e evidência de segurança, integridade, backup/restauração e publicação. Registrar riscos residuais e responsáveis por resolvê-los.

## Integridade das avaliações

- Preservar as três leituras de cada uma das sete dobras, em milímetros. Calcular médias apenas quando todas as leituras obrigatórias forem válidas.
- Não arredondar valores intermediários. Arredondar apenas na apresentação; testar resultados numéricos com tolerância explícita.
- Preservar o snapshot de idade, sexo, peso, altura e condicionamento da avaliação. Editar o cadastro não deve reescrever avaliações anteriores.
- Distinguir campo ausente (`null`), valor inválido e zero. Perímetros opcionais ausentes continuam ausentes no armazenamento, nos gráficos e no relatório.
- Aceitar vírgula e ponto decimal sem converter texto inválido silenciosamente para zero ou vazio. Exibir unidades: dobras em mm, perímetros em cm, altura em m e massas em kg.
- Separar avisos operacionais de erros impeditivos. Não transformar limites de aviso em exclusões sem justificativa documentada.
- Comparar somente avaliações compatíveis do mesmo cliente. Manter sinal e unidade das diferenças; variação de percentual de gordura é expressa em pontos percentuais.
- Garantir ordenação determinística para avaliações na mesma data. Hoje o desempate depende da ordem de registro no array; preservar esse comportamento até uma migração explícita para timestamps/ordem persistida.
- Não inferir medidas ausentes ou resolver ambiguidades históricas por suposição. Preservar a nota original das medidas de braço de Nathan Demo.

## Método e conteúdo profissional

- O protocolo implementado é `jp7-male`: Jackson & Pollock, sete dobras masculino, com conversão de Siri. Respeitar as restrições e referências existentes em `src/lib/calculations/index.ts` e `docs/PRODUCT.md`.
- Não alterar coeficientes, população atendida, pontos de coleta ou classificações por memória. Para mudanças científicas, consultar fontes primárias e registrar equação, unidades, população, limites, referência e casos numéricos independentes.
- Novos protocolos devem ter identificação própria e testes de elegibilidade, limites e resultados antes de serem habilitados. Não reaplicar um protocolo fora do grupo atendido como solução provisória.
- Não introduzir ajustes inventados por etnia ou condicionamento, diagnóstico, prescrição automática ou promessa de precisão clínica.
- Descrever composição corporal como estimativa. Evitar classificar aumento ou redução como bom ou ruim sem contexto profissional e método explicitado.
- Usar texto direto, respeitoso e útil: o que foi medido, o que significa, quais as limitações e como corrigir um erro de preenchimento. Não prometer sincronização ou salvamento que não ocorreram.
- Relatórios devem manter identificação, data, método, unidades, medidas ausentes, observações e distinção entre dados demonstrativos e registros locais. Não inventar identidade ou registro profissional.

## Operação do personal

- Separar cliente, serviço contratado, pacote de sessões, agendamento, comparecimento, treino realizado, avaliação e lançamento financeiro. Uma sessão marcada não é sessão realizada; um vencimento não é pagamento recebido; um treino prescrito não é treino executado.
- Definir duração, fuso horário, recorrência, capacidade, conflitos, cancelamento e reposição de sessões a partir da rotina validada com o cliente. Testar horários limítrofes, remarcações simultâneas e diferenças entre atendimento presencial e online.
- Pacotes e saldos devem ser derivados de eventos rastreáveis, com correção explícita e motivo. Evitar exclusões silenciosas, contagens negativas, duplicação por nova tentativa e atualização parcial entre sessão, saldo e financeiro.
- Lançamentos financeiros manuais devem distinguir previsto, vencido, informado como pago, estornado/corrigido e cancelado conforme regras aprovadas. Exibir autoria e data da confirmação; não inferir recebimento apenas pela passagem do tempo.
- Planos de treino precisam de versão, autoria, período de vigência e histórico. Alterar o plano atual não deve reescrever o que foi prescrito ou executado anteriormente. Conteúdo técnico é responsabilidade do profissional; não gerar prescrição automática ou diagnóstico.
- O cliente pode consultar e registrar apenas o que o profissional autorizou no próprio espaço. Toda leitura e escrita deve verificar permissão no servidor, inclusive downloads e links diretos.

## Tracker de treinos, mídia e uso offline

- Usar o Hevy como referência **funcional** para rotina atribuída, registro série a série, vídeo no exercício e valores anteriores visíveis durante a execução. Criar interface, identidade, textos, biblioteca, mídia e código próprios; não copiar telas nem ativos de terceiros. Consultar `docs/TRACKER-TREINOS.md` antes de alterar esse fluxo.
- Separar exercício reutilizável, versão de vídeo, rotina modelo, plano publicado, sessão executada e série realizada. Prescrição e execução têm dados distintos; edições do plano ou troca de vídeo não reescrevem sessões antigas.
- Associar vídeo demonstrativo gravado por Lucas ao exercício, não ao cadastro do cliente. Upload requer autorização, validação no servidor, armazenamento privado, progresso/falha de envio e reprodução adequada em celular, tablet e desktop. Instruções em texto permanecem disponíveis se o vídeo faltar.
- Permitir que o profissional crie e organize a própria biblioteca, salve rascunhos, visualize o plano como cliente e publique versões. Exibir ações úteis em uma conta vazia; não exigir vídeo para cadastrar exercício nem publicar um treino descrito em texto.
- No registro, distinguir carga em kg, repetições, duração e campos ausentes conforme o tipo de exercício. Mostrar o último resultado **do mesmo cliente e exercício/variação compatível**, com data e unidade; não comparar com outro cliente, equipamento ou modalidade nem sugerir progressão automática.
- Lucas e cliente podem registrar séries. Guardar autoria e revisão; operações repetidas ou concorrentes não podem duplicar séries ou sobrescrever silenciosamente alterações de outro dispositivo.
- Preparar o treino para uso offline. Diferenciar gravação neste dispositivo de confirmação no servidor, sincronizar de forma idempotente e oferecer resolução de conflitos. O cliente pode escolher baixar vídeos do plano para uso offline; confirmar disponibilidade e informar quando faltar espaço ou arquivo. Não prometer acesso offline a conteúdo não baixado.
- A liberação com dados reais exige testar perda de rede, recarga, reconexão, múltiplas abas/dispositivos, expiração de acesso, saída da conta, falta de espaço e falhas de vídeo, além das regras gerais de privacidade e recuperação.

## Persistência e privacidade

- Nunca apagar ou sobrescrever silenciosamente dados que falharam na leitura. Qualquer recuperação deve preservar o conteúdo original e permitir uma decisão explícita de restauração ou reinicialização.
- Não declarar sucesso durável se a escrita falhou. Distinguir dados em memória, rascunho persistido e avaliação finalizada.
- Alterar o formato persistido exige estratégia de versão, migração, validação e recuperação. Uma mudança no nome da chave não é, por si só, uma migração.
- Validar relações cliente/avaliação, IDs duplicados, enums, datas reais e números finitos. Rascunhos incompletos precisam continuar editáveis, sem enfraquecer a validação da finalização.
- Considerar atualização concorrente e múltiplas abas ao modificar o armazenamento. Não substituir o conjunto inteiro por um snapshot antigo sem tratar conflito.
- Usar somente dados fictícios em seeds, testes, capturas e exemplos. Não incluir dados pessoais reais, segredos ou tokens em commits, logs ou artefatos.
- Não tratar `localStorage` como controle de acesso ou backup. Para uso com dados reais, implementar e verificar a arquitetura de proteção e acesso definida para o produto.
- Recursos de coleta adicional, telemetria, fotos e compartilhamento devem ter finalidade e acesso definidos; não coletar informações apenas por conveniência técnica.

## Interface, acessibilidade e impressão

- Preservar a identidade visual existente: grafite, marfim e lima, fontes locais Manrope/DM Sans, números tabulares e hierarquia clara. Usar os tokens de `src/app/globals.css` como fonte dos valores atuais.
- Priorizar legibilidade e velocidade de coleta. Não adicionar decoração que concorra com campos, unidades e alertas.
- Cobrir estados inicial, vazio, carregando, erro, sucesso, armazenamento indisponível e recurso não suportado, quando pertinentes ao fluxo.
- Usar HTML semântico, labels associados, nomes acessíveis, foco visível, navegação por teclado e mensagens de erro acionáveis. Não transmitir significado apenas por cor.
- Preservar Tab/Enter na coleta e o retorno de foco em diálogos. Respeitar redução de movimento, inclusive em animações acionadas por JavaScript.
- Verificar celular, tablet e desktop, texto ampliado e ausência de cortes/rolagem horizontal indevida. Gráficos precisam de contexto textual e indicação de dados ausentes.
- Para o tracker, verificar celular durante o treino, iPad/tablet em retrato e paisagem e computador para montagem/revisão. Entrada de séries, vídeo, valor anterior, teclado virtual e estado de sincronização devem permanecer legíveis e operáveis por toque e teclado.
- Mudanças em relatórios exigem conferir impressão A4: fundo claro, quebras, tabelas, observações longas e gráficos completos. Não considerar apenas a tela do navegador.
- Auditoria axe complementa inspeção visual e teclado; não equivale a certificação integral de acessibilidade.

## Publicação: restrição crítica

A configuração atual usa `output: "export"`. Os novos registros abrem pelas páginas fixas `/clientes/perfil/`, `/avaliacoes/resultado/` e `/relatorios/visualizar/`, com ID na query string; rotas `[id]` antigas continuam restritas aos seeds exportados. Essa solução preserva o showcase. No piloto gratuito, a exportação pode continuar como frontend, enquanto contas, dados e acesso ficam no Supabase com RLS e armazenamento privado; nada disso está implementado hoje.

- Ao alterar cadastro, finalização ou navegação, verificar a abertura direta e o recarregamento de registros novos no site exportado, inclusive com `basePath`.
- Não tratar sucesso em `next dev` ou build concluído como prova de funcionamento no GitHub Pages.
- Resolver novas rotas com uma estratégia compatível com hospedagem estática. Para o piloto, testar o `out/` no Cloudflare Pages e integrar a API gerenciada do Supabase sem adicionar rotas Next.js de servidor. Se uma função de servidor se tornar necessária, documentar sua hospedagem e seus limites gratuitos antes de implementá-la. Não pressupor fallback de SPA.
- Não adicionar Server Actions, APIs dinâmicas ou autenticação dependente de servidor sem adaptar a arquitetura de publicação.
- `pnpm start` executa `next start`, que não serve esta exportação estática. A verificação de produção deve servir `out/` por um servidor estático compatível.

## Validação e conclusão das tarefas

Comandos existentes, executados na raiz:

```sh
pnpm install --frozen-lockfile
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
# No Windows, iniciar pnpm dev em outro terminal:
pnpm test:e2e
pnpm build
# No Windows, iniciar node scripts/serve-export.mjs em outro terminal:
pnpm test:export
```

- Usar a versão de Node compatível com o projeto; o workflow atual utiliza Node 24 e pnpm 10.
- Mudanças de código: executar typecheck, testes de lógica e build. Executar os E2E pertinentes quando afetar interface, navegação, persistência ou fluxo completo.
- No Windows, os E2E usam Edge (`msedge`) e exigem servidores iniciados manualmente em `127.0.0.1:3000` ou `:3100`, conforme a suíte. No CI Linux, Playwright instala Chromium e inicia os servidores automaticamente.
- Mudanças em cálculo ou persistência exigem testes de regressão significativos: referência numérica, entradas inválidas, elegibilidade, recuperação ou falha de gravação conforme a alteração.
- Mudanças em agenda, pacotes, treinos, autorização ou financeiro exigem testes de regras e de acesso: conflitos, duplicação de operações, correções, falhas de escrita e tentativas de acessar recursos de outro cliente.
- Mudanças no tracker ou upload exigem teste com vídeo válido/inválido, mídia indisponível, primeiro treino sem histórico, comparação correta por cliente/exercício, preparação offline, perda de rede, sincronização idempotente e conflito entre editores. Verificar os navegadores e tamanhos de tela do piloto sem declarar suporte não exercitado.
- Mudanças visuais exigem inspeção nos tamanhos relevantes; alterações de publicação exigem testar o artefato exportado. Não gerar testes que apenas reproduzem a implementação.
- Para alterações exclusivamente documentais, conferir caminhos, comandos, links locais e coerência com o código; não executar toda a suíte sem necessidade.
- Lint e formatação são controles explícitos. Não relatá-los como aprovados sem executar os scripts nesta revisão.
- Concluir relatando resultado, arquivos relevantes, verificações executadas e limitações restantes. Distinguir revisão de código, teste executado e hipótese não reproduzida.
- Atualizar documentação quando comportamento, arquitetura, método ou instalação mudar. Não transformar evidência histórica em uma verificação atual sem nova execução.

## Bloco gerenciado pelo Next.js

Preservar integralmente o bloco abaixo; as regras específicas do projeto ficam fora dele.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
