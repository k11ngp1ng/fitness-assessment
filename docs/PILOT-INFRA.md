# Infraestrutura proposta para o piloto gratuito do Lucas

Proposta revisada em 29/09/2026 conforme a decisão de **custo zero por enquanto**, inclusive sem domínio próprio. O login do piloto será com conta Google. A aplicação atual continua sendo um showcase com exportação estática e dados locais. Nenhum serviço foi contratado ou configurado. O plano gratuito é uma escolha de custo; o produto ainda não está pronto para receber dados reais.

## Escolha inicial: US$ 0/mês dentro das cotas

| Camada         | Proposta                                                                                                              | Uso no piloto                                                                                                                                                                               |
| -------------- | --------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Site           | [Cloudflare Pages Free](https://developers.cloudflare.com/pages/framework-guides/nextjs/deploy-a-static-nextjs-site/) | Publicar o `out/` gerado pelo Next.js no subdomínio gratuito `*.pages.dev`. Manter a exportação estática e testar abertura direta de cada rota.                                             |
| Contas e dados | [Supabase Free](https://supabase.com/pricing): Auth + Postgres                                                        | Persistência remota e autorização por linha (RLS) para um profissional e seus clientes. O serviço remoto fornece a API necessária; o site não precisa de runtime Next.js no piloto inicial. |
| Login          | [Google via Supabase Auth](https://supabase.com/docs/guides/auth/social-login/auth-google)                            | Lucas e clientes convidados entram com suas contas Google. Configurar o provedor OAuth e restringir o acesso por vínculo no banco; login Google, por si só, não autoriza ver dados.         |
| Vídeos         | Supabase Storage Free, bucket privado                                                                                 | Vídeos demonstrativos associados a exercícios e entregues apenas a usuários autorizados. Limites de uso descritos abaixo.                                                                   |
| Offline        | IndexedDB + service worker no navegador                                                                               | Plano preparado, registro local e fila de sincronização. Download de vídeo somente por escolha do cliente.                                                                                  |
| Domínio        | Subdomínio gratuito `*.pages.dev`                                                                                     | Nenhum domínio próprio ou custo anual no início.                                                                                                                                            |

Essa composição substitui a proposta anterior de Vercel Pro + Supabase Pro, estimada em US$ 45/mês. Os planos pagos permanecem como opção futura, sem exigir reescrever o domínio de treinos. A Cloudflare documenta [exportação estática de Next.js no Pages](https://developers.cloudflare.com/pages/framework-guides/nextjs/deploy-a-static-nextjs-site/) e [500 builds/mês no plano Free](https://developers.cloudflare.com/pages/platform/limits/). Confirmar cotas e termos ao criar as contas.

Na configuração do Pages, usar Node 24 e pnpm 10 como no CI, comando `pnpm build`, diretório de saída `out/` e `EXPORT_BASE_PATH` vazio para o subdomínio `pages.dev`. O script de build do repositório também normaliza a exportação no Windows. Só conectar uma implantação do piloto quando o ambiente estiver isolado do showcase e os testes de acesso passarem; não publicar automaticamente a branch atual como produto para Lucas.

## Limites que afetam a experiência

- O [Supabase Free](https://supabase.com/pricing) inclui atualmente 500 MB de banco, 1 GB de arquivos e 5 GB de saída mensal. O [limite global de arquivo](https://supabase.com/docs/guides/storage/uploads/file-limits) não pode passar de 50 MB. Começar com vídeos curtos e compactados; definir no produto um limite inicial conservador de 20 MB por vídeo e acompanhar uso total de mídia e saída. Esse limite do produto pode ser revisto após medir vídeos reais; não prometer armazenamento ou reprodução ilimitados.
- O [projeto gratuito pode pausar por baixa atividade](https://supabase.com/docs/guides/platform/free-project-pausing), inclusive em um piloto pequeno. Mostrar falha de conexão de forma honesta e manter operações offline pendentes sem descarte. A retomada depende do responsável pelo projeto; não prometer disponibilidade contínua.
- O [plano gratuito não oferece backups automáticos para download](https://supabase.com/docs/guides/deployment/going-into-prod). Antes de cadastrar dados reais, implementar exportação periódica do banco e dos vídeos para local controlado pelo responsável, proteger essas cópias e testar uma restauração. A [CLI do Supabase documenta dump e restauração](https://supabase.com/docs/guides/platform/migrating-within-supabase/backup-restore). Sem responsável por executar e conferir esse procedimento, o piloto permanece com dados fictícios.
- O login Google evita depender do [SMTP padrão do Supabase](https://supabase.com/docs/guides/auth/auth-smtp), que restringe destinatários externos. Os participantes precisam de conta Google. Testar entrada, saída, perda de acesso à conta e revogação do vínculo antes dos convites. Não ativar email/senha ou recuperação por email sem configurar entrega apropriada.
- Configurar um projeto Google OAuth, o provedor no Supabase e os endereços de retorno exatos do `pages.dev` e do ambiente local. Testar um usuário fora da equipe de desenvolvimento; o Google pode exigir ajustes de tela de consentimento antes do convite aos clientes. O login não deve criar vínculo automático com um cliente pelo email informado.
- A hospedagem estática não protege dados pelo HTML. Somente políticas RLS corretas, vínculos verificados e bucket privado devem autorizar leituras e gravações. A chave pública do Supabase pode ficar no cliente; chave de serviço e credenciais de backup nunca podem ir para o build ou repositório.
- O subdomínio gratuito é suficiente para validar o uso. Cotas excedidas, mudança de termos ou maior disponibilidade podem exigir plano pago; o aplicativo deve informar limites e permitir exportar os dados.

## Arquitetura e isolamento

- Manter o showcase atual separado do piloto. A chave `vertice:v1` contém registros locais e não será enviada automaticamente a uma conta. Importação futura exige versão, validação, consentimento e reconciliação de IDs.
- Criar migrações SQL versionadas, autenticação e [RLS](https://supabase.com/docs/guides/database/postgres/row-level-security) por recurso. Testar pelo menos dois clientes e tentativa de acesso por ID alterado. Profissional administra biblioteca, planos, agenda e financeiro; cliente lê apenas o que foi publicado para ele e registra só a sua execução.
- Manter prescrições e sessões versionadas. Gravações remotas exigem ID estável, revisão esperada, validação, autoria e resposta idempotente. Em conflito, preservar a operação local e pedir resolução explícita.
- Guardar mídia em [bucket privado](https://supabase.com/docs/guides/storage/serving/downloads), com acesso temporário. Validar tipo, tamanho, duração e vínculo antes de publicar o exercício com vídeo. Não colocar mídia no `out/`, no Git ou em `localStorage`.
- Preparar somente treinos atribuídos para offline. Dados estruturados e instruções são essenciais; vídeos são opcionais. Definir retenção local, saída de conta com operações pendentes e limitação da revogação enquanto o dispositivo estiver sem conexão.
- Evitar que previews públicos do Pages apontem para o banco do piloto real. Ambientes de desenvolvimento e testes usam exclusivamente dados fictícios.

## Ordem de construção sem contratação

1. Concluir contratos e interface de treinos com dados fictícios, incluindo montagem flexível de planos e comparação.
2. Implementar schema, políticas RLS e testes de isolamento. Preparar configuração de Supabase Free sem segredos no repositório; até haver contas do responsável, usar ambiente local ou fictício.
3. Implementar login Google, biblioteca, plano versionado, publicação e registro online. Migrar cadastro e avaliações sem importação automática do `localStorage`.
4. Implementar vídeo privado, limites de arquivo/uso e estados de falha; depois IndexedDB, download opcional, sincronização idempotente e conflitos.
5. Implementar agenda, pacotes, financeiro manual, exportação/backup e restauração testada. Validar acesso, privacidade, recuperação e fluxo completo com Lucas antes do primeiro dado real.

**Quando avaliar upgrade:** pausa que prejudique o atendimento, cota de vídeos/saída próxima do limite, necessidade de backup automático ou volume acima das cotas gratuitas. Medir antes de escolher serviço ou plano pago.
