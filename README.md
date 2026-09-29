# Vértice · Performance Lab

Showcase funcional de avaliação física em português, com Next.js App Router, TypeScript, React, Recharts e Lucide. Design próprio em CSS responsivo, controles semânticos reutilizáveis e fontes variáveis locais (Manrope e DM Sans). Não exige backend, conta ou serviço externo.

## Executar

Requer Node.js 22+ e pnpm.

```sh
pnpm install
pnpm dev
```

Abra http://127.0.0.1:3000. O projeto está configurado para exportação estática: `pnpm build` gera `out/`, que deve ser servido por um servidor estático. O script `pnpm start` usa `next start` e não é compatível com esse modo de publicação.

## Desenvolvimento e evolução

As orientações para trabalhar neste repositório estão em [AGENTS.md](AGENTS.md). O [plano de evolução](docs/ROADMAP.md) reúne lacunas observadas, prioridades e critérios de conclusão. Cada item distingue entregas implementadas de propostas pendentes.

O [piloto gratuito proposto](docs/PILOT-INFRA.md) usará Cloudflare Pages Free, Supabase Free e login Google, dentro das cotas dos fornecedores. Ainda não está configurado nem apto a receber dados reais.

**Publicação estática:** perfis, resultados e relatórios usam páginas fixas com o ID na query string, compatíveis com registros criados após o build e com o prefixo do GitHub Pages. As URLs antigas dos exemplos continuam disponíveis. Os registros permanecem apenas no navegador em que foram salvos. Consulte [a verificação da exportação](docs/STATIC-EXPORT.md).

## Funcionalidades

- Dashboard com métricas do conjunto demonstrativo, avaliações recentes e evolução.
- Protótipo interativo em **Treinos**: criar exercícios, montar uma rotina de exemplo com vários exercícios, séries e metas ajustáveis, registrar por cliente ou profissional e comparar com a execução anterior compatível. Os dados desse protótipo existem somente na aba aberta e desaparecem ao recarregar; não há upload, publicação, conta ou uso offline.
- Cadastro, edição, arquivamento e restauração de clientes; busca e filtros; perfil com histórico e gráficos interativos.
- Avaliação guiada: Dados → Dobras → Perimetria → Revisão → Resultado.
- Rascunhos por cliente salvos a cada alteração no navegador, com feedback de indisponibilidade.
- Três leituras por dobra, médias sem arredondamento intermediário, entrada decimal com ponto ou vírgula, avanço com Tab/Enter, alertas de variação e valores incomuns.
- Perímetros opcionais explicitamente identificados, braços relaxados/contraídos separados, comparação bilateral sem diagnóstico.
- Resultados e comparações com a avaliação anterior, inclusive na mesma data.
- Relatório HTML com impressão clara e gráfico vetorial para evitar cortes no redimensionamento.
- Layout desktop, tablet e celular; foco visível, labels, atalho de busca `/` e redução de movimento.
- Estados vazios, carregamento, erro de rota e falha de armazenamento.
- Recuperação de dados locais com bloqueio de sobrescrita, download do original e reinicialização confirmada com cópia preservada. Veja [os detalhes e limites](docs/LOCAL-RECOVERY.md).
- Arquivamento sem exclusão de avaliações, rascunhos ou relatórios. O formato local v1 é migrado para v2 na próxima gravação confirmada; veja [gestão do cadastro](docs/CLIENT-MANAGEMENT.md).

## Dados e cálculo

Nathan Demo reproduz as leituras fornecidas. Soma das médias: **63 mm**; densidade: **1,08101338 g/mL**; gordura: **7,9036755%**; massa magra: **74,8743118 kg**; massa gorda: **6,4256882 kg**. O arredondamento ocorre somente na apresentação.

O histórico anterior e os demais clientes são fictícios. As medidas de braço da imagem (direito 34/37, esquerdo 33/37,5) foram preservadas em nota, sem assumir qual valor era relaxado ou contraído.

Cálculos isolados em `src/lib/calculations`, com fontes documentadas: Jackson & Pollock (1978), sete dobras masculino, 18–61 anos, e Siri (1961). Não há ajustes inventados por etnia ou condicionamento. A ausência de protocolos para outros grupos é indicada no formulário.

Alertas operacionais, não diagnósticos: amplitude das leituras maior que o máximo de 2 mm ou 15% da média; leitura maior que 60 mm; peso fora de 35–250 kg; altura fora de 1,3–2,2 m; perímetros fora de 10–200 cm. São apenas avisos. Dados não numéricos, não positivos, obrigatórios ausentes, protocolo incompatível e resultados matematicamente impossíveis bloqueiam a finalização. Soma fora de 32–272 mm avisa extrapolação da amostra original.

## Arquitetura

`src/app`: rotas. `src/features`: telas por domínio. `src/components`: controles e visualizações. `src/types`: contratos. `src/data`: seeds. `src/lib/store.tsx`: armazenamento, substituível por repositório remoto. Decisões de produto em [docs/PRODUCT.md](docs/PRODUCT.md).

## Verificação

```sh
pnpm typecheck
pnpm lint
pnpm format:check
pnpm test
pnpm test:e2e # com pnpm dev rodando em outro terminal no Windows
pnpm build
pnpm test:export # com node scripts/serve-export.mjs em outro terminal no Windows
```

No Windows local, os E2E exigem os servidores indicados em outro terminal e usam Microsoft Edge. No CI, iniciam os servidores automaticamente e usam Chromium instalado pelo Playwright. O teste de exportação serve `out/` sem fallback de SPA. O workflow valida também uma segunda exportação com o prefixo do GitHub Pages antes de publicar. Veja [a rotina de CI](docs/CI.md) e [a verificação da exportação](docs/STATIC-EXPORT.md).

Testes cobrem cálculos, validação, navegação, cadastro, coleta, persistência, comparações, layout móvel, impressão e auditoria WCAG AA automatizada com axe. Artefatos em `artifacts/`.

## Limites

Dados somente neste navegador (`localStorage`, chave `vertice:v1`), sem autenticação, sincronização, upload de fotos ou backend. Marca e identidade do profissional são demonstrativas. Antes do uso comercial: identidade real, proteção dos dados, consentimento, armazenamento remoto e protocolos adicionais verificados. Não há recomendação de peso ideal ou diagnóstico médico.
