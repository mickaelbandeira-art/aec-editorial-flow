-- Refine Insumo Types based on user details
-- We will update names where slugs match to be more specific, and insert new ones.

-- Update existing generic 'acoes' to 'Ações de Clima' if intended, or just insert new ones.
-- The user listed: "Ações de Clima" AND "Ações de Mercado".
-- In the previous migration we had just "Ações". Let's keep "Ações" as generic or update it.
-- Let's just INSERT the specific ones requested for the full "Claro" experience.

INSERT INTO public.flowrev_tipos_insumos (nome, slug, ordem, requer_imagem, requer_pdf, requer_legenda) VALUES
  ('Pesquisas de Satisfação', 'pesquisas-satisfacao', 6, true, false, true),
  ('Ações de Clima', 'acoes-clima', 8, true, false, true),
  ('Ações de Mercado', 'acoes-mercado', 9, true, false, true),
  ('Informativos, Materiais e PodCast', 'informativos-materiais-podcast', 15, false, true, false)
ON CONFLICT (slug) DO UPDATE SET 
  nome = EXCLUDED.nome,
  ordem = EXCLUDED.ordem,
  requer_imagem = EXCLUDED.requer_imagem,
  requer_pdf = EXCLUDED.requer_pdf;

-- Rename 'Informativos' to match if preferred, or delete if replaced.
-- Let's leave 'Informativos' alone as legacy or remove it if we want strict adherence. 
-- For safety, we just add the new specific ones.

-- Ensure correct flags for existing ones
UPDATE public.flowrev_tipos_insumos SET requer_imagem = true, requer_legenda = true WHERE slug = 'nossa-estrutura';
UPDATE public.flowrev_tipos_insumos SET requer_imagem = true, requer_legenda = true WHERE slug = 'destaques';
UPDATE public.flowrev_tipos_insumos SET requer_imagem = true, requer_legenda = true WHERE slug = 'mapa-calor';
UPDATE public.flowrev_tipos_insumos SET requer_imagem = true, requer_legenda = true WHERE slug = 'big-numbers';
UPDATE public.flowrev_tipos_insumos SET requer_imagem = true, requer_legenda = true WHERE slug = 'tela-contexto';
UPDATE public.flowrev_tipos_insumos SET requer_imagem = true, requer_legenda = true WHERE slug = 'semana-instrutor';
UPDATE public.flowrev_tipos_insumos SET requer_imagem = true, requer_legenda = true WHERE slug = 'black-friday';
UPDATE public.flowrev_tipos_insumos SET requer_imagem = true, requer_legenda = true WHERE slug = 'recomecar';
UPDATE public.flowrev_tipos_insumos SET requer_imagem = true, requer_legenda = true WHERE slug = 'galera-elogio';
UPDATE public.flowrev_tipos_insumos SET requer_imagem = true, requer_legenda = true WHERE slug = 'promovidos';
UPDATE public.flowrev_tipos_insumos SET requer_imagem = true, requer_legenda = true WHERE slug = 'jogo';
