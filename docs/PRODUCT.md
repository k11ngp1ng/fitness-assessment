# Vértice — arquitetura do showcase

## Produto e navegação

Aplicação local, em português, para avaliação física: Dashboard → Clientes → Perfil → Nova avaliação (Dados, Dobras, Perimetria, Revisão) → Resultado. Evolução e Relatórios são acessíveis na navegação principal. Rotas reais do Next.js; estados de carregamento, erro e ausência de dados.

## Sistema visual

Grafite #101211, superfícies #191c19, texto marfim #f3f4ee, acento lima #d2f56a. Tipografia sans com números tabulares, bordas discretas e cantos moderados. Navegação lateral fixa no desktop e compacta no celular. Dados de entrada em controles grandes; resultados em métricas editoriais e gráficos mínimos. Animações respeitam redução de movimento.

## Modelo

Client contém dados cadastrais; Assessment preserva um snapshot de idade, sexo, peso e altura na data; SkinfoldMeasurement contém três leituras por sítio; CircumferenceMeasurement contém campos independentes para cada braço/estado; BodyCompositionResult contém estimativas derivadas. O registro de protocolos desacopla cálculos da UI. Comparações usam avaliações anteriores do mesmo cliente e diferenças neutras, sem diagnóstico.

## Persistência e limites

Repository localStorage versionado, com validação na leitura, feedback de falha e rascunhos por cliente. Dados fictícios identificados no produto. Sem autenticação, sincronização ou backend. Não inserir dados sensíveis reais neste protótipo compartilhado. Datas dos dados demonstrativos são ilustrativas, ancoradas em 18/09/2026.

## Referências e decisões

Nathan Demo: 20 anos, 1,82 m e 81,3 kg. Sete médias somam 63 mm. Braços da imagem: direito 34/37 e esquerdo 33/37,5, descritos como “contraído/relaxado”; a semântica é ambígua. Os valores originais são preservados em nota e nenhum estado é atribuído. Campos ausentes aparecem como “Não registrado”. Medidas de braço são opcionais, a ausência é explícita na revisão e no relatório.

Jackson & Pollock (1978), sete dobras masculino, 18–61 anos, com conversão Siri (1961). Etnia e condicionamento não são coeficientes dessa equação; condicionamento é descritivo. Outros sexos e idades podem ser cadastrados, mas não recebem esta estimativa. Histórico anterior é sintético, calculado pelo mesmo protocolo, não copiado da foto. Não há peso ideal ou objetivo de emagrecimento inferido.

Fontes: https://pubmed.ncbi.nlm.nih.gov/718832/ ; artigo original republicado: https://www.kinantropo.org/_files/ugd/af7497_d8d71d5067184e93a90ae954a74c5c18.pdf (tabela 4, coeficientes; tabela 1, Siri). Validação adicional dos coeficientes: https://pmc.ncbi.nlm.nih.gov/articles/PMC4691302/ (tabela 1).

## Organização

src/app: rotas. src/components: controles, gráficos e layout. src/features: telas por domínio. src/types: contratos. src/data: seeds. src/lib/calculations: fórmulas e comparação. src/lib/validation: validação e alertas. src/lib/store: repositório local e provider.

## Futuro

TODO: validar novos protocolos antes de habilitá-los; adicionar repositório remoto, autenticação e consentimento antes do uso em produção. Nenhuma correção por etnia ou condicionamento é inventada.
