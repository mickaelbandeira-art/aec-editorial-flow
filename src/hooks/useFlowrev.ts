import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Produto, TipoInsumo, Edicao, Insumo, InsumoStatus } from '@/types/flowrev';

export function useProdutos() {
  return useQuery({
    queryKey: ['flowrev-produtos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('flowrev_produtos')
        .select('*')
        .eq('ativo', true)
        .order('ordem');
      
      if (error) throw error;
      return data as Produto[];
    },
  });
}

export function useTiposInsumos() {
  return useQuery({
    queryKey: ['flowrev-tipos-insumos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('flowrev_tipos_insumos')
        .select('*')
        .eq('ativo', true)
        .order('ordem');
      
      if (error) throw error;
      return data as TipoInsumo[];
    },
  });
}

export function useEdicoes(produtoId?: string) {
  return useQuery({
    queryKey: ['flowrev-edicoes', produtoId],
    queryFn: async () => {
      let query = supabase
        .from('flowrev_edicoes')
        .select(`
          *,
          produto:flowrev_produtos(*)
        `)
        .order('ano', { ascending: false })
        .order('mes', { ascending: false });

      if (produtoId) {
        query = query.eq('produto_id', produtoId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Edicao[];
    },
    enabled: true,
  });
}

export function useEdicaoAtual(produtoId: string) {
  const now = new Date();
  const mes = now.getMonth() + 1;
  const ano = now.getFullYear();

  return useQuery({
    queryKey: ['flowrev-edicao-atual', produtoId, mes, ano],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('flowrev_edicoes')
        .select(`
          *,
          produto:flowrev_produtos(*)
        `)
        .eq('produto_id', produtoId)
        .eq('mes', mes)
        .eq('ano', ano)
        .maybeSingle();

      if (error) throw error;
      return data as Edicao | null;
    },
    enabled: !!produtoId,
  });
}

export function useInsumos(edicaoId?: string) {
  return useQuery({
    queryKey: ['flowrev-insumos', edicaoId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('flowrev_insumos')
        .select(`
          *,
          tipo_insumo:flowrev_tipos_insumos(*),
          anexos:flowrev_anexos(*)
        `)
        .eq('edicao_id', edicaoId)
        .order('created_at');

      if (error) throw error;
      return data as Insumo[];
    },
    enabled: !!edicaoId,
  });
}

export function useUpdateInsumo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      insumoId, 
      updates 
    }: { 
      insumoId: string; 
      updates: Partial<Insumo>;
    }) => {
      const { data, error } = await supabase
        .from('flowrev_insumos')
        .update(updates)
        .eq('id', insumoId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flowrev-insumos'] });
    },
  });
}

export function useUpdateInsumoStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      insumoId, 
      status,
      motivo_ajuste
    }: { 
      insumoId: string; 
      status: InsumoStatus;
      motivo_ajuste?: string;
    }) => {
      const updates: Record<string, unknown> = { status };
      
      if (status === 'ajuste_solicitado' && motivo_ajuste) {
        updates.motivo_ajuste = motivo_ajuste;
      }
      
      if (status === 'enviado') {
        updates.enviado_em = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('flowrev_insumos')
        .update(updates)
        .eq('id', insumoId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flowrev-insumos'] });
    },
  });
}

export function useCreateEdicao() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      produtoId, 
      mes, 
      ano 
    }: { 
      produtoId: string; 
      mes: number; 
      ano: number;
    }) => {
      // Criar edição
      const { data: edicao, error: edicaoError } = await supabase
        .from('flowrev_edicoes')
        .insert({
          produto_id: produtoId,
          mes,
          ano,
          fase_atual: 'kickoff',
        })
        .select()
        .single();

      if (edicaoError) throw edicaoError;

      // Buscar tipos de insumos
      const { data: tipos, error: tiposError } = await supabase
        .from('flowrev_tipos_insumos')
        .select('id')
        .eq('ativo', true);

      if (tiposError) throw tiposError;

      // Criar insumos para cada tipo
      const insumos = tipos.map(tipo => ({
        edicao_id: edicao.id,
        tipo_insumo_id: tipo.id,
        status: 'nao_iniciado' as const,
      }));

      const { error: insumosError } = await supabase
        .from('flowrev_insumos')
        .insert(insumos);

      if (insumosError) throw insumosError;

      return edicao;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flowrev-edicoes'] });
    },
  });
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ['flowrev-dashboard-stats'],
    queryFn: async () => {
      const now = new Date();
      const mes = now.getMonth() + 1;
      const ano = now.getFullYear();

      // Buscar edições do mês atual
      const { data: edicoes, error: edicoesError } = await supabase
        .from('flowrev_edicoes')
        .select(`
          *,
          produto:flowrev_produtos(nome, slug)
        `)
        .eq('mes', mes)
        .eq('ano', ano);

      if (edicoesError) throw edicoesError;

      // Buscar insumos pendentes
      const { data: insumosPendentes, error: insumosError } = await supabase
        .from('flowrev_insumos')
        .select('*, edicao:flowrev_edicoes(mes, ano)')
        .in('status', ['nao_iniciado', 'em_preenchimento', 'ajuste_solicitado']);

      if (insumosError) throw insumosError;

      // Buscar insumos atrasados (com data_limite passada e não aprovados)
      const { data: insumosAtrasados, error: atrasadosError } = await supabase
        .from('flowrev_insumos')
        .select('*')
        .lt('data_limite', new Date().toISOString().split('T')[0])
        .neq('status', 'aprovado');

      if (atrasadosError) throw atrasadosError;

      return {
        edicoes: edicoes || [],
        totalPendentes: insumosPendentes?.length || 0,
        totalAtrasados: insumosAtrasados?.length || 0,
        progressoGeral: edicoes?.reduce((acc, e) => acc + (e.percentual_conclusao || 0), 0) / (edicoes?.length || 1),
      };
    },
  });
}
