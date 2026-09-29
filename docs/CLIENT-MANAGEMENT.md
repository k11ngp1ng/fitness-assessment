# Gestão do cadastro

O perfil permite corrigir nome, idade, sexo, altura, peso, condicionamento e foco. O identificador e a data de criação permanecem. A edição altera apenas o cadastro; avaliações finalizadas conservam idade, sexo, peso, altura e condicionamento registrados na coleta. Rascunhos não são reescritos por uma edição.

Arquivar exige confirmação. O cliente sai da lista ativa e aparece no filtro **Arquivados**. Seu perfil, avaliações, relatórios e rascunhos continuam vinculados e acessíveis. A coleta guiada impede criar ou retomar avaliações enquanto o cliente está arquivado. Restaurar devolve o cadastro à lista ativa e permite retomar o rascunho. Não há exclusão de dados nesta operação.

As ações só fecham seus formulários após uma gravação confirmada. Se a escrita falhar, a interface informa que a alteração está apenas na sessão e permite tentar novamente; um recarregamento recupera o último estado gravado. Conflitos com outra aba seguem o bloqueio e a releitura explícita descritos em [LOCAL-RECOVERY.md](LOCAL-RECOVERY.md).

## Formato local

A chave continua `vertice:v1` para encontrar os dados existentes. O formato atual contém `version: 2` e `archivedAt` em cada cliente (`null` ou data real `AAAA-MM-DD`). Documentos sem versão ou com `version: 1` são validados e normalizados em memória como clientes ativos; a leitura não sobrescreve o original. A primeira gravação bem-sucedida escreve v2. Versões desconhecidas, datas inválidas, IDs duplicados e vínculos quebrados acionam recuperação sem descartar o conteúdo original. A reinicialização confirmada também escreve v2, preservando antes uma cópia literal do conteúdo anterior.

## Verificação local de 29/09/2026

Os testes de armazenamento cobrem migração sem escrita na leitura, preservação de avaliações e rascunhos, validação de `archivedAt` e rejeição de versões futuras. Os testes de navegador cobrem edição sem alterar snapshots, arquivamento, acesso direto e recarregamento, bloqueio de nova coleta, restauração com rascunho e falhas de gravação. A publicação remota desta revisão ainda não foi verificada.
