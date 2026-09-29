# Vértice — arquitetura do showcase

Este documento descreve a aplicação implementada. A direção definida para o primeiro piloto é uma plataforma de operação de um personal trainer com atendimento individual presencial e online, incluindo agenda, treinos, pacotes, acompanhamento e financeiro manual. O primeiro recorte do tracker está em `/treinos`: biblioteca criada na aba, rotina de exemplo com múltiplos exercícios, séries e metas ajustáveis para cliente fictício, registro e comparação com a execução anterior compatível na mesma aba. Não há persistência nem acesso do cliente. Vídeos, registro offline e operação real continuam planejados; consulte [TRACKER-TREINOS.md](TRACKER-TREINOS.md) e a [proposta de infraestrutura gratuita](PILOT-INFRA.md). O piloto pretende usar dados reais, mas só após implantação e verificação do frontend estático no Cloudflare Pages Free com login Google, dados no Supabase Free, autorização, backup e recuperação. Escopo, hipóteses e critérios de passagem estão em [ROADMAP.md](ROADMAP.md); os demais recursos abaixo continuam sendo os do showcase atual.

## Produto e navegação

Aplicação local, em português, para avaliação física: Dashboard → Clientes → Perfil → Nova avaliação (Dados, Dobras, Perimetria, Revisão) → Resultado. Evolução e Relatórios são acessíveis na navegação principal. Rotas reais do Next.js; estados de carregamento, erro e ausência de dados.

## Sistema visual

Grafite #101211, superfícies #191c19, texto marfim #f3f4ee, acento lima #d2f56a. Tipografia sans com números tabulares, bordas discretas e cantos moderados. Navegação lateral fixa no desktop e compacta no celular. Dados de entrada em controles grandes; resultados em métricas editoriais e gráficos mínimos. Animações respeitam redução de movimento.

## Modelo

Client contém dados cadastrais e data opcional de arquivamento; Assessment preserva um snapshot de idade, sexo, peso e altura na data; SkinfoldMeasurement contém três leituras por sítio; CircumferenceMeasurement contém campos independentes para cada braço/estado; BodyCompositionResult contém estimativas derivadas. O registro de protocolos desacopla cálculos da UI. Comparações usam avaliações anteriores do mesmo cliente e diferenças neutras, sem diagnóstico. Edição do cadastro não altera snapshots anteriores; arquivamento conserva histórico e rascunhos e impede novas avaliações até a restauração.

## Persistência e limites

Repositório local extraído em `src/lib/storage.ts`, com validação de contratos na leitura, bloqueio de gravações durante recuperação, cópia do original antes de reinicialização confirmada e rascunhos por cliente. A chave `vertice:v1` permanece; o formato atual é v2 e documentos v1 são migrados em memória antes da próxima gravação confirmada. Fluxo, validação e limites de concorrência em [LOCAL-RECOVERY.md](LOCAL-RECOVERY.md); ciclo de vida do cadastro em [CLIENT-MANAGEMENT.md](CLIENT-MANAGEMENT.md). Dados fictícios identificados no produto. Sem autenticação, sincronização ou backend. Não inserir dados sensíveis reais neste protótipo compartilhado. Datas dos dados demonstrativos são ilustrativas, ancoradas em 18/09/2026.

No cadastro, uma falha de escrita mantém o formulário aberto e informa que os dados estão apenas na sessão. A tentativa seguinte reutiliza o identificador do cliente e atualiza o registro em memória; somente uma escrita confirmada fecha o formulário.

## Referências e decisões

Nathan Demo: 20 anos, 1,82 m e 81,3 kg. Sete médias somam 63 mm. Braços da imagem: direito 34/37 e esquerdo 33/37,5, descritos como “contraído/relaxado”; a semântica é ambígua. Os valores originais são preservados em nota e nenhum estado é atribuído. Campos ausentes aparecem como “Não registrado”. Medidas de braço são opcionais, a ausência é explícita na revisão e no relatório.

Jackson & Pollock (1978), sete dobras masculino, 18–61 anos, com conversão Siri (1961). Etnia e condicionamento não são coeficientes dessa equação; condicionamento é descritivo. Outros sexos e idades podem ser cadastrados, mas não recebem esta estimativa. Histórico anterior é sintético, calculado pelo mesmo protocolo, não copiado da foto. Não há peso ideal ou objetivo de emagrecimento inferido.

Fontes: https://pubmed.ncbi.nlm.nih.gov/718832/ ; artigo original republicado: https://www.kinantropo.org/_files/ugd/af7497_d8d71d5067184e93a90ae954a74c5c18.pdf (tabela 4, coeficientes; tabela 1, Siri). Validação adicional dos coeficientes: https://pmc.ncbi.nlm.nih.gov/articles/PMC4691302/ (tabela 1).

## Organização

src/app: rotas. src/components: controles, gráficos e layout. src/features: telas por domínio. src/types: contratos. src/data: seeds. src/lib/calculations: fórmulas e comparação. src/lib/validation: validação e alertas. src/lib/store: repositório local e provider.

## Futuro

TODO: validar novos protocolos antes de habilitá-los; adicionar repositório remoto e autenticação, definir finalidades e hipótese legal aplicável com revisão especializada antes do uso em produção. Nenhuma correção por etnia ou condicionamento é inventada.

## Rotas na hospedagem estática

Perfis usam `/clientes/perfil/?id=...`, resultados `/avaliacoes/resultado/?id=...` e relatórios `/relatorios/visualizar/?id=...`. O ID é codificado por `src/lib/routes.ts` e consultado no cliente após a leitura do armazenamento. As páginas usam Suspense para a query string; IDs ausentes, repetidos e inexistentes exibem estados explícitos. Os links recebem o basePath pelo Next.js. Rotas antigas dos seeds são preservadas por compatibilidade; não se depende de fallback de SPA. Abrir a URL em outro navegador não transfere os dados locais.

O build inclui uma correção dos nomes de arquivos RSC exportados pelo Next 16.3.5 no Windows; não altera o conteúdo desses arquivos nem o pacote Next. Procedimento e verificação em [STATIC-EXPORT.md](STATIC-EXPORT.md).

## Verificação antes da publicação

O workflow executa formatação, lint, typecheck, testes de lógica e navegador, além de testar o artefato exportado sem prefixo e com o prefixo do GitHub Pages. O deploy depende do sucesso dessas etapas e não ocorre em pull requests. O `basePath` é definido explicitamente por `EXPORT_BASE_PATH` apenas no build correspondente; o servidor de desenvolvimento dos E2E não recebe o prefixo. Detalhes em [CI.md](CI.md).
