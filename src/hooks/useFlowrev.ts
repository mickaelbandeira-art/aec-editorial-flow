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
          anexos:flowrev_anexos(*),
          tags:flowrev_insumo_tags(tag:flowrev_tags(*)),
          responsaveis:flowrev_insumo_responsaveis(usuario:flowrev_users(*))
        `)
        .eq('edicao_id', edicaoId)
        .order('created_at');

      if (error) throw error;

      // Transform nested structure to flat arrays
      return (data as any[]).map(item => ({
        ...item,
        tags: item.tags?.map((t: any) => t.tag) || [],
        responsaveis: item.responsaveis?.map((r: any) => r.usuario) || []
      })) as Insumo[];
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
    onMutate: async ({ insumoId, updates }) => {
      await queryClient.cancelQueries({ queryKey: ['flowrev-insumos'] });
      const previousInsumos = queryClient.getQueriesData({ queryKey: ['flowrev-insumos'] });

      queryClient.setQueriesData({ queryKey: ['flowrev-insumos'] }, (old: any) => {
        if (!old) return old;
        if (Array.isArray(old)) {
          return old.map((insumo) =>
            insumo.id === insumoId ? { ...insumo, ...updates } : insumo
          );
        }
        return old;
      });

      return { previousInsumos };
    },
    onError: (err, newTodo, context) => {
      if (context?.previousInsumos) {
        context.previousInsumos.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['flowrev-insumos'] });
    },
  });
}

export function useCreateInsumo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      titulo,
      edicaoId,
      status
    }: {
      titulo: string;
      edicaoId: string;
      status: InsumoStatus;
    }) => {
      // 1. Need a valid tipo_insumo_id. We'll pick the first active one or a default.
      const { data: tipos, error: tiposError } = await supabase
        .from('flowrev_tipos_insumos')
        .select('id')
        .eq('ativo', true)
        .order('ordem')
        .limit(1)
        .single();

      if (tiposError) throw tiposError;
      if (!tipos) throw new Error("Nenhum tipo de insumo ativo encontrado.");

      const { data, error } = await supabase
        .from('flowrev_insumos')
        .insert({
          edicao_id: edicaoId,
          tipo_insumo_id: tipos.id,
          status: status,
          titulo: titulo, // New column
          created_at: new Date().toISOString()
        })
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
    onMutate: async ({ insumoId, status }) => {
      // Cancelar queries em andamento para não sobrescrever o update otimista
      await queryClient.cancelQueries({ queryKey: ['flowrev-all-insumos'] });
      await queryClient.cancelQueries({ queryKey: ['flowrev-insumos'] });

      // Snapshot dos dados anteriores
      const previousAllInsumos = queryClient.getQueryData(['flowrev-all-insumos']);

      // Update Otimista para 'flowrev-all-insumos'
      queryClient.setQueryData(['flowrev-all-insumos'], (old: any) => {
        if (!old || !old.insumos) return old;
        return {
          ...old,
          insumos: old.insumos.map((insumo: Insumo) =>
            insumo.id === insumoId ? { ...insumo, status } : insumo
          ),
        };
      });

      return { previousAllInsumos };
    },
    onError: (err, newTodo, context) => {
      // Rollback em caso de erro
      if (context?.previousAllInsumos) {
        queryClient.setQueryData(['flowrev-all-insumos'], context.previousAllInsumos);
      }
      toast.error("Erro ao atualizar status. Revertendo alteração.");
    },
    onSettled: () => {
      // Revalidar para garantir sincronia
      queryClient.invalidateQueries({ queryKey: ['flowrev-all-insumos'] });
      queryClient.invalidateQueries({ queryKey: ['flowrev-insumos'] });
      queryClient.invalidateQueries({ queryKey: ['flowrev-dashboard-stats'] });
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
      queryClient.invalidateQueries({ queryKey: ['flowrev-all-insumos'] });
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

import { useAuthStore } from './usePermission';

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
      console.log("Iniciando upload...", { insumoId, file, tipo });

      // 1. Upload to Storage
      // Create a unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${insumoId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const bucket = 'flowrev-insumos';

      // Attempt upload
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, file);

      if (uploadError) {
        console.error("Erro no upload Storage:", uploadError);
        throw new Error(`Erro no upload: ${uploadError.message}`);
      }

      // 2. Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);

      // 3. Prepare User ID (Fallback to custom auth store if supabase auth is missing)
      const supabaseUser = (await supabase.auth.getUser()).data.user;
      const customUser = useAuthStore.getState().user;
      let userId = supabaseUser?.id || customUser?.id || null;

      // Fix: 'dev-bypass-id' is not a valid UUID, so we send null to the DB
      if (userId === 'dev-bypass-id') {
        console.warn("Usando 'dev-bypass-id', definindo uploaded_por como NULL para evitar erro de UUID.");
        userId = null;
      }

      console.log("Inserindo anexo no banco...", { publicUrl, userId });

      // 4. Insert into flowrev_anexos
      const { data, error: dbError } = await supabase
        .from('flowrev_anexos')
        .insert({
          insumo_id: insumoId,
          tipo,
          nome_arquivo: file.name,
          url: publicUrl,
          legenda: legenda || null,
          tamanho_bytes: file.size,
          uploaded_por: userId // Use the resolved ID
        })
        .select()
        .single();

      if (dbError) {
        console.error("Erro no insert DB:", dbError);
        throw new Error(`Erro ao salvar no banco: ${dbError.message}`);
      }

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
      const urlParts = anexo.url.split('/public/flowrev-insumos/');
      if (urlParts.length > 1) {
        const path = urlParts[1];
        await supabase.storage.from('flowrev-insumos').remove([path]);
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
          data_limite: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString() // End of current month
        })));

      if (insertError) throw insertError;

      return { count: missingTypes.length };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flowrev-insumos'] });
    },
  });
}

export function useAllInsumos() {
  return useQuery({
    queryKey: ['flowrev-all-insumos'],
    queryFn: async () => {
      const now = new Date();
      const mes = now.getMonth() + 1;
      const ano = now.getFullYear();

      // 1. Get editions
      const { data: edicoes, error: edicoesError } = await supabase
        .from('flowrev_edicoes')
        .select(`
          *,
          produto:flowrev_produtos(*)
        `)
        .eq('mes', mes)
        .eq('ano', ano);

      if (edicoesError) throw edicoesError;
      const edicoesIds = edicoes?.map(e => e.id) || [];

      // We return empty if no editions, but we need the empty structure
      if (edicoesIds.length === 0) return { insumos: [], edicoes: [] };

      // 2. Get insumos
      const { data: insumos, error: insumosError } = await supabase
        .from('flowrev_insumos')
        .select(`
          *,
          tipo_insumo:flowrev_tipos_insumos(*),
          anexos:flowrev_anexos(*),
          edicao:flowrev_edicoes(
            *,
            produto:flowrev_produtos(*)
          )
        `)
        .in('edicao_id', edicoesIds)
        .order('created_at');

      if (insumosError) throw insumosError;
      return { insumos: insumos as Insumo[], edicoes };
    }
  });
}
export function useManagerStats() {
  return useQuery({
    queryKey: ['flowrev-manager-stats'],
    queryFn: async () => {
      const now = new Date();
      const mesAtual = now.getMonth() + 1;
      const anoAtual = now.getFullYear();

      // 1. Fetch current month editions and their insumos
      const { data: edicoesAtual, error: errEdicoes } = await supabase
        .from('flowrev_edicoes')
        .select(`
          *,
          produto:flowrev_produtos(nome, slug)
        `)
        .eq('mes', mesAtual)
        .eq('ano', anoAtual);

      if (errEdicoes) throw errEdicoes;

      const edicoesIds = edicoesAtual?.map(e => e.id) || [];
      const { data: insumosAtual, error: errInsumos } = await supabase
        .from('flowrev_insumos')
        .select(`
          *,
          tipo_insumo:flowrev_tipos_insumos(*),
          edicao:flowrev_edicoes(
            id, 
            produto:flowrev_produtos(nome, slug)
          )
        `)
        .in('edicao_id', edicoesIds);

      if (errInsumos) throw errInsumos;

      // 2. Calculate KPI stats
      const totalInsumos = insumosAtual?.length || 0;
      const concluidos = insumosAtual?.filter(i => i.status === 'aprovado').length || 0;
      const pendentes = totalInsumos - concluidos;
      const today = new Date().toISOString().split('T')[0];
      const atrasados = insumosAtual?.filter(i => i.status !== 'aprovado' && i.data_limite && i.data_limite < today) || [];

      // 3. Product Progress
      const progressoPorProduto = edicoesAtual?.map(edicao => {
        const insumosEdicao = insumosAtual?.filter(i => i.edicao_id === edicao.id) || [];
        const total = insumosEdicao.length;
        const done = insumosEdicao.filter(i => i.status === 'aprovado').length;
        return {
          id: edicao.produto.slug,
          nome: edicao.produto.nome,
          total,
          concluidos: done,
          percentual: total > 0 ? Math.round((done / total) * 100) : 0,
          status: total > 0 && (done / total) === 1 ? 'concluido' : 'em_andamento' // Simplify for now
        };
      }) || [];

      // 4. Phase Progress (Simulated based on status groups)
      const statusFaseMap = {
        'nao_iniciado': 'Kickoff',
        'em_preenchimento': 'Produção',
        'enviado': 'Revisão',
        'em_analise': 'Revisão',
        'ajuste_solicitado': 'Ajustes',
        'aprovado': 'Finalizado'
      };

      const progressoPorFase = Object.values(statusFaseMap).reduce((acc, fase) => {
        acc[fase] = { total: 0, count: 0 };
        return acc;
      }, {} as Record<string, { total: number, count: number }>);

      insumosAtual?.forEach(i => {
        const fase = statusFaseMap[i.status as keyof typeof statusFaseMap] || 'Outros';
        if (progressoPorFase[fase]) {
          progressoPorFase[fase].total++;
          if (i.status === 'aprovado') progressoPorFase[fase].count++; // Rough appx
          // Better logic: Phase is completed if status is beyond it. 
          // For simplicity in this iteration: Count items IN each bucket.
          progressoPorFase[fase].count = insumosAtual.filter(item => statusFaseMap[item.status as keyof typeof statusFaseMap] === fase).length;
        }
      });

      // Re-map for chart
      const dadosFaseChart = Object.entries(progressoPorFase).map(([name, val]) => ({
        name,
        value: val.count
      }));

      // 5. Monthly Comparison (Mocked for previous months if no data exists, or query past months)
      // Querying past 3 months
      const prevMonth = mesAtual === 1 ? 12 : mesAtual - 1;
      const prevYear = mesAtual === 1 ? anoAtual - 1 : anoAtual;

      const { data: edicoesPrev } = await supabase
        .from('flowrev_edicoes')
        .select('percentual_conclusao')
        .eq('mes', prevMonth)
        .eq('ano', prevYear);

      const prevAvg = edicoesPrev && edicoesPrev.length > 0
        ? edicoesPrev.reduce((a, b) => a + (b.percentual_conclusao || 0), 0) / edicoesPrev.length
        : 0;

      return {
        kpis: {
          total: totalInsumos,
          concluidos,
          pendentes,
          atrasadosCount: atrasados.length,
          progressoGeral: totalInsumos > 0 ? Math.round((concluidos / totalInsumos) * 100) : 0
        },
        progressoPorProduto,
        dadosFaseChart,
        atrasadosList: atrasados.map(i => ({
          id: i.id,
          nome: i.tipo_insumo?.nome || 'Insumo',
          produto: i.edicao?.produto?.nome || '?',
          responsavel: 'Equipe', // Placeholder until user assignment implemented
          data_limite: i.data_limite,
          status: i.status
        })),
        comparativoMensal: [
          { name: `${prevMonth}/${prevYear}`, progresso: Math.round(prevAvg) },
          { name: `${mesAtual}/${anoAtual}`, progresso: totalInsumos > 0 ? Math.round((concluidos / totalInsumos) * 100) : 0 }
        ]
      };
    }
  });
}

// --- Tags & Members Hooks ---

export function useTags() {
  return useQuery({
    queryKey: ['flowrev-tags'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('flowrev_tags')
        .select('*')
        .order('nome');
      if (error) throw error;
      return data;
    }
  });
}

export function useUsers() {
  return useQuery({
    queryKey: ['flowrev-users'],
    queryFn: async () => {
      // Fetch users from flowrev_users table
      const { data, error } = await supabase
        .from('flowrev_users')
        .select('id, nome, email, role')
        .order('nome');
      if (error) throw error;
      return data;
    }
  });
}

export function useAddTag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ insumoId, tagId }: { insumoId: string, tagId: string }) => {
      const { error } = await supabase
        .from('flowrev_insumo_tags')
        .insert({ insumo_id: insumoId, tag_id: tagId });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flowrev-insumos'] });
    }
  });
}

export function useRemoveTag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ insumoId, tagId }: { insumoId: string, tagId: string }) => {
      const { error } = await supabase
        .from('flowrev_insumo_tags')
        .delete()
        .eq('insumo_id', insumoId)
        .eq('tag_id', tagId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flowrev-insumos'] });
    }
  });
}

export function useAddMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ insumoId, userId }: { insumoId: string, userId: string }) => {
      const { error } = await supabase
        .from('flowrev_insumo_responsaveis')
        .insert({ insumo_id: insumoId, user_id: userId });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flowrev-insumos'] });
    }
  });
}

export function useRemoveMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ insumoId, userId }: { insumoId: string, userId: string }) => {
      const { error } = await supabase
        .from('flowrev_insumo_responsaveis')
        .delete()
        .eq('insumo_id', insumoId)
        .eq('user_id', userId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flowrev-insumos'] });
    }
  });
}

export function useDeleteInsumo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (insumoId: string) => {
      const { error } = await supabase
        .from('flowrev_insumos')
        .delete()
        .eq('id', insumoId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flowrev-insumos'] });
    },
  });
}

export function useDuplicateInsumo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (originalInsumo: Insumo) => {
      // 1. Prepare copy without ID/dates
      const { id, created_at, updated_at, anexos, tags, responsaveis, ...rest } = originalInsumo;
      const copy = {
        ...rest,
        titulo: `${rest.titulo || 'Sem título'} (Cópia)`,
        created_at: new Date().toISOString()
      };

      // 2. Insert copy
      const { data: newInsumo, error } = await supabase
        .from('flowrev_insumos')
        .insert(copy)
        .select()
        .single();

      if (error) throw error;
      return newInsumo;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flowrev-insumos'] });
    },
  });
}
