# Verificação do showcase

Ambiente: Windows, Node.js 24, Next.js 16.3.5, Microsoft Edge headless. Data: 18/09/2026.

- TypeScript: sem erros.
- Build de produção: rotas estáticas e dinâmicas compiladas.
- 9 testes de lógica: referência de Nathan, soma/médias, Siri, conservação da massa, decimais, valores inválidos, limites do protocolo, dados históricos ambíguos, comparações e ordem de avaliações na mesma data.
- 7 testes de navegador: navegação pelas rotas, cadastro, coleta guiada, Enter, revisão/edição, salvamento, retomada, pesquisa, filtros de gráficos, layouts desktop e móvel, impressão, armazenamento indisponível e rascunho inválido.
- Auditoria axe WCAG A/AA: dashboard, clientes, dados básicos, resultados e coleta/revisão móvel. Sem violações detectadas no conjunto auditado. Auditoria automatizada não substitui avaliação humana completa.
- Não foram detectados erros JavaScript ou erros de console durante a navegação testada.
- Capturas visuais inspecionadas em desktop e em largura móvel de 390 px. Sem rolagem horizontal nas rotas verificadas.
- Impressão real pelo navegador e renderização com Poppler: relatório de Nathan em 2 páginas A4, fundo claro, perimetria, gráfico integral, notas e metodologia. Sem cortes ou sobreposição.

Artefatos: `artifacts/dashboard-desktop.png`, `artifacts/dashboard-mobile.png`, `artifacts/skinfolds-mobile.png`, `artifacts/relatorio-nathan.pdf` e `artifacts/accessibility.json`.

As verificações não cobrem backend, autenticação ou sincronização, pois esses recursos não fazem parte desta versão.
