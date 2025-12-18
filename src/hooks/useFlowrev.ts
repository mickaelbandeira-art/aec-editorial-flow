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

      if (error) {
        console.error("Erro ao buscar produtos:", error);
        throw error;
      }
      console.log("Produtos carregados:", data);
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

export function useUpdateInsumoContent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      insumoId,
      conteudo_texto,
      observacoes
    }: {
      insumoId: string;
      conteudo_texto?: string;
      observacoes?: string;
    }) => {
      const updates: Record<string, unknown> = {};

      if (conteudo_texto !== undefined) updates.conteudo_texto = conteudo_texto;
      if (observacoes !== undefined) updates.observacoes = observacoes;

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

      const edicoesIds = edicoes?.map(e => e.id) || [];

      // Buscar TODOS os insumos das edições do mês
      const { data: insumos, error: insumosError } = await supabase
        .from('flowrev_insumos')
        .select('*, edicao:flowrev_edicoes(mes, ano)')
        .in('edicao_id', edicoesIds);

      if (insumosError) throw insumosError;

      // Calcular estatísticas por edição
      const statsPorEdicao: Record<string, { total: number; aprovados: number; pendentes: number; atrasados: number }> = {};

      const hoje = new Date().toISOString().split('T')[0];

      insumos?.forEach(insumo => {
        if (!statsPorEdicao[insumo.edicao_id]) {
          statsPorEdicao[insumo.edicao_id] = { total: 0, aprovados: 0, pendentes: 0, atrasados: 0 };
        }

        const stats = statsPorEdicao[insumo.edicao_id];
        stats.total++;

        if (insumo.status === 'aprovado') {
          stats.aprovados++;
        } else {
          // Pendentes (qualquer coisa não aprovada)
          stats.pendentes++;

          // Atrasados (não aprovado e data limite passou)
          if (insumo.data_limite && insumo.data_limite < hoje) {
            stats.atrasados++;
          }
        }
      });

      // Totais globais para os cards de cima
      const totalPendentes = insumos?.filter(i => i.status !== 'aprovado').length || 0;
      const totalAtrasados = insumos?.filter(i => i.status !== 'aprovado' && i.data_limite && i.data_limite < hoje).length || 0;

      return {
        edicoes: edicoes || [],
        statsPorEdicao,
        totalPendentes,
        totalAtrasados,
        progressoGeral: edicoes?.reduce((acc, e) => acc + (e.percentual_conclusao || 0), 0) / (edicoes?.length || 1),
      };
    },
  });
}

export function useUploadAnexo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      insumoId,
      file,
      tipo,
      legenda
    }: {
      insumoId: string;
      file: File;
      tipo: 'imagem' | 'pdf';
      legenda?: string;
    }) => {
      // 1. Upload to Storage
      // Create a unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${insumoId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const bucket = 'insumos'; // Assuming a bucket named 'insumos' exists or 'flowrev-insumos'

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, file);

      if (uploadError) {
        // Fallback: if 'insumos' bucket doesn't exist, try a public default
        console.error("Bucket 'insumos' might not exist.", uploadError);
        throw uploadError;
      }

      // 2. Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);

      // 3. Insert into flowrev_anexos
      const { data, error: dbError } = await supabase
        .from('flowrev_anexos')
        .insert({
          insumo_id: insumoId,
          tipo,
          nome_arquivo: file.name,
          url: publicUrl,
          legenda: legenda || null,
          tamanho_bytes: file.size,
          uploaded_por: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single();

      if (dbError) throw dbError;

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flowrev-insumos'] });
    },
  });
}

export function useDeleteAnexo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (anexoId: string) => {
      // 1. Get anexo url to find path
      const { data: anexo, error: fetchError } = await supabase
        .from('flowrev_anexos')
        .select('url')
        .eq('id', anexoId)
        .single();

      if (fetchError) throw fetchError;

      // Extract path from URL (basic logic assuming standard Supabase URL structure)
      // .../storage/v1/object/public/bucket_name/path/to/file
      const urlParts = anexo.url.split('/public/insumos/');
      if (urlParts.length > 1) {
        const path = urlParts[1];
        await supabase.storage.from('insumos').remove([path]);
      }

      // 2. Delete from DB
      const { error: deleteError } = await supabase
        .from('flowrev_anexos')
        .delete()
        .eq('id', anexoId);

      if (deleteError) throw deleteError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flowrev-insumos'] });
    },
  });
}

export function useSyncInsumos() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (edicaoId: string) => {
      // 1. Get all active types
      const { data: tipos, error: tiposError } = await supabase
        .from('flowrev_tipos_insumos')
        .select('id')
        .eq('ativo', true);

      if (tiposError) throw tiposError;

      // 2. Get existing insumos for this edition
      const { data: existingInsumos, error: insumosError } = await supabase
        .from('flowrev_insumos')
        .select('tipo_insumo_id')
        .eq('edicao_id', edicaoId);

      if (insumosError) throw insumosError;

      const existingTypeIds = new Set(existingInsumos?.map(i => i.tipo_insumo_id));

      // 3. Filter missing types
      const missingTypes = tipos?.filter(t => !existingTypeIds.has(t.id)) || [];

      if (missingTypes.length === 0) return { count: 0 };

      // 4. Create missing insumos
      const { error: insertError } = await supabase
        .from('flowrev_insumos')
        .insert(missingTypes.map(t => ({
          edicao_id: edicaoId,
          tipo_insumo_id: t.id,
          status: 'nao_iniciado',
          data_limite: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0) // End of current month
        })));

      if (insertError) throw insertError;

      return { count: missingTypes.length };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flowrev-insumos'] });
    },
  });
}
