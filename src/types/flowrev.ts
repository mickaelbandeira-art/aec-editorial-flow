export type FlowrevRole = 'coordenador' | 'supervisor' | 'analista' | 'gerente';

export type InsumoStatus =
  | 'nao_iniciado'
  | 'em_preenchimento'
  | 'enviado'
  | 'em_analise'
  | 'ajuste_solicitado'
  | 'aprovado';

export type ProducaoFase =
  | 'kickoff'
  | 'envio_textuais'
  | 'envio_dados_finais'
  | 'construcao'
  | 'finalizacao'
  | 'validacao'
  | 'concluido';

export interface Produto {
  id: string;
  nome: string;
  slug: string;
  logo_url: string | null;
  cor_tema: string;
  ativo: boolean;
  ordem: number;
  created_at: string;
  updated_at: string;
}

export interface TipoInsumo {
  id: string;
  nome: string;
  slug: string;
  descricao: string | null;
  ordem: number;
  requer_imagem: boolean;
  requer_legenda: boolean;
  requer_pdf: boolean;
  ativo: boolean;
  created_at: string;
}

export interface Edicao {
  id: string;
  produto_id: string;
  mes: number;
  ano: number;
  fase_atual: ProducaoFase;
  data_kickoff: string | null;
  data_envio_textuais: string | null;
  data_envio_dados: string | null;
  data_construcao_inicio: string | null;
  data_construcao_fim: string | null;
  data_validacao: string | null;
  data_conclusao: string | null;
  percentual_conclusao: number;
  status: string;
  created_at: string;
  updated_at: string;
  produto?: Produto;
}



export interface Anexo {
  id: string;
  insumo_id: string;
  tipo: 'imagem' | 'pdf' | 'outro';
  nome_arquivo: string;
  url: string;
  legenda: string | null;
  tamanho_bytes: number | null;
  uploaded_por: string | null;
  created_at: string;
}

export interface Notificacao {
  id: string;
  usuario_id: string;
  titulo: string;
  mensagem: string;
  tipo: string;
  lida: boolean;
  link: string | null;
  created_at: string;
}

export interface FaseInfo {
  fase: ProducaoFase;
  label: string;
  dataLimite: string;
  diaLimite: number;
  icon: string;
}

export const FASES_PRODUCAO: FaseInfo[] = [
  { fase: 'kickoff', label: 'Kickoff (Alinhamento)', dataLimite: 'Dia 15', diaLimite: 15, icon: '🚀' },
  { fase: 'envio_textuais', label: 'Insumos Textuais', dataLimite: '15 a 25', diaLimite: 25, icon: '📝' },
  { fase: 'envio_dados_finais', label: 'Big Numbers', dataLimite: '25 a 01', diaLimite: 1, icon: '📊' },
  { fase: 'construcao', label: 'Produção', dataLimite: '01 a 09', diaLimite: 9, icon: '🏭' },
  { fase: 'validacao', label: 'Validação', dataLimite: 'Até dia 09', diaLimite: 9, icon: '✅' },
  { fase: 'concluido', label: 'Concluído', dataLimite: '-', diaLimite: 0, icon: '🎉' },
];

export const STATUS_LABELS: Record<InsumoStatus, string> = {
  nao_iniciado: 'Não Iniciado',
  em_preenchimento: 'Em Preenchimento',
  enviado: 'Enviado',
  em_analise: 'Em Análise',
  ajuste_solicitado: 'Ajuste Solicitado',
  aprovado: 'Aprovado',
};

export const STATUS_COLORS: Record<InsumoStatus, string> = {
  nao_iniciado: 'bg-status-nao-iniciado',
  em_preenchimento: 'bg-status-em-preenchimento',
  enviado: 'bg-status-enviado',
  em_analise: 'bg-status-em-analise',
  ajuste_solicitado: 'bg-status-ajuste',
  aprovado: 'bg-status-aprovado',
};

export interface Tag {
  id: string;
  nome: string;
  cor: string;
}

export interface InsumoTag {
  tag: Tag;
}

export interface InsumoResponsavel {
  usuario: {
    id: string;
    nome: string;
    email: string;
    // Add other user fields if needed for UI avatar?
    // flowrev_users usually has 'nome'.
  };
}

export interface Insumo {
  id: string;
  edicao_id: string;
  tipo_insumo_id: string;
  conteudo_texto: string | null;
  observacoes: string | null;
  status: InsumoStatus;
  data_limite: string | null;
  enviado_por: string | null;
  enviado_em: string | null;
  revisado_por: string | null;
  revisado_em: string | null;
  motivo_ajuste: string | null;
  created_at: string;
  updated_at: string;
  tipo_insumo?: TipoInsumo;
  titulo?: string;
  anexos?: Anexo[];
  tags?: Tag[]; // Flat array is easier for UI, but DB returns nested. Ideally we transform it.
  responsaveis?: { id: string, nome: string }[]; // Simplified
}
