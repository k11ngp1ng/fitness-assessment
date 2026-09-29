# Plano de evolução — Vértice

Revisão inicial: 22/09/2026. Base: leitura do código, testes, configuração de publicação e documentação do repositório. Os achados abaixo não são uma nova execução da aplicação nem uma validação científica adicional dos protocolos.

Este plano organiza propostas. Os itens permanecem pendentes até implementação e verificação; não constituem autorização para executar todo o backlog em uma única tarefa.

Direção revisada em 29/09/2026 após definição do primeiro cliente: **um personal trainer que atende individualmente de forma presencial e online**. O objetivo é um piloto com dados reais e operação completa, começando por esse profissional. Cobrança processada dentro da plataforma não é necessária nesta etapa. Os blocos P0–P3 mais abaixo registram a evolução anterior do showcase de avaliações; a sequência atual para o piloto está no fim deste documento.

## O que preservar

O projeto já entrega um fluxo integrado de cadastro, coleta guiada, revisão, resultado, evolução e relatório. Possui cálculos isolados, referência numérica testada, validação de entradas, rascunhos locais, estados de falha de armazenamento, componentes reutilizáveis e testes de navegador/acessibilidade. A identidade visual e a distinção entre estimativa e diagnóstico são parte dessa base.

## Produto para o primeiro personal — planejado

O Vértice deve apoiar o trabalho diário do personal e a experiência dos seus clientes. "Operação completa" significa cobrir a jornada de contratação, atendimento e acompanhamento; não implica reproduzir todos os módulos de um ERP de academia. Nenhuma linha desta seção está implementada por sua presença no plano.

| Frente               | Resultado esperado no piloto                                                                                                                                                 | Decisões a validar com o cliente                                                               |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Clientes e entrada   | Cadastro sem dados demonstrativos, situação do relacionamento, histórico e dados necessários ao serviço.                                                                     | Campos indispensáveis, termos usados e fluxo de entrada.                                       |
| Serviços e pacotes   | Serviço contratado, vigência, quantidade de sessões, saldo e correções rastreáveis.                                                                                          | Tipos de pacote, vencimento, reposição, cancelamento e renovação.                              |
| Agenda e presença    | Sessões individuais presenciais/online, disponibilidade, conflitos, remarcação, cancelamento e comparecimento.                                                               | Duração, antecedência, recorrência, faltas e ferramenta de reunião online.                     |
| Treino               | Biblioteca criada pelo profissional em conta vazia, vídeos opcionais, planos versionados, registro de séries/cargas por Lucas ou cliente, comparação anterior e uso offline. | Tipos de exercício/série, convenção de carga, metas e política de edição antes do piloto real. |
| Avaliação e evolução | Aproveitar o fluxo atual, corrigir avaliações com histórico e atender apenas populações/protocolos validados.                                                                | Públicos atendidos, instrumentos de coleta e frequência das reavaliações.                      |
| Financeiro manual    | Valores previstos, vencimentos e pagamentos informados pelo profissional, vinculados ao serviço.                                                                             | Regras de preço, descontos, parcelas, estorno e quem confirma recebimento.                     |
| Espaço do cliente    | Acesso restrito aos próprios compromissos, treinos e resultados publicados pelo profissional.                                                                                | O que o cliente pode editar, registrar, baixar ou compartilhar.                                |
| Visão operacional    | Próximas sessões, clientes ativos, pacotes a vencer, pendências e evolução com significado claro.                                                                            | Quais indicadores ajudam a decidir o trabalho da semana.                                       |

Cobrança integrada, conciliação bancária, emissão fiscal, aulas coletivas, catraca, estoque, folha de pagamento, múltiplos profissionais e várias unidades ficam fora do primeiro piloto. Integrações de mensagens, calendário e videochamada só entram após necessidade e acesso a dados definidos. Nenhum módulo deve simular sucesso de pagamento, envio ou sincronização.

**Tracker de treinos do Lucas:** a especificação de criação autônoma de conteúdo, fluxo, modelo, upload privado, comparação do último treino, download opcional dos vídeos para uso offline e critérios de aceite está em [TRACKER-TREINOS.md](TRACKER-TREINOS.md). Hevy é referência funcional de interação, sem copiar interface, ativos ou biblioteca. Não é preciso receber fichas ou vídeos de Lucas para começar; existe apenas um protótipo sem persistência em `/treinos`, e o registro offline exige arquitetura e teste próprios antes do piloto real.

## Passagem para o piloto com dados reais

1. **Definição inicial:** modelar a biblioteca e o tracker com cenários fictícios, estados vazios e opções explícitas para Lucas criar o próprio conteúdo. Observar ou mapear a rotina dele quando estiver disponível; validar regras comerciais e de treino antes de liberar dados reais, sem copiar dados pessoais para tickets ou testes.
2. **Base do piloto gratuito:** frontend estático em Cloudflare Pages Free e API remota do Supabase Free, com login Google, contas do personal e dos clientes, autorização por recurso, migração, backup/restauração, auditoria e operação. Validar finalidade, acesso e ciclo de vida dos dados com revisão especializada. A exportação estática atual isolada não cobre essas necessidades; detalhes e limites em [PILOT-INFRA.md](PILOT-INFRA.md).
3. **Fluxo operacional de ponta a ponta:** cadastrar cliente, contratar serviço/pacote, agendar e concluir sessão, atualizar saldo, registrar treino/avaliação e consultar pendências. Exercitar falhas, correções e acessos indevidos antes de colocar dados reais.
4. **Acesso do cliente e piloto assistido:** oferecer apenas funções publicadas pelo profissional, testar celular, teclado, acessibilidade, privacidade e recuperação. Acompanhar uso real, corrigir fricções e registrar decisões antes de ampliar o produto.

Critério geral de liberação: nenhuma informação real entra no showcase local. O piloto exige evidência atual de autenticação e autorização, integridade dos registros, backup restaurado em teste, tratamento de erros, publicação e aceite dos fluxos pelo profissional. Não confundir demonstração visual com operação pronta.

Referências para a revisão de privacidade: [LGPD, texto compilado](https://planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709compilado.htm) e [guia de segurança da ANPD para agentes de pequeno porte](https://www.gov.br/anpd/pt-br/centrais-de-conteudo/materiais-educativos-e-publicacoes/guia-orientativo-sobre-seguranca-da-informacao-para-agentes-de-tratamento-de-pequeno-porte). São pontos de partida; a aplicação concreta ao piloto depende da análise das finalidades, papéis e dados coletados.

## P0 — Confiabilidade antes de ampliar funcionalidades

### 1. Compatibilizar novos registros com a hospedagem

**Status em 22/09/2026:** implementado e verificado localmente. Páginas fixas com IDs na query string atendem registros novos; URLs antigas dos seeds foram preservadas. Os dois testes de exportação passaram sem prefixo e com `/AvaliacaoFisica`, incluindo criação, acesso direto, recarregamento e ausência de 404 no fluxo. Procedimento e limites em [STATIC-EXPORT.md](STATIC-EXPORT.md). Publicação remota não executada.

**Evidência:** `next.config.ts` usa exportação estática; as páginas de clientes, avaliações e relatórios geram parâmetros apenas dos seeds. Os formulários criam IDs em execução. A documentação local do Next.js confirma os limites de rotas dinâmicas na exportação.

**Problema:** páginas para esses novos IDs não são geradas no build. A experiência publicada precisa ser verificada além do servidor de desenvolvimento.

**Proposta:** manter páginas estáticas que resolvam IDs no cliente e usar o backend gerenciado do Supabase para o piloto. Testar a exportação no Cloudflare Pages Free. Novas funções de servidor só entram com justificativa, hospedagem e limites definidos.

**Concluído quando:** no artefato de produção, criar cliente e avaliação, abrir resultado/relatório, acessar diretamente suas URLs e recarregar funciona sem 404, com e sem o prefixo de publicação.

### 2. Preservar dados quando a leitura falhar

**Status em 23/09/2026:** implementado. Leitura inválida bloqueia o repositório e os formulários; há download do original, releitura e reinicialização confirmada com cópia local preservada. Contratos, vínculos, IDs e versões são validados, mantendo rascunhos incompletos editáveis. Fluxo, testes e limites em [LOCAL-RECOVERY.md](LOCAL-RECOVERY.md). A defesa contra snapshots antigos não encerra o item de concorrência completa.

**Evidência:** em `src/lib/store.tsx`, a leitura inválida exibe o seed e um aviso, mas `persist` continua podendo gravar na mesma chave. Portanto, a leitura não sobrescreve o original, porém uma ação posterior pode fazê-lo.

**Proposta:** estado explícito de recuperação, preservação do conteúdo original e bloqueio de sobrescrita até restauração ou reinicialização escolhida pelo usuário. Fortalecer validação de contratos, vínculos e identificadores.

**Concluído quando:** testes com JSON corrompido, estrutura inválida e versão desconhecida demonstram que interações posteriores não destroem o conteúdo original. Rascunhos incompletos válidos continuam recuperáveis.

### 3. Tornar falhas de salvamento inequívocas

**Status em 25/09/2026:** implementado no cadastro. Uma falha de gravação mantém o formulário aberto, informa que o registro está apenas na sessão e permite tentar novamente com o mesmo identificador. A nova tentativa atualiza o registro em memória, sem duplicá-lo. Teste E2E cobre falha e recuperação da gravação.

**Evidência anterior:** `addClient` retornava um booleano, mas `ClientForm` ignorava o retorno e fechava o diálogo; o Provider sinalizava a falha apenas globalmente. A finalização de avaliações já tratava esse retorno.

**Proposta:** alinhar cadastro e avaliação, oferecendo retorno contextual e nova tentativa sem duplicar registros.

**Concluído quando:** armazenamento indisponível não produz aparência de cadastro persistido; o usuário entende o que permanece apenas na sessão e consegue tentar novamente sem duplicação.

### 4. Validar antes de publicar

**Status em 29/09/2026:** workflow configurado para pull requests e publicação. Formatação, lint, typecheck, lógica, E2E de desenvolvimento e exportações com e sem `basePath` precedem o upload e o deploy. Testes locais aprovados; a execução do workflow no GitHub e o deploy remoto ainda não foram verificados. Detalhes e resultados em [CI.md](CI.md).

**Evidência anterior:** o workflow de Pages instalava e fazia build, mas não executava explicitamente os testes de lógica, typecheck ou E2E. `docs/VERIFICATION.md` é um registro de 18/09/2026.

**Proposta:** CI de qualidade para pull requests e publicação, ambiente de navegador reproduzível e teste do artefato estático. Configurar lint e formatação com scripts explícitos em uma etapa própria.

**Concluído quando:** regressões nos controles configurados impedem a publicação, com diagnóstico acessível; um fluxo de criação e recarregamento também é verificado na exportação.

## P1 — Completar a rotina do profissional

**Gestão do cadastro (29/09/2026):** edição, arquivamento e restauração implementados localmente. Snapshots anteriores, rascunhos, vínculos e histórico são preservados; a migração local v1 → v2 ocorre na primeira gravação confirmada. Testes e limites em [CLIENT-MANAGEMENT.md](CLIENT-MANAGEMENT.md).

| Entrega                  | Situação observada / proposta                                                                                      | Critério de conclusão                                                                                                   |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------- |
| Gestão do cadastro       | Edição, arquivamento e restauração implementados localmente; verificar publicação remota.                          | Corrigir cadastro preserva snapshots anteriores; arquivamento e recuperação mantêm vínculos e histórico.                |
| Correção de avaliações   | A UI permite revisar antes de finalizar, mas não oferece fluxo explícito de retificação de avaliações finalizadas. | Correção tem motivo, data e rastreabilidade; o registro anterior permanece consultável conforme a política definida.    |
| Backup e restauração     | Não há exportação/importação de dados pelo usuário.                                                                | Arquivo versionado pode ser exportado, validado e restaurado com tratamento de duplicatas e falhas; testar ida e volta. |
| Histórico determinístico | Avaliações no mesmo dia usam ordem do array; falta timestamp de registro explícito.                                | Migração preserva o histórico antigo e novos registros têm ordem estável mesmo após importação.                         |
| Múltiplas abas           | O Provider grava snapshots completos e não possui sincronização entre abas.                                        | Testes demonstram prevenção ou resolução explícita de sobrescrita por estado antigo.                                    |
| Modo demonstração        | Seeds e identidade demonstrativa fazem parte do fluxo atual.                                                       | Separar ambiente de demonstração de um espaço vazio, sem misturar registros ou descartar dados existentes.              |
| Relatório profissional   | Já há relatório imprimível; identidade é demonstrativa.                                                            | Configurar identidade real, manter método/unidades/ausências e verificar impressão com históricos e notas extensos.     |
| Conteúdo operacional     | Há textos de marca, termos em inglês e uma data fixa no shell.                                                     | Revisar instruções, botões e mensagens em pt-BR; distinguir data da avaliação, data atual e datas fictícias.            |
| Acessibilidade manual    | Há auditoria automatizada e testes de layout.                                                                      | Verificar fluxo completo por teclado, foco de erros/diálogos, ampliação de texto, contraste e redução de movimento.     |

## P2 — Base para uso com dados reais

Depende da decisão de hospedagem e dos itens de integridade P0. Não escolher fornecedor ou contratar infraestrutura apenas por este plano.

- **Persistência remota:** extrair contrato de repositório, modelar entidades e migrações, implementar API e validação no servidor. Aceite: falhas e novas tentativas não duplicam registros, restauração de backup é exercitada e o histórico permanece íntegro.
- **Identidade e acesso:** definir profissional individual, equipe ou múltiplas organizações; implementar autenticação e autorização sobre cada recurso. Aceite: testes demonstram que um usuário não acessa dados de outro por alteração de URL/ID.
- **Privacidade e ciclo de vida:** definir finalidade dos campos, acesso, retenção, exportação e exclusão, além dos termos e registros aplicáveis ao uso pretendido. Aceite: procedimentos implementados e revisão especializada das obrigações aplicáveis; não declarar conformidade por adicionar um checkbox.
- **Rastreabilidade:** registrar autoria, criação e retificações sem copiar medidas pessoais para logs operacionais. Aceite: alterações relevantes podem ser auditadas com controle de acesso.
- **Operação:** definir ambiente de teste, configuração segura, monitoramento sem dados pessoais, backup, recuperação e reversão de versão. Aceite: execução documentada de recuperação e tratamento de falhas.

## P3 — Ampliar cobertura e valor do produto

- **Protocolos adicionais:** selecionar primeiro os públicos que serão atendidos; verificar fontes primárias, pontos de coleta, limites e casos numéricos. Habilitar somente após implementação e validação específica.
- **Ficha de coleta mais completa:** avaliar necessidade de objetivo, experiência do avaliador, equipamento e condições da coleta, sem exigir dados que não serão usados. Validar os campos com o fluxo de trabalho real.
- **Comparações e acompanhamento:** seleção explícita de períodos/avaliações, indicação de intervalos e métodos incompatíveis, resumos descritivos sem juízo automático sobre saúde.
- **Escala de uso:** medir listas e gráficos com históricos maiores, estabelecer orçamento de desempenho e só então aplicar paginação ou outras otimizações.
- **Fotos e compartilhamento:** considerar apenas com demanda, finalidade e infraestrutura de acesso, privacidade e armazenamento verificadas. O espaço do cliente agora faz parte da direção do piloto descrita acima, condicionado à base segura de acesso.

## Sequência recomendada agora

**Etapa 1 em andamento (29/09/2026):** contratos puros de exercício, plano, série e sessão; validação de metas e comparação por cliente/exercício/variação/equipamento/tipo/posição; protótipo `/treinos` com biblioteca vazia, rotina de exemplo com múltiplos exercícios, ordem, séries, metas, descanso e observações ajustáveis e histórico só na aba. É uma demonstração temporária: recarga descarta tudo, não há upload, conta, acesso de cliente, banco ou offline. Proposta de hospedagem gratuita em [PILOT-INFRA.md](PILOT-INFRA.md). Esta etapa ainda não cumpre o aceite do tracker completo descrito em [TRACKER-TREINOS.md](TRACKER-TREINOS.md).

1. Continuar os contratos de domínio, estados vazios e construtor autogerido de exercícios/treinos com dados fictícios. Não aguardar material do personal; validar com ele as regras de agenda, pacotes, treinos, financeiro manual e acesso do cliente antes do piloto real.
2. Desenhar a base segura para dados reais com frontend estático, Supabase Free, login Google, armazenamento remoto e contas com autorização. Definir migração dos registros locais, backup externo verificável e ambiente de demonstração separado.
3. Entregar fluxos operacionais completos em incrementos: cliente e serviço; biblioteca de exercícios e vídeos; plano versionado e tracker com comparação; registro e sincronização offline; agenda e presença; avaliação; financeiro manual e visão operacional; acesso restrito do cliente.
4. Testar cada fluxo em ambiente de piloto com dados fictícios, inclusive falhas, restauração e acessos indevidos. Liberar dados reais só após o critério geral de liberação acima e aceite do profissional.
5. Medir uso e corrigir fricções antes de expandir protocolos, automações, integrações ou modelo para outros profissionais.

Decisões ainda abertas: regras comerciais e de cancelamento; alcance da ficha de treino; público e protocolos da avaliação; dados que o cliente pode registrar; identidade do profissional nos relatórios; titularidade e configuração das contas gratuitas propostas; base legal, retenção e responsabilidades aplicáveis; estratégia de migração dos dados locais. Resolver cada uma com o primeiro cliente e especialistas pertinentes quando ela bloquear a próxima entrega, sem pressupor que o showcase já atende o piloto.
