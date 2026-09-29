# Verificação da exportação estática

As páginas `/clientes/perfil/`, `/avaliacoes/resultado/` e `/relatorios/visualizar/` resolvem `?id=...` no navegador. São geradas no build independentemente dos registros existentes. Os endereços antigos dos seeds continuam exportados; URLs antigas de IDs locais arbitrários não têm HTML e devem ser reabertas pela lista.

## Executar

Use Node 24, pnpm 10 e Microsoft Edge instalado. No Windows, inicie `node scripts/serve-export.mjs` em outro terminal antes de `pnpm test:export` e encerre o servidor depois. No CI, o Playwright faz isso automaticamente. O servidor usa `127.0.0.1:3100`, serve apenas `out/` e não possui fallback de SPA; não usa `next dev` nem `next start`.

```powershell
pnpm build
# Em outro terminal: node scripts/serve-export.mjs
pnpm test:export
```

Para reproduzir o prefixo do GitHub Pages em PowerShell:

```powershell
$env:EXPORT_BASE_PATH = '/AvaliacaoFisica'
pnpm build
# Em outro terminal, com a mesma variável: node scripts/serve-export.mjs
pnpm test:export
Remove-Item Env:EXPORT_BASE_PATH
```

O prefixo é definido pela variável `EXPORT_BASE_PATH` no build e no servidor de teste; alterar apenas o servidor não altera o artefato. Para voltar a uma exportação sem prefixo, remova a variável e execute o build novamente.

## Cobertura

- Criação de cliente e avaliação pela interface, consulta de resultado e relatório.
- Edição, arquivamento e restauração de cliente criado após o build, com acesso direto e recarregamento do perfil.
- Recarregamento dos três registros e abertura direta em outra aba no mesmo navegador, com resposta HTTP 200.
- Links de retorno e das listas de avaliações e relatórios.
- IDs ausentes, vazios, repetidos e desconhecidos; compatibilidade com os endereços demonstrativos anteriores.
- Ausência de erros de execução e respostas HTTP de erro no fluxo principal. Uma URL não exportada deve continuar respondendo 404.

## Particularidade do Windows

No Next 16.3.5, `collectSegmentPaths` entrega separadores do sistema ao exportador, mas `convertSegmentPathToStaticExportFilename` substitui apenas `/` por `.`. No Windows, isso gera subpastas `__next.*` onde o navegador espera arquivos planos. `scripts/normalize-export.mjs`, executado após o build, adiciona cópias com os nomes esperados sem alterar os conteúdos e sem sobrescrever arquivos. No Linux, não faz alterações. Reavaliar a necessidade ao atualizar o Next.

O teste permanece estrito: o servidor não traduz nomes incorretos nem mascara arquivos ausentes. A aprovação comprova o artefato local, não uma publicação remota. Os dados continuam restritos ao armazenamento do navegador.

## Execução de 22/09/2026

- Windows, Node 24.19.0, Microsoft Edge; restauração das dependências com pnpm 10.34.5 e lockfile congelado. O pnpm 11 fornecido pelo ambiente iniciou uma recriação incompleta; a instalação foi reparada sem mudar versões ou lockfile.
- TypeScript sem erros; nove testes de lógica aprovados.
- Sete E2E existentes aprovados; após atualizar as URLs de acessibilidade e showcase, os cinco testes desses arquivos passaram novamente (incluindo celular e impressão).
- Builds sem prefixo e com `/AvaliacaoFisica` aprovados. Dois testes estáticos aprovados em cada configuração, sem erros HTTP no fluxo principal.
- Os comandos de verificação foram executados também diretamente pelos CLIs locais do Node para evitar o pnpm 11 do ambiente. O build incluiu `scripts/normalize-export.mjs`.
- O artefato `out/` ao final desta execução usa `/AvaliacaoFisica`. Não foi feito deploy remoto nem configurado bloqueio de publicação no CI; isso permanece no item P0.4.
