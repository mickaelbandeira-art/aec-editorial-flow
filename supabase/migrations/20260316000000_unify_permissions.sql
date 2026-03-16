-- Migração para unificar permissões e papéis (roles)
-- Data: 2026-03-16

-- 1. Garantir que o Enum de roles exista e adicionar 'analista_pleno'
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'flowrev_role') THEN
        CREATE TYPE public.flowrev_role AS ENUM ('coordenador', 'supervisor', 'analista', 'gerente');
    END IF;
END $$;

ALTER TYPE public.flowrev_role ADD VALUE IF NOT EXISTS 'analista_pleno';

-- 2. Garantir que a tabela flowrev_users tenha a estrutura necessária
CREATE TABLE IF NOT EXISTS public.flowrev_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    nome TEXT NOT NULL,
    matricula TEXT NOT NULL,
    role public.flowrev_role NOT NULL DEFAULT 'analista',
    produtos_acesso TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Garantir colunas específicas se a tabela já existia antes desta migração
ALTER TABLE public.flowrev_users ADD COLUMN IF NOT EXISTS role public.flowrev_role NOT NULL DEFAULT 'analista';
ALTER TABLE public.flowrev_users ADD COLUMN IF NOT EXISTS produtos_acesso TEXT[] DEFAULT '{}';
ALTER TABLE public.flowrev_users ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT now();
ALTER TABLE public.flowrev_users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();


-- 3. Habilitar RLS se for uma nova tabela
ALTER TABLE public.flowrev_users ENABLE ROW LEVEL SECURITY;

-- 4. Revogar políticas restritivas que dependem de auth.uid() (pois o login é customizado)
DROP POLICY IF EXISTS "Usuários veem próprios dados" ON public.flowrev_users;
DROP POLICY IF EXISTS "Gerentes podem ver tudo em flowrev_users" ON public.flowrev_users;
DROP POLICY IF EXISTS "Acesso flowrev_users" ON public.flowrev_users;
DROP POLICY IF EXISTS "Leitura Geral flowrev_users" ON public.flowrev_users;

-- 5. Permitir leitura para todos (protegido pela lógica do Frontend/Sidebar)
CREATE POLICY "Leitura Geral flowrev_users" ON public.flowrev_users
    FOR SELECT USING (true);


-- 6. Função RPC para atualização segura (SECURITY DEFINER)
-- Isso permite atualizar mesmo sem auth.uid() nativo, validando pelo e-mail do admin logado no store
CREATE OR REPLACE FUNCTION public.flowrev_update_user_permissions(
    target_user_id UUID,
    new_role public.flowrev_role,
    new_produtos TEXT[],
    admin_email TEXT
)
RETURNS VOID AS $$
DECLARE
    is_admin BOOLEAN;
BEGIN
    -- Verifica se o solicitante tem cargo de gerente ou coordenador no banco
    SELECT EXISTS (
        SELECT 1 FROM public.flowrev_users
        WHERE LOWER(TRIM(email)) = LOWER(TRIM(admin_email)) 
        AND role IN ('gerente', 'coordenador')
    ) INTO is_admin;

    IF NOT is_admin THEN
        RAISE EXCEPTION 'Acesso negado: Somente gerentes ou coordenadores podem alterar permissões.';
    END IF;

    -- Executa a atualização
    UPDATE public.flowrev_users
    SET role = new_role,
        produtos_acesso = new_produtos,
        updated_at = now()
    WHERE id = target_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Função RPC para criação de novo usuário
CREATE OR REPLACE FUNCTION public.flowrev_create_user(
    new_email TEXT,
    new_nome TEXT,
    new_matricula TEXT,
    new_role public.flowrev_role,
    new_produtos TEXT[],
    admin_email TEXT
)
RETURNS VOID AS $$
DECLARE
    is_admin BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM public.flowrev_users
        WHERE LOWER(TRIM(email)) = LOWER(TRIM(admin_email)) 
        AND role IN ('gerente', 'coordenador')
    ) INTO is_admin;

    IF NOT is_admin THEN
        RAISE EXCEPTION 'Acesso negado: Somente gerentes ou coordenadores podem adicionar usuários.';
    END IF;

    INSERT INTO public.flowrev_users (email, nome, matricula, role, produtos_acesso)
    VALUES (LOWER(TRIM(new_email)), new_nome, new_matricula, new_role, new_produtos);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Função RPC para exclusão de usuário
CREATE OR REPLACE FUNCTION public.flowrev_delete_user(
    target_user_id UUID,
    admin_email TEXT
)
RETURNS VOID AS $$
DECLARE
    is_admin BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM public.flowrev_users
        WHERE LOWER(TRIM(email)) = LOWER(TRIM(admin_email)) 
        AND role IN ('gerente', 'coordenador')
    ) INTO is_admin;

    IF NOT is_admin THEN
        RAISE EXCEPTION 'Acesso negado: Somente gerentes ou coordenadores podem excluir usuários.';
    END IF;

    -- Não permitir que o usuário se exclua (opcional, mas seguro)
    IF EXISTS (SELECT 1 FROM public.flowrev_users WHERE id = target_user_id AND email = admin_email) THEN
        RAISE EXCEPTION 'Ação inválida: Você não pode excluir seu próprio usuário.';
    END IF;

    DELETE FROM public.flowrev_users WHERE id = target_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Comentário Informativo
COMMENT ON TABLE public.flowrev_users IS 'Tabela consolidada de usuários e cargos. Gestão via RPCs dedicadas.';


