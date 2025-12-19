-- Enable RLS on tables (ensure it's on so policies apply, or disable if we want full open access. keeping on with permissive policies is safer for structure)

-- Policy changes for flowrev_insumos
DROP POLICY IF EXISTS "Todos autenticados veem insumos" ON public.flowrev_insumos;
DROP POLICY IF EXISTS "Coordenadores/Supervisores podem inserir/editar insumos" ON public.flowrev_insumos;
DROP POLICY IF EXISTS "Usuários podem atualizar insumos" ON public.flowrev_insumos;

-- Create permissive policies for 'anon' (since app uses custom auth header bypass/no-auth for DB)
CREATE POLICY "Public Read Insumos" ON public.flowrev_insumos FOR SELECT USING (true);
CREATE POLICY "Public Insert Insumos" ON public.flowrev_insumos FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update Insumos" ON public.flowrev_insumos FOR UPDATE USING (true);
CREATE POLICY "Public Delete Insumos" ON public.flowrev_insumos FOR DELETE USING (true);

-- Policy changes for flowrev_anexos (assuming it might be needed too if not already open)
DROP POLICY IF EXISTS "Todos autenticados veem anexos" ON public.flowrev_anexos;
DROP POLICY IF EXISTS "Usuários podem inserir anexos" ON public.flowrev_anexos;
DROP POLICY IF EXISTS "Usuários podem deletar próprios anexos" ON public.flowrev_anexos;

CREATE POLICY "Public Read Anexos" ON public.flowrev_anexos FOR SELECT USING (true);
CREATE POLICY "Public Insert Anexos" ON public.flowrev_anexos FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update Anexos" ON public.flowrev_anexos FOR UPDATE USING (true);
CREATE POLICY "Public Delete Anexos" ON public.flowrev_anexos FOR DELETE USING (true);

-- Repeat for editions/products just in case
DROP POLICY IF EXISTS "Todos autenticados veem edições" ON public.flowrev_edicoes;
CREATE POLICY "Public Read Edicoes" ON public.flowrev_edicoes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Todos autenticados veem produtos" ON public.flowrev_produtos;
CREATE POLICY "Public Read Produtos" ON public.flowrev_produtos FOR SELECT USING (true);

DROP POLICY IF EXISTS "Todos autenticados veem tipos" ON public.flowrev_tipos_insumos;
CREATE POLICY "Public Read Tipos" ON public.flowrev_tipos_insumos FOR SELECT USING (true);
