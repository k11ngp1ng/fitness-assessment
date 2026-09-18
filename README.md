# Vértice · Performance Lab

Showcase funcional de avaliação física em português, com Next.js App Router, TypeScript, React, Recharts e Lucide. Design próprio em CSS responsivo, controles semânticos reutilizáveis e fontes variáveis locais (Manrope e DM Sans). Não exige backend, conta ou serviço externo.

## Executar

Requer Node.js 22+ e pnpm.

```sh
pnpm install
pnpm dev
```

Abra http://127.0.0.1:3000. Para produção local: `pnpm build` e `pnpm start`.

## Funcionalidades

- Dashboard com métricas do conjunto demonstrativo, avaliações recentes e evolução.
- Cadastro, busca e filtros de clientes; perfil com histórico e gráficos interativos.
- Avaliação guiada: Dados → Dobras → Perimetria → Revisão → Resultado.
- Rascunhos por cliente salvos a cada alteração no navegador, com feedback de indisponibilidade.
- Três leituras por dobra, médias sem arredondamento intermediário, entrada decimal com ponto ou vírgula, avanço com Tab/Enter, alertas de variação e valores incomuns.
- Perímetros opcionais explicitamente identificados, braços relaxados/contraídos separados, comparação bilateral sem diagnóstico.
- Resultados e comparações com a avaliação anterior, inclusive na mesma data.
- Relatório HTML com impressão clara e gráfico vetorial para evitar cortes no redimensionamento.
- Layout desktop, tablet e celular; foco visível, labels, atalho de busca `/` e redução de movimento.
- Estados vazios, carregamento, erro de rota e falha de armazenamento.

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
pnpm test
pnpm build
# Com pnpm dev rodando em outro terminal:
pnpm test:e2e
```

E2E utiliza Microsoft Edge (`channel: msedge`). Em outro ambiente, ajuste `playwright.config.ts` para Chromium e instale-o com `pnpm exec playwright install chromium`.

Testes cobrem cálculos, validação, navegação, cadastro, coleta, persistência, comparações, layout móvel, impressão e auditoria WCAG AA automatizada com axe. Artefatos em `artifacts/`.

## Limites

Dados somente neste navegador (`localStorage`, chave `vertice:v1`), sem autenticação, sincronização, upload de fotos ou backend. Marca e identidade do profissional são demonstrativas. Antes do uso comercial: identidade real, proteção dos dados, consentimento, armazenamento remoto e protocolos adicionais verificados. Não há recomendação de peso ideal ou diagnóstico médico.
