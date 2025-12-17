-- Enum para roles do FlowRev
DO $$ BEGIN
  CREATE TYPE public.flowrev_role AS ENUM ('coordenador', 'supervisor', 'analista', 'gerente');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Enum para status dos insumos
DO $$ BEGIN
  CREATE TYPE public.insumo_status AS ENUM ('nao_iniciado', 'em_preenchimento', 'enviado', 'em_analise', 'ajuste_solicitado', 'aprovado');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Enum para fases da produção
DO $$ BEGIN
  CREATE TYPE public.producao_fase AS ENUM ('kickoff', 'envio_textuais', 'envio_dados_finais', 'construcao', 'finalizacao', 'validacao', 'concluido');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Tabela de roles do FlowRev (separada do profiles)
CREATE TABLE IF NOT EXISTS public.flowrev_user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role flowrev_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Tabela de Produtos (Claro, iFood, etc.)
CREATE TABLE IF NOT EXISTS public.flowrev_produtos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  cor_tema TEXT DEFAULT '#0066ff',
  ativo BOOLEAN DEFAULT true,
  ordem INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de Tipos de Insumos (templates)
CREATE TABLE IF NOT EXISTS public.flowrev_tipos_insumos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  descricao TEXT,
  ordem INTEGER DEFAULT 0,
  requer_imagem BOOLEAN DEFAULT false,
  requer_legenda BOOLEAN DEFAULT false,
  requer_pdf BOOLEAN DEFAULT false,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de Edições (mês/ano da revista)
CREATE TABLE IF NOT EXISTS public.flowrev_edicoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  produto_id UUID REFERENCES public.flowrev_produtos(id) ON DELETE CASCADE NOT NULL,
  mes INTEGER NOT NULL CHECK (mes >= 1 AND mes <= 12),
  ano INTEGER NOT NULL CHECK (ano >= 2020),
  fase_atual producao_fase DEFAULT 'kickoff',
  data_kickoff DATE,
  data_envio_textuais DATE,
  data_envio_dados DATE,
  data_construcao_inicio DATE,
  data_construcao_fim DATE,
  data_validacao DATE,
  data_conclusao DATE,
  percentual_conclusao INTEGER DEFAULT 0,
  status TEXT DEFAULT 'em_andamento',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (produto_id, mes, ano)
);

-- Tabela de Insumos (conteúdo real)
CREATE TABLE IF NOT EXISTS public.flowrev_insumos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  edicao_id UUID REFERENCES public.flowrev_edicoes(id) ON DELETE CASCADE NOT NULL,
  tipo_insumo_id UUID REFERENCES public.flowrev_tipos_insumos(id) NOT NULL,
  conteudo_texto TEXT,
  observacoes TEXT,
  status insumo_status DEFAULT 'nao_iniciado',
  data_limite DATE,
  enviado_por UUID REFERENCES auth.users(id),
  enviado_em TIMESTAMP WITH TIME ZONE,
  revisado_por UUID REFERENCES auth.users(id),
  revisado_em TIMESTAMP WITH TIME ZONE,
  motivo_ajuste TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (edicao_id, tipo_insumo_id)
);

-- Tabela de Anexos dos Insumos
CREATE TABLE IF NOT EXISTS public.flowrev_anexos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  insumo_id UUID REFERENCES public.flowrev_insumos(id) ON DELETE CASCADE NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('imagem', 'pdf', 'outro')),
  nome_arquivo TEXT NOT NULL,
  url TEXT NOT NULL,
  legenda TEXT,
  tamanho_bytes INTEGER,
  uploaded_por UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de Histórico/Versionamento
CREATE TABLE IF NOT EXISTS public.flowrev_historico (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  insumo_id UUID REFERENCES public.flowrev_insumos(id) ON DELETE CASCADE NOT NULL,
  acao TEXT NOT NULL,
  dados_anteriores JSONB,
  dados_novos JSONB,
  usuario_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de Notificações
CREATE TABLE IF NOT EXISTS public.flowrev_notificacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  titulo TEXT NOT NULL,
  mensagem TEXT NOT NULL,
  tipo TEXT DEFAULT 'info',
  lida BOOLEAN DEFAULT false,
  link TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Function para verificar role do FlowRev
CREATE OR REPLACE FUNCTION public.has_flowrev_role(_user_id UUID, _role flowrev_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.flowrev_user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Function para verificar se é gerente ou analista
CREATE OR REPLACE FUNCTION public.is_flowrev_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.flowrev_user_roles
    WHERE user_id = _user_id AND role IN ('gerente', 'analista')
  )
$$;

-- Enable RLS
ALTER TABLE public.flowrev_user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flowrev_produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flowrev_tipos_insumos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flowrev_edicoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flowrev_insumos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flowrev_anexos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flowrev_historico ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flowrev_notificacoes ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- flowrev_user_roles
CREATE POLICY "Usuários veem próprias roles" ON public.flowrev_user_roles
  FOR SELECT USING (auth.uid() = user_id OR is_flowrev_admin(auth.uid()));

CREATE POLICY "Apenas gerentes podem gerenciar roles" ON public.flowrev_user_roles
  FOR ALL USING (has_flowrev_role(auth.uid(), 'gerente'));

-- flowrev_produtos
CREATE POLICY "Todos autenticados veem produtos" ON public.flowrev_produtos
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Apenas admins gerenciam produtos" ON public.flowrev_produtos
  FOR ALL USING (is_flowrev_admin(auth.uid()));

-- flowrev_tipos_insumos
CREATE POLICY "Todos autenticados veem tipos" ON public.flowrev_tipos_insumos
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Apenas admins gerenciam tipos" ON public.flowrev_tipos_insumos
  FOR ALL USING (is_flowrev_admin(auth.uid()));

-- flowrev_edicoes
CREATE POLICY "Todos autenticados veem edições" ON public.flowrev_edicoes
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins gerenciam edições" ON public.flowrev_edicoes
  FOR ALL USING (is_flowrev_admin(auth.uid()));

-- flowrev_insumos
CREATE POLICY "Todos autenticados veem insumos" ON public.flowrev_insumos
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Coordenadores/Supervisores podem inserir/editar insumos" ON public.flowrev_insumos
  FOR INSERT WITH CHECK (
    has_flowrev_role(auth.uid(), 'coordenador') OR 
    has_flowrev_role(auth.uid(), 'supervisor') OR
    is_flowrev_admin(auth.uid())
  );

CREATE POLICY "Usuários podem atualizar insumos" ON public.flowrev_insumos
  FOR UPDATE USING (auth.role() = 'authenticated');

-- flowrev_anexos
CREATE POLICY "Todos autenticados veem anexos" ON public.flowrev_anexos
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários podem inserir anexos" ON public.flowrev_anexos
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Usuários podem deletar próprios anexos" ON public.flowrev_anexos
  FOR DELETE USING (uploaded_por = auth.uid() OR is_flowrev_admin(auth.uid()));

-- flowrev_historico
CREATE POLICY "Admins veem histórico" ON public.flowrev_historico
  FOR SELECT USING (is_flowrev_admin(auth.uid()));

CREATE POLICY "Sistema pode inserir histórico" ON public.flowrev_historico
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- flowrev_notificacoes
CREATE POLICY "Usuários veem próprias notificações" ON public.flowrev_notificacoes
  FOR SELECT USING (usuario_id = auth.uid());

CREATE POLICY "Usuários podem atualizar próprias notificações" ON public.flowrev_notificacoes
  FOR UPDATE USING (usuario_id = auth.uid());

CREATE POLICY "Sistema pode criar notificações" ON public.flowrev_notificacoes
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION public.flowrev_update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_flowrev_produtos_timestamp
  BEFORE UPDATE ON public.flowrev_produtos
  FOR EACH ROW EXECUTE FUNCTION public.flowrev_update_timestamp();

CREATE TRIGGER update_flowrev_edicoes_timestamp
  BEFORE UPDATE ON public.flowrev_edicoes
  FOR EACH ROW EXECUTE FUNCTION public.flowrev_update_timestamp();

CREATE TRIGGER update_flowrev_insumos_timestamp
  BEFORE UPDATE ON public.flowrev_insumos
  FOR EACH ROW EXECUTE FUNCTION public.flowrev_update_timestamp();

-- Inserir produtos iniciais
INSERT INTO public.flowrev_produtos (nome, slug, cor_tema, ordem) VALUES
  ('Claro', 'claro', '#DA291C', 1),
  ('iFood', 'ifood', '#EA1D2C', 2),
  ('iFood Pago', 'ifood-pago', '#00A868', 3),
  ('Ton', 'ton', '#00A868', 4),
  ('Inter', 'inter', '#FF7A00', 5)
ON CONFLICT (slug) DO NOTHING;

-- Inserir tipos de insumos
INSERT INTO public.flowrev_tipos_insumos (nome, slug, ordem, requer_imagem) VALUES
  ('Sumário', 'sumario', 1, false),
  ('Princípios Inegociáveis AeC', 'principios-aec', 2, false),
  ('Editorial', 'editorial', 3, false),
  ('Nossa Estrutura', 'nossa-estrutura', 4, true),
  ('Destaques', 'destaques', 5, true),
  ('Mapa de Calor', 'mapa-calor', 6, true),
  ('Big Numbers', 'big-numbers', 7, true),
  ('Ações', 'acoes', 8, true),
  ('Tela em Contexto', 'tela-contexto', 9, true),
  ('Semana do Instrutor', 'semana-instrutor', 10, true),
  ('Black Friday', 'black-friday', 11, true),
  ('Recomeçar', 'recomecar', 12, true),
  ('Galera do Elogio', 'galera-elogio', 13, true),
  ('Promovidos', 'promovidos', 14, true),
  ('Informativos', 'informativos', 15, false),
  ('Curiosidades', 'curiosidades', 16, false),
  ('Jogo', 'jogo', 17, true)
ON CONFLICT (slug) DO NOTHING;