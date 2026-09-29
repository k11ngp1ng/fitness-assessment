# Recuperação do armazenamento local

A chave ativa continua sendo `vertice:v1`. Documentos antigos sem campo `version` ou com `version: 1` são lidos como v1; clientes sem `archivedAt` são normalizados em memória como ativos. A leitura não grava nem altera o conteúdo original. A próxima gravação confirmada escreve `version: 2` na mesma chave, com `archivedAt` validado como data real ou `null`. Versões desconhecidas não são interpretadas como dados atuais. Veja [gestão do cadastro](CLIENT-MANAGEMENT.md).

## Quando a leitura falha

JSON inválido (inclusive texto vazio), contratos inválidos e falhas de acesso ao navegador abrem a tela **Recuperar dados locais**. Os formulários não são montados e o repositório bloqueia gravações mesmo se chamado diretamente. O conteúdo ativo não é substituído pelos seeds.

- **Baixar conteúdo original:** baixa o texto lido integralmente, sem corrigir, converter ou descartar campos. Disponível quando a leitura do conteúdo foi possível.
- **Recarregar dados salvos:** relê e valida o armazenamento. Permite retomar após uma restauração externa ou recuperação de acesso. Descarta alterações que existiam apenas em memória, conforme informado na tela. Não é uma importação de arquivo.
- **Preservar cópia e reinicializar:** exige marcar uma confirmação. Copia o texto original para `vertice:v1:recovery:<UUID>` e confirma sua leitura antes de gravar os exemplos v2 na chave ativa. Falha ao copiar ou gravar mantém o bloqueio; cópias já criadas são conservadas. O conteúdo é comparado novamente antes da substituição. Não é permitido reinicializar quando o armazenamento não pôde ser lido.

As cópias não expiram nem são removidas automaticamente. Podem consumir a cota do navegador; uma tentativa frustrada pode deixar uma cópia adicional. Elas são preservação local para recuperação assistida, sem interface de gerenciamento/importação nesta etapa. Limpar o armazenamento do navegador pode apagá-las; o download é a opção para guardar o original fora dele.

## Validação

O parser recebe `unknown` e verifica contratos, enums, números finitos, IDs não vazios e únicos, vínculos com clientes, chaves de rascunho, sete sítios distintos com três leituras, perímetros e observações. Campos de ID reservados do protótipo de objetos são rejeitados. Clientes exigem medidas positivas e data cadastral real; avaliações finalizadas também passam pelas regras de finalização existentes.

Rascunhos aceitam campos ainda em correção: data vazia/inválida, medidas negativas e leituras ausentes continuam editáveis. Seus contratos, vínculos e etapa permanecem obrigatórios. Entradas numéricas não finitas na edição continuam sendo persistidas como `-1`, preservando o comportamento anterior de indicar valor inválido. Médias, snapshots, ordem do histórico e fórmulas não mudaram.

## Alterações entre abas

Antes de gravar, o repositório compara o texto ativo com a última leitura/gravação bem-sucedida. Mudança detectada bloqueia a operação. Eventos `storage` também substituem o formulário pela tela de recuperação, exigindo releitura explícita. Não há mesclagem automática nem sincronização de rascunhos.

Essa defesa detecta snapshots antigos, mas `localStorage` não oferece uma transação de comparação e escrita entre processos: gravações estritamente simultâneas ainda exigem coordenação adicional. Portanto o item de concorrência completa do roadmap continua pendente. A cópia e a substituição também não formam uma transação; as verificações reduzem a janela, sem prometer atomicidade.

## Verificar

`tests/storage.test.ts` cobre preservação do original, formatos/versões inválidos, contratos, rascunhos, conflitos e falhas antes/depois da cópia. `tests/e2e/recovery.spec.ts` cobre bloqueio dos formulários, navegação/recarregamento, download exato, confirmação, falha de cópia, releitura após restauração, mudança em outra aba e acessibilidade/layout da tela.

Esta etapa não altera o retorno de falha do cadastro comum nem implementa backup/importação geral. Esses itens permanecem separados no roadmap.

## Verificação de 23/09/2026

Typecheck, build estático final (42 páginas/rotas, incluindo o ícone) e 14 testes de lógica aprovados. Os 11 casos E2E foram aprovados em execuções por arquivo, incluindo os quatro cenários de recuperação, acessibilidade, coleta no celular, cadastro, relatório e impressão. As capturas da recuperação foram inspecionadas em desktop e celular; larguras de 390, 768 e 1440 px passaram na checagem de ausência de rolagem horizontal. Dois testes da exportação estática sem prefixo passaram.

As primeiras execuções tiveram interferência do build sobre o servidor de desenvolvimento e uma suspensão prolongada do ambiente; foram repetidas. O rastreamento também identificou um 404 de favicon ausente: foi adicionado `src/app/icon.svg`, e o teste de navegação passou sem suprimir erros. Não houve publicação remota.
