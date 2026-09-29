# Tracker de treinos do Lucas — especificação planejada

Este documento define o fluxo a implementar para o primeiro piloto do Vértice. **A rota `/treinos` é apenas um recorte demonstrativo, sem persistência, contas, vídeo ou acesso offline; o fluxo completo abaixo continua planejado.** Lucas é o primeiro personal; ele atende individualmente de forma presencial e online. Tanto Lucas quanto o cliente devem poder registrar a execução, com autoria visível. O cliente usa principalmente o celular durante o treino; Lucas também precisa trabalhar em celular, iPad/tablet e computador. **Não é necessário receber fichas, vídeos ou outros materiais de Lucas para começar o desenvolvimento:** a conta real começa vazia e ele cadastra seu próprio conteúdo depois. Usar somente dados fictícios nos testes e na demonstração.

## Referência de produto

O [Hevy](https://www.hevyapp.com/) inspira a separação entre rotina planejada e treino executado, registro série a série, exercício com demonstração e valores anteriores visíveis durante a execução. As páginas oficiais mostram [plano atribuído pelo treinador](https://www.hevyapp.com/features/strength-coach/), [histórico do exercício e valores anteriores](https://www.hevyapp.com/features/track-exercises/) e [mídia em exercícios personalizados](https://help.hevyapp.com/hc/en-us/articles/35688251991575-Hevy-Exercise-Library-400-Exercises-and-Custom-Exercises). Usar esses princípios de interação como referência funcional; criar identidade, interface, textos, vídeos, biblioteca e código próprios. Não copiar telas, marca, mídia ou dados do Hevy.

Feed social, curtidas, ranking, wearables e catálogo de exercícios de terceiros não fazem parte deste piloto.

## Conteúdo criado pelo próprio profissional

- Disponibilizar um painel de Lucas para criar, buscar, editar, arquivar e reutilizar exercícios. Nome, variação e instruções são livres; modalidade de registro, unidade e convenção de carga são escolhas estruturadas e explícitas, para que o histórico continue comparável. O vídeo é opcional e pode ser enviado ou substituído depois.
- Permitir montar rotinas e planos a partir da biblioteca vazia, duplicar uma rotina própria, ordenar exercícios e definir metas por exercício/série. Salvar rascunho, visualizar como o cliente verá e publicar uma versão para um cliente. Exercício ainda sem vídeo deve funcionar com instruções textuais; plano ainda não publicado não aparece ao cliente.
- No primeiro acesso, mostrar estados vazios com ações claras: “Criar exercício”, “Montar treino” e “Atribuir a cliente”. Não preencher automaticamente a conta de Lucas com exercícios, vídeos ou clientes fictícios. Manter exemplos somente em ambiente de demonstração e testes.
- Oferecer tipos iniciais configuráveis de registro, como carga e repetições, apenas repetições e duração. Outros tipos ou unidades entram quando houver regra de comparação e validação definida. “Do jeito que ele quiser” significa liberdade para criar o conteúdo e configurar as opções suportadas, sem campos arbitrários que inviabilizem histórico, acessibilidade ou sincronização.
- Guardar a identidade do profissional como configuração da conta, não como texto fixo “Lucas” no código ou na interface. O primeiro piloto atende uma conta profissional, mas o domínio não deve depender do nome de uma pessoa.

## Jornada que precisa funcionar

1. Lucas cria ou edita um **exercício reutilizável**, com nome, variação, equipamento, instruções em texto, modalidade de registro e convenção de carga. Quando tiver material, grava um vídeo demonstrativo e envia o arquivo pelo site, inclusive pelo celular. O vídeo fica associado ao exercício e pode aparecer em treinos de vários clientes autorizados.
2. Lucas monta uma **rotina modelo** com exercícios em ordem, séries, meta de repetições ou duração, orientação de carga quando pertinente, descanso e notas. Atribui uma versão do plano a um cliente e a publica. Revisões posteriores geram nova versão; sessões antigas conservam a prescrição vigente quando foram iniciadas.
3. O cliente abre o treino atribuído, vê o vídeo e as instruções do exercício, inicia a sessão e registra cada série executada: carga, repetições ou duração conforme o tipo, além de conclusão e observação opcional. O valor anterior do mesmo exercício aparece perto do campo atual com data e unidade. Lucas pode registrar durante a sessão presencial; cada registro indica quem o fez.
4. A sessão pode ser pausada e retomada, inclusive sem conexão. Rascunho local, gravação pendente, sincronização confirmada e treino finalizado são estados distintos e visíveis. Ao concluir, cliente e Lucas veem o realizado e o histórico, sem alterar silenciosamente o plano prescrito.
5. O espaço de trabalho de Lucas reúne cadastro, agenda, pacotes, financeiro manual, planos atribuídos, sessões executadas, histórico por exercício e avaliações físicas no mesmo perfil, com acesso controlado. O cliente vê apenas as áreas publicadas para ele. Medidas, cargas, presença e pagamentos não devem ser misturados em uma métrica sem significado.

## Contratos de domínio e integridade

- Separar `Exercise` (identidade estável, variação, equipamento, tipo e unidade), `ExerciseMedia` (arquivo e versão), `WorkoutTemplate`, `WorkoutPlanRevision`, `WorkoutAssignment`, `WorkoutSession` e `PerformedSet`. Uma sessão de treino executada não é um agendamento de atendimento nem uma avaliação física.
- Guardar metas prescritas e valores executados em campos diferentes. Reordenar ou substituir exercícios, séries e vídeo no plano atual não reescreve sessões anteriores. Guardar IDs, autoria, data/hora, versão e relação com cliente/plano para reconstruir o histórico.
- Não converter exercício sem carga em `0 kg`, duração em repetições, nem ausência em zero. Definir se a carga de halteres é por mão, total ou por implemento; mudanças de modalidade ou convenção exigem nova variação ou migração explícita.
- Finalização, correção, exclusão lógica e importação de sessões precisam de autoria, motivo quando houver correção e proteção contra duplicação. Falhas de gravação não podem mostrar uma sessão como sincronizada ou finalizada no servidor.
- Lucas e cliente podem registrar, mas alterações concorrentes na mesma sessão não usam substituição silenciosa pelo último envio. Verificar revisão no servidor, reter a cópia local em conflito e oferecer resolução explícita.

## Comparação com o treino anterior

- Buscar a **última sessão concluída do mesmo cliente e do mesmo exercício/variação compatível** anterior à sessão atual. Rascunhos, sessões canceladas e registros de outros clientes não entram. Mostrar data e nome/contexto do treino de origem.
- Exibir, por série de mesmo tipo e posição, carga e repetições ou duração anteriores ao lado do campo atual. Se não houver série comparável, mostrar “Sem registro anterior” naquele ponto. A ausência de histórico na primeira execução é um estado normal.
- Unidades, modalidade e convenção de carga precisam coincidir. Se o exercício, equipamento ou método de registro mudou materialmente, não calcular diferença enganosa. O histórico completo pode ser consultado separadamente.
- A comparação é informativa: não copiar a carga anterior para o valor executado sem ação do usuário nem recomendar aumento automático. Resumos como volume ou recorde só aparecem quando a fórmula, as unidades e as exclusões estiverem definidas e testadas.
- Depois de concluir um treino, apresentar um resumo por exercício em relação à última sessão concluída da mesma rotina, quando houver equivalência. Indicar exercícios novos, removidos ou sem dados comparáveis; não converter uma soma de cargas em juízo de melhora ou piora.

## Vídeos gravados por Lucas

- Somente Lucas gerencia vídeos demonstrativos no piloto. Aceitar seleção de arquivo ou captura oferecida pelo dispositivo; mostrar progresso, processamento, falha, nova tentativa e prévia antes da publicação. Publicar o exercício apenas quando a mídia estiver pronta, ou permitir publicá-lo explicitamente só com instruções em texto.
- Armazenar vídeo fora do banco de dados principal, em armazenamento de objetos com acesso privado e autorização por recurso. Validar tipo real, tamanho e duração no servidor; definir limites com base em testes de rede, custo e aparelhos. Preparar formato reproduzível nos navegadores alvo, imagem de capa e entrega eficiente. Não guardar vídeo em `localStorage`, repositório Git ou arquivos públicos do build.
- Associar a mídia à versão do exercício. Substituição ou remoção não deve deixar referências históricas enganosas; registrar versão e exibir estado indisponível quando um arquivo legitimamente não puder mais ser servido. Definir retenção e direitos de uso da gravação com Lucas, sobretudo se terceiros aparecerem.
- Reprodução com controles, sem início automático, e instruções textuais equivalentes; oferecer legendas quando houver fala necessária para entender o exercício. Falha de vídeo não impede registrar séries. Não expor URL pública permanente nem usar vídeos, imagens ou biblioteca do Hevy.

## Uso sem internet

- O cliente deve conseguir abrir um treino **previamente carregado no dispositivo**, consultar plano, instruções e valores anteriores já sincronizados, registrar e concluir localmente sem sinal. Usar armazenamento local transacional apropriado e fila de operações com IDs estáveis; tratar falta de espaço, limpeza pelo navegador e falhas de escrita como riscos reais. `localStorage` do showcase não é a solução para esse fluxo.
- A interface e os dados indispensáveis ao treino preparado precisam abrir sem rede, inclusive após recarregar a página. Definir uma estratégia de cache do site compatível com os navegadores alvo e verificar sua atualização sem apagar rascunhos locais.
- Sincronizar ao reabrir o site ou recuperar conexão, com confirmação do servidor, operações idempotentes e estado claro: “salvo neste dispositivo”, “aguardando sincronização”, “sincronizado” ou “conflito”. Não depender exclusivamente de sincronização em segundo plano, cuja disponibilidade varia entre navegadores. Nunca descartar operações locais sem exportação/recuperação ou escolha explícita.
- Oferecer **“Baixar treino para uso offline”** para o plano atribuído: textos e dados do treino devem ser preparados; vídeos demonstrativos são baixados sob escolha explícita, com tamanho/progresso e verificação de que estão disponíveis. Não baixar a biblioteca inteira. Se vídeo não couber ou falhar, informar isso e manter instruções textuais e registro offline.
- Acesso offline só para dados já autorizados no dispositivo. Definir limites de retenção e de revogação e testar aparelho compartilhado. Ao sair da conta, limpar dados já sincronizados; se houver operações pendentes, exigir sincronização ou uma escolha explícita de exportação/descarte antes de limpar. Uma revogação feita no servidor não pode ser prometida como imediata para um aparelho ainda sem conexão.
- Exercitar perda de rede no meio de uma série, recarga da página, duas abas, dois dispositivos e edição por Lucas enquanto o cliente tem alterações pendentes. Nenhum caso pode perder dados silenciosamente ou misturar clientes.

## Interface adaptável e acessível

- Entregar **um site responsivo** para celular, iPad/tablets e computador. No celular, priorizar vídeo/instrução, valor anterior e entrada rápida da série com alvos de toque confortáveis; no tablet e computador, dar a Lucas espaço para montar plano e revisar histórico. Evitar tabelas que obriguem rolagem horizontal durante o treino.
- Testar telas pequenas, tablet em retrato e paisagem, desktop, teclado virtual, zoom de texto, navegação por teclado e leitor de tela. O andamento do treino, erro, sincronização e conflito não dependem somente de cor ou animação. O vídeo não deve bloquear os controles de registro.
- A experiência pode ser instalável no futuro, mas o piloto é um site. Não prometer aplicativo nativo, sincronização perfeita entre plataformas ou funcionamento offline de conteúdo que não foi baixado.

## Ordem de implementação e aceite

1. Definir contratos e regras mínimas de exercício, série, plano e comparação com exemplos **inteiramente fictícios**. Implementar estados vazios e o painel de criação de conteúdo, sem depender de fichas ou vídeos fornecidos por Lucas.
2. Estabelecer a base de contas, autorização, persistência remota, upload privado e armazenamento offline sob os critérios de `AGENTS.md`. Desenvolver e validar a interface do tracker com dados fictícios enquanto essa base não estiver pronta para o piloto real.
3. Entregar biblioteca autogerida e upload opcional; construtor de rotinas e publicação versionada; execução série a série por cliente e Lucas; comparação anterior; download offline; sincronização e resolução de conflitos. Validar cada fatia completa antes da próxima.
4. Aceitar somente após teste de ponta a ponta: Lucas publica vídeo/exercício e plano para dois clientes; cada cliente vê apenas o seu plano, registra cargas e retoma offline; um vídeo previamente baixado reproduz offline; o servidor recebe a sessão uma única vez após reconexão; o próximo treino mostra os valores certos; Lucas vê autoria e histórico; revisão do plano não modifica sessões antigas. Cobrir falha de upload, armazenamento cheio, vídeo não baixado/indisponível, conflito e acesso por URL alterada.

Lucas poderá ajustar seu conteúdo e as opções disponíveis durante a configuração. Antes de liberar **dados reais**, validar com ele tipos de exercício usados, convenção de carga, política de correção de sessões finalizadas, limite de vídeos, tempo de acesso offline e metas prescritas. Essas escolhas não impedem a construção inicial com dados fictícios; decisões que afetem integridade ou segurança precisam ser registradas antes do piloto.

Referências técnicas para a solução offline: [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Using_IndexedDB), [service workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers) e [limites de compatibilidade da sincronização em segundo plano](https://developer.mozilla.org/en-US/docs/Web/API/Background_Synchronization_API). Conferir suporte efetivo nos aparelhos do piloto antes de escolher a implementação.
