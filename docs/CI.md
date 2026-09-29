# Verificação contínua

O workflow `.github/workflows/pages.yml` roda em pull requests para `main`, pushes em `main` e execução manual. Ele usa Node 24, pnpm 10 e o lockfile congelado. Os testes de navegador usam o Chromium instalado pelo Playwright e iniciam os servidores automaticamente no CI. No Windows local, o padrão continua sendo Microsoft Edge e os E2E exigem os servidores em outros terminais: `pnpm dev` para o fluxo de desenvolvimento e `node scripts/serve-export.mjs` para o artefato estático.

Ordem dos controles:

1. Formatação (`pnpm format:check`), lint (`pnpm lint`), tipos (`pnpm typecheck`) e lógica (`pnpm test`).
2. E2E no servidor de desenvolvimento (`pnpm test:e2e`).
3. Build e E2E da exportação sem `basePath` (`pnpm build` e `pnpm test:export`).
4. Novo build e E2E da exportação com `EXPORT_BASE_PATH` igual ao nome do repositório (`/${nome-do-repositorio}`). O teste serve apenas arquivos reais de `out/`, sem fallback de SPA, e cobre criação, acesso direto e recarregamento de novos registros.

Em pull requests, o workflow termina após as verificações. Em pushes para `main` e execuções manuais, somente o artefato aprovado da segunda exportação é enviado ao GitHub Pages. O job de deploy depende do job de verificação. Falhas de navegador mantêm capturas e traces em `test-results/`, enviados como artefato de diagnóstico quando disponíveis; o log da etapa mostra os demais erros.

Para reproduzir localmente, execute os comandos acima na mesma ordem e mantenha o servidor correspondente em outro terminal durante cada suíte de navegador. O [procedimento da exportação](STATIC-EXPORT.md) descreve como definir `EXPORT_BASE_PATH` no PowerShell. `pnpm start` não serve a exportação estática. O workflow protege a publicação configurada neste repositório; não substitui regras de proteção de branch nem comprova um deploy remoto antes de sua execução no GitHub.

## Verificação local de 29/09/2026

No Windows com Node 24, pnpm 10 e Microsoft Edge, passaram: instalação com lockfile congelado, formatação, lint, typecheck, 16 testes de lógica, 15 E2E de desenvolvimento e três testes da exportação em cada configuração (sem prefixo e com `/AvaliacaoFisica`). Ambos os builds geraram 42 páginas/rotas. Os cenários incluem a migração v1 → v2, edição, arquivamento, restauração, acesso direto a novos registros e falhas de gravação. O lint do Next 16.3.5 exigiu alinhar TypeScript à série 6, suportada pelo `typescript-eslint` instalado. A execução do workflow no runner Linux e o deploy remoto ainda dependem de uma execução no GitHub.
