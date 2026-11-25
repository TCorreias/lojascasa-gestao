# Lojas Casa — Central Inteligente de Promoções V1

**Entrega:** primeira versão funcional do painel, importação manual, análise, aprovação/rejeição e auditoria persistente. Não é ainda um robô de produção. Nenhum endpoint grava no Mercado Livre ou na Olist. O exemplo público é inteiramente fictício. Não há credenciais ou dados comerciais reais neste pacote.

## Implantação (GitHub TCorreias + Vercel)

1. Extraia o ZIP. No repositório `TCorreias/lojascasa-gestao`, use Add file > Upload files e envie o **conteúdo** da pasta, preservando subpastas (ou clone e copie pelo GitHub Desktop). Confirme que `package.json`, `vercel.json`, `api`, `lib` e `public` estão na raiz. Inclua `.gitignore`. Não envie arquivo `.env` preenchido. Se o repositório estiver vazio, a interface pode oferecer o link uploading an existing file.
2. No Vercel, New Project > Import Git Repository > TCorreias/lojascasa-gestao. Framework Other, diretório raiz do repositório, configurações de build/output do `vercel.json`. O sistema usa Node.js e JavaScript nativo, sem dependências npm; não é Next.js. Verifique condições e plano comercial antes de publicar (não presuma Hobby adequado a empresa).
3. Crie um projeto Supabase. Execute `schema.sql` no SQL Editor. Em Settings/API keys, obtenha URL do projeto e chave service_role/secret do servidor. Não use chave pública para o backend.
4. No Vercel > Settings > Environment Variables, configure `ADMIN_PASSWORD` (senha forte exclusiva, mínimo 16 caracteres), `SESSION_SECRET` (aleatório, pelo menos 32 caracteres), `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY`. Gere segredo localmente, por exemplo `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`. Nunca cole chaves na conversa, GitHub ou código do frontend. Faça redeploy.
5. Abra o domínio gerado pelo Vercel, teste demonstração e login privado. Importe `public/modelo.json`, aprove/rejeite, recarregue e confirme auditoria persistente. Confirme que `/api/data` sem login retorna 401.
6. Vercel > Settings > Domains > Add `gestao.lojascasa.com.br`. Copie o destino DNS **exato** fornecido pelo Vercel. Locaweb > Zona DNS > Adicionar Entrada > CNAME > host `gestao` > destino informado. Não mude www, raiz, MX ou outros registros. Aguarde verificação DNS e HTTPS.
7. Após o domínio funcionar, a URL reservada de callback é `https://gestao.lojascasa.com.br/api/auth/mercadolivre/callback`. Está implementada apenas como reserva (HTTP 503), não como OAuth funcional. Não apresente o sistema como integrado nem autorize uma aplicação antes de implementar e validar o fluxo OAuth real. Se o formulário de autorização aceitar URL planejada, declare que a integração está em desenvolvimento.

## Uso

O modo demonstração é público, sem dados privados e sem persistência. Para dados reais, entre no painel e importe JSON no formato `public/modelo.json`. A origem é manual e a interface sinaliza isso. Para testar localmente: `npm test`, `npm run dev`, acesse http://localhost:3000. Para login local configure as variáveis no ambiente do processo; Node 22 pode carregar arquivo local com `node --env-file=.env local.js`. Não exponha este servidor local à internet.

### Contrato de importação

- `items`: array de anúncios com `id` MLB único, `sku` exato, `title`, `original` (preço original ML em reais), `listingStatus` (active), `statusVerified` e `campaignsComplete` booleanos. Estes dois últimos só podem ser true após conferência independente da participação ativa, elegibilidade, programadas e cobertura de todas campanhas. O sistema não verifica a autenticidade de importações manuais.
- `cost`: custo unitário Olist (number) ou null se realmente ausente; `costSku`: SKU da origem. Não utilizar preço de venda da Olist. Recomenda-se verificar data/validade do custo antes da importação. 
- `sales`: histórico ML, `date` ISO 8601 com fuso, `price` e `net` **unitários** em reais, `quantity` positiva, `status` paid para pagamento aprovado não cancelado/devolvido. Normalizar pedidos com múltiplas unidades e não incluir comprador. Inclua vendas anteriores além de três quando não houver custo e as recentes forem iguais ao preço original.
- `campaigns`: todas as participações e propostas; `id` único por opção/campanha (se houver vários preços simulados use identificador distinto), `name`, `status` candidate/started/pending/finished, `price` final, `net` valor a receber unitário, `netVerified` verdadeiro apenas após simulação real, `meliPlus` false; `start` e `end` ISO se conhecidos. Nenhum retorno é inventado a partir de comissão genérica. A importação não altera o preço original. Para ajustar preço, simule na fonte, importe novo lote com valores verificados e aprove novamente.

## Regras de análise

- Excluir promoção ativa; bloquear programada para revisão (política conservadora). Não confundir campanha vigente com participação do item. Em produção, usar paginação completa e cruzamento de status por MLB e confirmar individualmente.
- Últimas três vendas válidas em ordem de data. Referência para custo conhecido: média dos preços. Ordenação proposta (não é regra comercial definitiva): menor distância da referência, depois maior retorno. Outras opções válidas permanecem selecionáveis; margem não é fixa. Bloquear resultado parcial não positivo.
- Sem custo: buscar venda mais recente abaixo do preço original, retrocedendo no histórico; somente opção com preço igual à referência pode ser aprovada nesta versão. Margem desconhecida. Sem histórico suficiente, bloquear.
- Retorno histórico é média unitária. Resultado parcial = valor a receber − custo. Margem parcial = resultado / preço final. Tributos, publicidade e despesas não incluídas no retorno não são estimados. Não confundir com lucro líquido.
- Aprovação/rejeição registra snapshot e hash no banco; não executa. Registro não constitui autorização para outra campanha. Auditoria append-only pela API do painel, não imutável contra administrador do banco.

## Integração futura / teste técnico

`GET /api/ml-read?id=MLB...` consulta `/users/me`, `/items/{id}`, `/seller-promotions/items/{id}?app_version=v2` apenas após inserir token temporário autorizado e ID do vendedor nas variáveis privadas `ML_ACCESS_TOKEN` / `ML_SELLER_ID`. Verifica titularidade. Não importa automaticamente os resultados, não lê vendas ainda, não calcula retorno e não garante cobertura de campanhas. Tokens expiram. O OAuth automático, renovação criptografada, API Olist, coleta paginada, vendas, agendamento e execução real precisam ser implementados e testados após acesso oficial. A rota callback retorna 503 de propósito. Referências oficiais:
- https://developers.mercadolivre.com.br/pt_br/registre-o-seu-aplicativo/gerenciar-ofertas
- https://developers.mercadolivre.com.br/pt_br/registre-o-seu-aplicativo/autenticacao-e-autorizacao
- https://ajuda.olist.com/pt_BR/hubs-e-plataformas-via-api/aplicativos-api-v3-configuracoes-e-utilizacao

Antes de habilitar escrita: validar controle conhecido MLB5505102416 enquanto oferta estiver vigente; garantir paginação sem duplicidades/perdas; calcular retorno por campanha com fonte confiável; reconsultar status, preço, estoque, elegibilidade e retorno antes da execução; invalidar aprovações desatualizadas; utilizar apenas endpoint oficial de participação em promoção, nunca PUT de preço de item; registrar resposta e validar após escrita. Substituição de promoção exige aprovação separada e plano para falhas entre retirada e nova inclusão. Nunca remover campanha automaticamente. Não ativar Meli+ sem autorização.

## Segurança e limitações

Login compartilhado de administrador, cookie assinado HttpOnly/SameSite/HTTPS, RLS e chave do banco exclusiva do servidor. A página pública mostra apenas demo fictícia; noindex não é proteção de acesso. Antes de dados reais em produção, adicionar limitação de tentativas de login, MFA/identidade individual, controle de sessão revogável, backup, políticas de retenção, monitoramento e revisão de segurança. Não use dados sensíveis de compradores. O repositório público expõe a lógica comercial: se isso for indesejado, torne privado após upload. Nenhuma publicação ou alteração de DNS é executada por este pacote.
