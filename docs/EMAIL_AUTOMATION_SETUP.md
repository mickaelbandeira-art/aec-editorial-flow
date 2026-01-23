# Configuração de Automação de E-mail

Este guia explica como ativar o envio automático de e-mails de prazo usando Supabase Edge Functions e Resend.

## Pré-requisitos

1.  **Conta no Resend**: Crie uma conta em [resend.com](https://resend.com) e gere uma **API Key**.
2.  **Supabase CLI**: Certifique-se de ter o CLI instalado e logado (`supabase login`).

## Passo a Passo

### 1. Configurar Segredos

No terminal do seu projeto, execute o comando abaixo substituindo `re_123...` pela sua chave do Resend:

```bash
supabase secrets set RESEND_API_KEY=re_123456789
```

### 2. Implantar a Função

Envie a função para o Supabase:

```bash
supabase functions deploy check-deadlines --no-verify-jwt
```

> A flag `--no-verify-jwt` é usada se você quiser chamar essa função via CRON ou publicamente sem token de usuário (opcional, mas comum para cron jobs internos). Se usar o agendador do Supabase, ele tem permissão.

### 3. Agendar a Execução (Cron Job)

Para que o e-mail seja enviado automaticamente todo dia de manhã:

1.  Acesse o **Dashboard do Supabase**.
2.  Vá em **Integrations** ou **Database** > **Extensions** e ative `pg_cron`.
3.  Vá em **SQL Editor** e execute:

```sql
select
  cron.schedule(
    'check-deadlines-morning', -- nome do job
    '0 12 * * *',              -- horário (12:00 UTC = 09:00 BRT)
    $$
    select
      net.http_post(
          url:='https://<PROJECT_REF>.supabase.co/functions/v1/check-deadlines',
          headers:='{"Content-Type": "application/json", "Authorization": "Bearer <ANON_KEY>"}'::jsonb,
          body:='{}'::jsonb
      ) as request_id;
    $$
  );
```

*Substitua `<PROJECT_REF>` e `<ANON_KEY>` pelos valores do seu projeto.*

### 4. Teste Manual

Você pode testar a função via curl:

```bash
curl -i --location --request POST 'https://<PROJECT_REF>.supabase.co/functions/v1/check-deadlines' \
  --header 'Authorization: Bearer <ANON_KEY>'
```

Se estiver dentro de uma "janela de prazo" (ex: dia 24), você deverá receber o e-mail.
