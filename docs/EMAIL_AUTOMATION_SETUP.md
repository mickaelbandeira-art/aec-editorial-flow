# Configuração de Automação de E-mail

Este guia explica como ativar o envio automático de e-mails de prazo usando Supabase Edge Functions e Resend.

## Pré-requisitos

1.  **Conta no Resend**: Crie uma conta em [resend.com](https://resend.com) e gere uma **API Key**.
2.  **Supabase CLI**: Certifique-se de ter o CLI instalado e logado (`supabase login`).

## Passo a Passo

### 2. Configurar Segredos

Você precisará adicionar a chave do Resend como um segredo.
**Via Dashboard:**
1.  Vá em **Settings** > **Edge Functions** (ou pesquise por "Secrets").
2.  Adicione um novo segredo:
    *   Name: `RESEND_API_KEY`
    *   Value: `re_cAfJGFee_EWU9XRaBACqcZyWeE1tYzo4J` (sua chave)

### 3. Implantar a Função

#### Opção A: Via CLI (Recomendado)

Se tiver o CLI instalado:
1.  `supabase secrets set RESEND_API_KEY=re_cAfJGFee_EWU9XRaBACqcZyWeE1tYzo4J`
2.  `supabase functions deploy check-deadlines --no-verify-jwt`

#### Opção B: Via Dashboard (Sem Instalação)

1.  Acesse o **Dashboard do Supabase** > **Edge Functions**.
2.  Clique em **Create a new Function**.
3.  Nome: `resend-email` (ou `check-deadlines`).
4.  Cole o código do arquivo `supabase/functions/check-deadlines/index.ts` (substituindo o exemplo padrão).
5.  Salve e faça o Deploy.

> A flag `--no-verify-jwt` é usada se você quiser chamar essa função via CRON ou publicamente sem token de usuário (opcional, mas comum para cron jobs internos). Se usar o agendador do Supabase, ele tem permissão.

### 3. Agendar a Execução (Cron Job)

Para que o e-mail seja enviado automaticamente todo dia de manhã:

1.  Acesse o **Dashboard do Supabase**.
2.  Vá em **Integrations** ou **Database** > **Extensions** e ative `pg_cron`.
3.  Vá em **SQL Editor** e execute (ajuste o nome da função se necessário):

```sql
select
  cron.schedule(
    'check-deadlines-morning', -- nome do job
    '0 12 * * *',              -- horário (12:00 UTC = 09:00 BRT)
    $$
    select
      net.http_post(
          url:='https://<PROJECT_REF>.supabase.co/functions/v1/resend-email',
          headers:='{"Content-Type": "application/json", "Authorization": "Bearer <ANON_KEY>"}'::jsonb,
          body:='{}'::jsonb
      ) as request_id;
    $$
  );
```

*Substitua `<PROJECT_REF>` e `<ANON_KEY>` pelos valores do seu projeto.*
*Nota: Se você nomeou a função de `check-deadlines`, ajuste a URL acima.*

### 4. Teste Manual

Você pode testar a função via curl:

```bash
curl -i --location --request POST 'https://<PROJECT_REF>.supabase.co/functions/v1/resend-email' \
  --header 'Authorization: Bearer <ANON_KEY>'
```

Se estiver dentro de uma "janela de prazo" (ex: dia 24), você deverá receber o e-mail.
