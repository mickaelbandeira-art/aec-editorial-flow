export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      avaliacoes_finais: {
        Row: {
          aluno_id: string | null
          aprovado: boolean | null
          comentarios: string | null
          created_at: string | null
          id: string
          nota: number | null
          turma_id: string | null
        }
        Insert: {
          aluno_id?: string | null
          aprovado?: boolean | null
          comentarios?: string | null
          created_at?: string | null
          id?: string
          nota?: number | null
          turma_id?: string | null
        }
        Update: {
          aluno_id?: string | null
          aprovado?: boolean | null
          comentarios?: string | null
          created_at?: string | null
          id?: string
          nota?: number | null
          turma_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "avaliacoes_finais_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "avaliacoes_finais_turma_id_fkey"
            columns: ["turma_id"]
            isOneToOne: false
            referencedRelation: "turmas"
            referencedColumns: ["id"]
          },
        ]
      }
      avaliacoes_instrutor: {
        Row: {
          aula_duracao_segundos: number | null
          aula_video_url: string | null
          avaliacao_ia: Json | null
          created_at: string | null
          data_gravacao: string | null
          erro_mensagem: string | null
          feedback_melhorias: string | null
          feedback_positivo: string | null
          id: string
          instrutor_id: string
          pontuacao_clareza: number | null
          pontuacao_didatica: number | null
          pontuacao_dominio: number | null
          pontuacao_engajamento: number | null
          pontuacao_geral: number | null
          recomendacoes: string | null
          status: string | null
          titulo_aula: string
          transcricao: string | null
          updated_at: string | null
        }
        Insert: {
          aula_duracao_segundos?: number | null
          aula_video_url?: string | null
          avaliacao_ia?: Json | null
          created_at?: string | null
          data_gravacao?: string | null
          erro_mensagem?: string | null
          feedback_melhorias?: string | null
          feedback_positivo?: string | null
          id?: string
          instrutor_id: string
          pontuacao_clareza?: number | null
          pontuacao_didatica?: number | null
          pontuacao_dominio?: number | null
          pontuacao_engajamento?: number | null
          pontuacao_geral?: number | null
          recomendacoes?: string | null
          status?: string | null
          titulo_aula: string
          transcricao?: string | null
          updated_at?: string | null
        }
        Update: {
          aula_duracao_segundos?: number | null
          aula_video_url?: string | null
          avaliacao_ia?: Json | null
          created_at?: string | null
          data_gravacao?: string | null
          erro_mensagem?: string | null
          feedback_melhorias?: string | null
          feedback_positivo?: string | null
          id?: string
          instrutor_id?: string
          pontuacao_clareza?: number | null
          pontuacao_didatica?: number | null
          pontuacao_dominio?: number | null
          pontuacao_engajamento?: number | null
          pontuacao_geral?: number | null
          recomendacoes?: string | null
          status?: string | null
          titulo_aula?: string
          transcricao?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "avaliacoes_instrutor_instrutor_id_fkey"
            columns: ["instrutor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_history: {
        Row: {
          agente_utilizado: string | null
          client_id: string | null
          contexto: Json | null
          created_at: string | null
          id: string
          mensagem_usuario: string
          rag_sources: Json | null
          resposta_nexus: string
          satisfacao_usuario: number | null
          tempo_resposta_ms: number | null
          user_id: string
        }
        Insert: {
          agente_utilizado?: string | null
          client_id?: string | null
          contexto?: Json | null
          created_at?: string | null
          id?: string
          mensagem_usuario: string
          rag_sources?: Json | null
          resposta_nexus: string
          satisfacao_usuario?: number | null
          tempo_resposta_ms?: number | null
          user_id: string
        }
        Update: {
          agente_utilizado?: string | null
          client_id?: string | null
          contexto?: Json | null
          created_at?: string | null
          id?: string
          mensagem_usuario?: string
          rag_sources?: Json | null
          resposta_nexus?: string
          satisfacao_usuario?: number | null
          tempo_resposta_ms?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_history_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      christmas_players: {
        Row: {
          answers: Json | null
          completed_at: string | null
          created_at: string
          email: string
          id: string
          matricula: string
          name: string
          quiz_attempts: number | null
          score: number
          started_at: string | null
          total_time_seconds: number | null
        }
        Insert: {
          answers?: Json | null
          completed_at?: string | null
          created_at?: string
          email: string
          id?: string
          matricula: string
          name: string
          quiz_attempts?: number | null
          score?: number
          started_at?: string | null
          total_time_seconds?: number | null
        }
        Update: {
          answers?: Json | null
          completed_at?: string | null
          created_at?: string
          email?: string
          id?: string
          matricula?: string
          name?: string
          quiz_attempts?: number | null
          score?: number
          started_at?: string | null
          total_time_seconds?: number | null
        }
        Relationships: []
      }
      christmas_questions: {
        Row: {
          correct_answer: string
          created_at: string
          id: string
          is_active: boolean
          option_a: string
          option_b: string
          option_c: string
          option_d: string
          order_index: number
          question: string
          updated_at: string
        }
        Insert: {
          correct_answer: string
          created_at?: string
          id?: string
          is_active?: boolean
          option_a: string
          option_b: string
          option_c: string
          option_d: string
          order_index?: number
          question: string
          updated_at?: string
        }
        Update: {
          correct_answer?: string
          created_at?: string
          id?: string
          is_active?: boolean
          option_a?: string
          option_b?: string
          option_c?: string
          option_d?: string
          order_index?: number
          question?: string
          updated_at?: string
        }
        Relationships: []
      }
      claro_instructors: {
        Row: {
          created_at: string | null
          employment_type: string
          full_name: string
          id: string
          matricula: string
          status: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          employment_type: string
          full_name: string
          id?: string
          matricula: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          employment_type?: string
          full_name?: string
          id?: string
          matricula?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      claro_segments: {
        Row: {
          cr_code: string
          created_at: string | null
          default_schedule: string
          id: string
          operation_type: string
          segment_name: string
          training_days: number
          updated_at: string | null
        }
        Insert: {
          cr_code: string
          created_at?: string | null
          default_schedule: string
          id?: string
          operation_type: string
          segment_name: string
          training_days: number
          updated_at?: string | null
        }
        Update: {
          cr_code?: string
          created_at?: string | null
          default_schedule?: string
          id?: string
          operation_type?: string
          segment_name?: string
          training_days?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      claro_training_classes: {
        Row: {
          assisted_service_date: string | null
          class_code: string
          class_type: string
          contract_signature_date: string | null
          created_at: string | null
          end_date: string | null
          has_snack: boolean | null
          id: string
          instructor_id: string | null
          medical_exam_date: string | null
          period: string
          segment_id: string | null
          snack_value: number | null
          start_date: string
          status: string
          updated_at: string | null
        }
        Insert: {
          assisted_service_date?: string | null
          class_code: string
          class_type: string
          contract_signature_date?: string | null
          created_at?: string | null
          end_date?: string | null
          has_snack?: boolean | null
          id?: string
          instructor_id?: string | null
          medical_exam_date?: string | null
          period: string
          segment_id?: string | null
          snack_value?: number | null
          start_date: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          assisted_service_date?: string | null
          class_code?: string
          class_type?: string
          contract_signature_date?: string | null
          created_at?: string | null
          end_date?: string | null
          has_snack?: boolean | null
          id?: string
          instructor_id?: string | null
          medical_exam_date?: string | null
          period?: string
          segment_id?: string | null
          snack_value?: number | null
          start_date?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "claro_training_classes_instructor_id_fkey"
            columns: ["instructor_id"]
            isOneToOne: false
            referencedRelation: "claro_instructors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "claro_training_classes_segment_id_fkey"
            columns: ["segment_id"]
            isOneToOne: false
            referencedRelation: "claro_segments"
            referencedColumns: ["id"]
          },
        ]
      }
      clientes: {
        Row: {
          created_at: string | null
          descricao: string | null
          id: string
          logo: string | null
          nome: string
        }
        Insert: {
          created_at?: string | null
          descricao?: string | null
          id?: string
          logo?: string | null
          nome: string
        }
        Update: {
          created_at?: string | null
          descricao?: string | null
          id?: string
          logo?: string | null
          nome?: string
        }
        Relationships: []
      }
      clients: {
        Row: {
          ai_config: Json | null
          created_at: string | null
          id: string
          is_active: boolean | null
          logo_url: string | null
          name: string
          slug: string
          theme_config: Json | null
          updated_at: string | null
        }
        Insert: {
          ai_config?: Json | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name: string
          slug: string
          theme_config?: Json | null
          updated_at?: string | null
        }
        Update: {
          ai_config?: Json | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name?: string
          slug?: string
          theme_config?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      cursos_obrigatorios: {
        Row: {
          conteudo_url: string | null
          created_at: string | null
          descricao: string | null
          id: string
          segmento_id: string | null
          titulo: string
        }
        Insert: {
          conteudo_url?: string | null
          created_at?: string | null
          descricao?: string | null
          id?: string
          segmento_id?: string | null
          titulo: string
        }
        Update: {
          conteudo_url?: string | null
          created_at?: string | null
          descricao?: string | null
          id?: string
          segmento_id?: string | null
          titulo?: string
        }
        Relationships: [
          {
            foreignKeyName: "cursos_obrigatorios_segmento_id_fkey"
            columns: ["segmento_id"]
            isOneToOne: false
            referencedRelation: "segmentos"
            referencedColumns: ["id"]
          },
        ]
      }
      desempenho_usuarios: {
        Row: {
          created_at: string | null
          csat_score: number | null
          data_conclusao_formacao: string | null
          data_inicio_formacao: string | null
          horas_treinamento: number | null
          id: string
          perfil_comportamental: string | null
          skill_digitacao: number | null
          skill_portugues: number | null
          status_formacao: string | null
          taxa_reincidencia: number | null
          tmo_medio: number | null
          total_faltas: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          csat_score?: number | null
          data_conclusao_formacao?: string | null
          data_inicio_formacao?: string | null
          horas_treinamento?: number | null
          id?: string
          perfil_comportamental?: string | null
          skill_digitacao?: number | null
          skill_portugues?: number | null
          status_formacao?: string | null
          taxa_reincidencia?: number | null
          tmo_medio?: number | null
          total_faltas?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          csat_score?: number | null
          data_conclusao_formacao?: string | null
          data_inicio_formacao?: string | null
          horas_treinamento?: number | null
          id?: string
          perfil_comportamental?: string | null
          skill_digitacao?: number | null
          skill_portugues?: number | null
          status_formacao?: string | null
          taxa_reincidencia?: number | null
          tmo_medio?: number | null
          total_faltas?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "desempenho_usuarios_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      documents_embeddings: {
        Row: {
          chunk_index: number | null
          chunk_text: string
          client_id: string | null
          created_at: string | null
          document_name: string
          document_type: string | null
          embedding: string | null
          id: string
          metadata: Json | null
          source_url: string | null
          updated_at: string | null
        }
        Insert: {
          chunk_index?: number | null
          chunk_text: string
          client_id?: string | null
          created_at?: string | null
          document_name: string
          document_type?: string | null
          embedding?: string | null
          id?: string
          metadata?: Json | null
          source_url?: string | null
          updated_at?: string | null
        }
        Update: {
          chunk_index?: number | null
          chunk_text?: string
          client_id?: string | null
          created_at?: string | null
          document_name?: string
          document_type?: string | null
          embedding?: string | null
          id?: string
          metadata?: Json | null
          source_url?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_embeddings_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      flowrev_anexos: {
        Row: {
          created_at: string | null
          id: string
          insumo_id: string
          legenda: string | null
          nome_arquivo: string
          tamanho_bytes: number | null
          tipo: string
          uploaded_por: string | null
          url: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          insumo_id: string
          legenda?: string | null
          nome_arquivo: string
          tamanho_bytes?: number | null
          tipo: string
          uploaded_por?: string | null
          url: string
        }
        Update: {
          created_at?: string | null
          id?: string
          insumo_id?: string
          legenda?: string | null
          nome_arquivo?: string
          tamanho_bytes?: number | null
          tipo?: string
          uploaded_por?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "flowrev_anexos_insumo_id_fkey"
            columns: ["insumo_id"]
            isOneToOne: false
            referencedRelation: "flowrev_insumos"
            referencedColumns: ["id"]
          },
        ]
      }
      flowrev_edicoes: {
        Row: {
          ano: number
          created_at: string | null
          data_conclusao: string | null
          data_construcao_fim: string | null
          data_construcao_inicio: string | null
          data_envio_dados: string | null
          data_envio_textuais: string | null
          data_kickoff: string | null
          data_validacao: string | null
          fase_atual: Database["public"]["Enums"]["producao_fase"] | null
          id: string
          mes: number
          percentual_conclusao: number | null
          produto_id: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          ano: number
          created_at?: string | null
          data_conclusao?: string | null
          data_construcao_fim?: string | null
          data_construcao_inicio?: string | null
          data_envio_dados?: string | null
          data_envio_textuais?: string | null
          data_kickoff?: string | null
          data_validacao?: string | null
          fase_atual?: Database["public"]["Enums"]["producao_fase"] | null
          id?: string
          mes: number
          percentual_conclusao?: number | null
          produto_id: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          ano?: number
          created_at?: string | null
          data_conclusao?: string | null
          data_construcao_fim?: string | null
          data_construcao_inicio?: string | null
          data_envio_dados?: string | null
          data_envio_textuais?: string | null
          data_kickoff?: string | null
          data_validacao?: string | null
          fase_atual?: Database["public"]["Enums"]["producao_fase"] | null
          id?: string
          mes?: number
          percentual_conclusao?: number | null
          produto_id?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "flowrev_edicoes_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "flowrev_produtos"
            referencedColumns: ["id"]
          },
        ]
      }
      flowrev_historico: {
        Row: {
          acao: string
          created_at: string | null
          dados_anteriores: Json | null
          dados_novos: Json | null
          id: string
          insumo_id: string
          usuario_id: string | null
        }
        Insert: {
          acao: string
          created_at?: string | null
          dados_anteriores?: Json | null
          dados_novos?: Json | null
          id?: string
          insumo_id: string
          usuario_id?: string | null
        }
        Update: {
          acao?: string
          created_at?: string | null
          dados_anteriores?: Json | null
          dados_novos?: Json | null
          id?: string
          insumo_id?: string
          usuario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "flowrev_historico_insumo_id_fkey"
            columns: ["insumo_id"]
            isOneToOne: false
            referencedRelation: "flowrev_insumos"
            referencedColumns: ["id"]
          },
        ]
      }
      flowrev_insumos: {
        Row: {
          conteudo_texto: string | null
          created_at: string | null
          data_limite: string | null
          edicao_id: string
          enviado_em: string | null
          enviado_por: string | null
          id: string
          motivo_ajuste: string | null
          observacoes: string | null
          revisado_em: string | null
          revisado_por: string | null
          status: Database["public"]["Enums"]["insumo_status"] | null
          tipo_insumo_id: string
          updated_at: string | null
        }
        Insert: {
          conteudo_texto?: string | null
          created_at?: string | null
          data_limite?: string | null
          edicao_id: string
          enviado_em?: string | null
          enviado_por?: string | null
          id?: string
          motivo_ajuste?: string | null
          observacoes?: string | null
          revisado_em?: string | null
          revisado_por?: string | null
          status?: Database["public"]["Enums"]["insumo_status"] | null
          tipo_insumo_id: string
          updated_at?: string | null
        }
        Update: {
          conteudo_texto?: string | null
          created_at?: string | null
          data_limite?: string | null
          edicao_id?: string
          enviado_em?: string | null
          enviado_por?: string | null
          id?: string
          motivo_ajuste?: string | null
          observacoes?: string | null
          revisado_em?: string | null
          revisado_por?: string | null
          status?: Database["public"]["Enums"]["insumo_status"] | null
          tipo_insumo_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "flowrev_insumos_edicao_id_fkey"
            columns: ["edicao_id"]
            isOneToOne: false
            referencedRelation: "flowrev_edicoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "flowrev_insumos_tipo_insumo_id_fkey"
            columns: ["tipo_insumo_id"]
            isOneToOne: false
            referencedRelation: "flowrev_tipos_insumos"
            referencedColumns: ["id"]
          },
        ]
      }
      flowrev_notificacoes: {
        Row: {
          created_at: string | null
          id: string
          lida: boolean | null
          link: string | null
          mensagem: string
          tipo: string | null
          titulo: string
          usuario_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          lida?: boolean | null
          link?: string | null
          mensagem: string
          tipo?: string | null
          titulo: string
          usuario_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          lida?: boolean | null
          link?: string | null
          mensagem?: string
          tipo?: string | null
          titulo?: string
          usuario_id?: string
        }
        Relationships: []
      }
      flowrev_produtos: {
        Row: {
          ativo: boolean | null
          cor_tema: string | null
          created_at: string | null
          id: string
          logo_url: string | null
          nome: string
          ordem: number | null
          slug: string
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean | null
          cor_tema?: string | null
          created_at?: string | null
          id?: string
          logo_url?: string | null
          nome: string
          ordem?: number | null
          slug: string
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean | null
          cor_tema?: string | null
          created_at?: string | null
          id?: string
          logo_url?: string | null
          nome?: string
          ordem?: number | null
          slug?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      flowrev_tipos_insumos: {
        Row: {
          ativo: boolean | null
          created_at: string | null
          descricao: string | null
          id: string
          nome: string
          ordem: number | null
          requer_imagem: boolean | null
          requer_legenda: boolean | null
          requer_pdf: boolean | null
          slug: string
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string | null
          descricao?: string | null
          id?: string
          nome: string
          ordem?: number | null
          requer_imagem?: boolean | null
          requer_legenda?: boolean | null
          requer_pdf?: boolean | null
          slug: string
        }
        Update: {
          ativo?: boolean | null
          created_at?: string | null
          descricao?: string | null
          id?: string
          nome?: string
          ordem?: number | null
          requer_imagem?: boolean | null
          requer_legenda?: boolean | null
          requer_pdf?: boolean | null
          slug?: string
        }
        Relationships: []
      }
      flowrev_user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["flowrev_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["flowrev_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["flowrev_role"]
          user_id?: string
        }
        Relationships: []
      }
      hierarquia: {
        Row: {
          cargo: string
          created_at: string | null
          id: string
          nivel: number
        }
        Insert: {
          cargo: string
          created_at?: string | null
          id?: string
          nivel: number
        }
        Update: {
          cargo?: string
          created_at?: string | null
          id?: string
          nivel?: number
        }
        Relationships: []
      }
      logs_ai: {
        Row: {
          acao: string | null
          created_at: string | null
          id: string
          modelo: string | null
          prompt: string | null
          resposta: string | null
          usuario_id: string | null
        }
        Insert: {
          acao?: string | null
          created_at?: string | null
          id?: string
          modelo?: string | null
          prompt?: string | null
          resposta?: string | null
          usuario_id?: string | null
        }
        Update: {
          acao?: string | null
          created_at?: string | null
          id?: string
          modelo?: string | null
          prompt?: string | null
          resposta?: string | null
          usuario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "logs_ai_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      participants: {
        Row: {
          cargo: string
          coordinator: string
          created_at: string | null
          email: string
          hierarchy_level: Database["public"]["Enums"]["hierarchy_level"]
          id: string
          is_active: boolean | null
          leave_type: string | null
          manager: string | null
          name: string
          network_login: string | null
          operation_origin: string | null
          registration: string
          return_date: string | null
          supervisor: string | null
          updated_at: string | null
        }
        Insert: {
          cargo: string
          coordinator: string
          created_at?: string | null
          email: string
          hierarchy_level: Database["public"]["Enums"]["hierarchy_level"]
          id?: string
          is_active?: boolean | null
          leave_type?: string | null
          manager?: string | null
          name: string
          network_login?: string | null
          operation_origin?: string | null
          registration: string
          return_date?: string | null
          supervisor?: string | null
          updated_at?: string | null
        }
        Update: {
          cargo?: string
          coordinator?: string
          created_at?: string | null
          email?: string
          hierarchy_level?: Database["public"]["Enums"]["hierarchy_level"]
          id?: string
          is_active?: boolean | null
          leave_type?: string | null
          manager?: string | null
          name?: string
          network_login?: string | null
          operation_origin?: string | null
          registration?: string
          return_date?: string | null
          supervisor?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      presenca_diaria: {
        Row: {
          aluno_id: string | null
          created_at: string | null
          data: string
          id: string
          justificativa: string | null
          presente: boolean | null
          turma_id: string | null
        }
        Insert: {
          aluno_id?: string | null
          created_at?: string | null
          data: string
          id?: string
          justificativa?: string | null
          presente?: boolean | null
          turma_id?: string | null
        }
        Update: {
          aluno_id?: string | null
          created_at?: string | null
          data?: string
          id?: string
          justificativa?: string | null
          presente?: boolean | null
          turma_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "presenca_diaria_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "presenca_diaria_turma_id_fkey"
            columns: ["turma_id"]
            isOneToOne: false
            referencedRelation: "turmas"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          cargo: string | null
          client_id: string | null
          cpf: string | null
          created_at: string | null
          email: string
          empresa: string | null
          full_name: string
          id: string
          matricula: string | null
          role: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          cargo?: string | null
          client_id?: string | null
          cpf?: string | null
          created_at?: string | null
          email: string
          empresa?: string | null
          full_name: string
          id: string
          matricula?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          cargo?: string | null
          client_id?: string | null
          cpf?: string | null
          created_at?: string | null
          email?: string
          empresa?: string | null
          full_name?: string
          id?: string
          matricula?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      reciclagens: {
        Row: {
          aprovado: boolean | null
          created_at: string | null
          data_conclusao: string | null
          data_inicio: string | null
          data_prevista_conclusao: string | null
          descricao: string | null
          gestor_responsavel: string | null
          id: string
          instrutor_responsavel: string | null
          motivo: string
          nota_final: number | null
          observacoes: string | null
          prioridade: string | null
          status: string | null
          tipo_reciclagem: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          aprovado?: boolean | null
          created_at?: string | null
          data_conclusao?: string | null
          data_inicio?: string | null
          data_prevista_conclusao?: string | null
          descricao?: string | null
          gestor_responsavel?: string | null
          id?: string
          instrutor_responsavel?: string | null
          motivo: string
          nota_final?: number | null
          observacoes?: string | null
          prioridade?: string | null
          status?: string | null
          tipo_reciclagem: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          aprovado?: boolean | null
          created_at?: string | null
          data_conclusao?: string | null
          data_inicio?: string | null
          data_prevista_conclusao?: string | null
          descricao?: string | null
          gestor_responsavel?: string | null
          id?: string
          instrutor_responsavel?: string | null
          motivo?: string
          nota_final?: number | null
          observacoes?: string | null
          prioridade?: string | null
          status?: string | null
          tipo_reciclagem?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reciclagens_gestor_responsavel_fkey"
            columns: ["gestor_responsavel"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reciclagens_instrutor_responsavel_fkey"
            columns: ["instrutor_responsavel"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reciclagens_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      salas: {
        Row: {
          capacidade: number | null
          created_at: string | null
          id: string
          localizacao: string | null
          nome: string
        }
        Insert: {
          capacidade?: number | null
          created_at?: string | null
          id?: string
          localizacao?: string | null
          nome: string
        }
        Update: {
          capacidade?: number | null
          created_at?: string | null
          id?: string
          localizacao?: string | null
          nome?: string
        }
        Relationships: []
      }
      segmentos: {
        Row: {
          cliente_id: string | null
          created_at: string | null
          id: string
          nome: string
        }
        Insert: {
          cliente_id?: string | null
          created_at?: string | null
          id?: string
          nome: string
        }
        Update: {
          cliente_id?: string | null
          created_at?: string | null
          id?: string
          nome?: string
        }
        Relationships: [
          {
            foreignKeyName: "segmentos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      test_results: {
        Row: {
          answers: Json | null
          completed_at: string | null
          created_at: string | null
          dominant_profile: string
          email: string
          id: string
          name: string
          participant_id: string | null
          registration: string
          score_c: number
          score_d: number
          score_i: number
          score_s: number
          test_duration_seconds: number | null
        }
        Insert: {
          answers?: Json | null
          completed_at?: string | null
          created_at?: string | null
          dominant_profile: string
          email: string
          id?: string
          name: string
          participant_id?: string | null
          registration: string
          score_c: number
          score_d: number
          score_i: number
          score_s: number
          test_duration_seconds?: number | null
        }
        Update: {
          answers?: Json | null
          completed_at?: string | null
          created_at?: string | null
          dominant_profile?: string
          email?: string
          id?: string
          name?: string
          participant_id?: string | null
          registration?: string
          score_c?: number
          score_d?: number
          score_i?: number
          score_s?: number
          test_duration_seconds?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "test_results_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "participants"
            referencedColumns: ["id"]
          },
        ]
      }
      trainings: {
        Row: {
          category: string | null
          client_id: string | null
          content: string | null
          content_type: string | null
          created_at: string | null
          description: string | null
          difficulty: string | null
          duration_minutes: number | null
          id: string
          is_published: boolean | null
          order_index: number | null
          pdf_url: string | null
          quiz_data: Json | null
          tags: string[] | null
          title: string
          updated_at: string | null
          video_url: string | null
        }
        Insert: {
          category?: string | null
          client_id?: string | null
          content?: string | null
          content_type?: string | null
          created_at?: string | null
          description?: string | null
          difficulty?: string | null
          duration_minutes?: number | null
          id?: string
          is_published?: boolean | null
          order_index?: number | null
          pdf_url?: string | null
          quiz_data?: Json | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
          video_url?: string | null
        }
        Update: {
          category?: string | null
          client_id?: string | null
          content?: string | null
          content_type?: string | null
          created_at?: string | null
          description?: string | null
          difficulty?: string | null
          duration_minutes?: number | null
          id?: string
          is_published?: boolean | null
          order_index?: number | null
          pdf_url?: string | null
          quiz_data?: Json | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "trainings_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      turmas: {
        Row: {
          codigo: string
          created_at: string | null
          data_fim: string | null
          data_inicio: string | null
          id: string
          instrutor_id: string | null
          segmento_id: string | null
          status: string | null
        }
        Insert: {
          codigo: string
          created_at?: string | null
          data_fim?: string | null
          data_inicio?: string | null
          id?: string
          instrutor_id?: string | null
          segmento_id?: string | null
          status?: string | null
        }
        Update: {
          codigo?: string
          created_at?: string | null
          data_fim?: string | null
          data_inicio?: string | null
          id?: string
          instrutor_id?: string | null
          segmento_id?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "turmas_instrutor_id_fkey"
            columns: ["instrutor_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "turmas_segmento_id_fkey"
            columns: ["segmento_id"]
            isOneToOne: false
            referencedRelation: "segmentos"
            referencedColumns: ["id"]
          },
        ]
      }
      typing_test_results: {
        Row: {
          accuracy: number
          created_at: string
          difficulty: string
          duration_seconds: number
          errors_count: number
          id: string
          test_type: string
          user_id: string
          wpm: number
        }
        Insert: {
          accuracy: number
          created_at?: string
          difficulty: string
          duration_seconds: number
          errors_count: number
          id?: string
          test_type: string
          user_id: string
          wpm: number
        }
        Update: {
          accuracy?: number
          created_at?: string
          difficulty?: string
          duration_seconds?: number
          errors_count?: number
          id?: string
          test_type?: string
          user_id?: string
          wpm?: number
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          achievements: Json | null
          badges: Json | null
          client_id: string | null
          created_at: string | null
          experience_points: number | null
          id: string
          last_activity_date: string | null
          level: number | null
          perfect_scores: number | null
          rank_position: number | null
          streak_days: number | null
          total_points: number | null
          trainings_completed: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          achievements?: Json | null
          badges?: Json | null
          client_id?: string | null
          created_at?: string | null
          experience_points?: number | null
          id?: string
          last_activity_date?: string | null
          level?: number | null
          perfect_scores?: number | null
          rank_position?: number | null
          streak_days?: number | null
          total_points?: number | null
          trainings_completed?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          achievements?: Json | null
          badges?: Json | null
          client_id?: string | null
          created_at?: string | null
          experience_points?: number | null
          id?: string
          last_activity_date?: string | null
          level?: number | null
          perfect_scores?: number | null
          rank_position?: number | null
          streak_days?: number | null
          total_points?: number | null
          trainings_completed?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_achievements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_progress: {
        Row: {
          completed_at: string | null
          created_at: string | null
          id: string
          last_accessed_at: string | null
          progress_percentage: number | null
          quiz_answers: Json | null
          quiz_attempts: number | null
          quiz_score: number | null
          started_at: string | null
          status: string | null
          time_spent_minutes: number | null
          training_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          progress_percentage?: number | null
          quiz_answers?: Json | null
          quiz_attempts?: number | null
          quiz_score?: number | null
          started_at?: string | null
          status?: string | null
          time_spent_minutes?: number | null
          training_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          progress_percentage?: number | null
          quiz_answers?: Json | null
          quiz_attempts?: number | null
          quiz_score?: number | null
          started_at?: string | null
          status?: string | null
          time_spent_minutes?: number | null
          training_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_progress_training_id_fkey"
            columns: ["training_id"]
            isOneToOne: false
            referencedRelation: "trainings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      usuarios: {
        Row: {
          ativo: boolean | null
          cliente_id: string | null
          created_at: string | null
          email: string
          hierarquia_id: string | null
          id: string
          nome: string
          senha_hash: string | null
        }
        Insert: {
          ativo?: boolean | null
          cliente_id?: string | null
          created_at?: string | null
          email: string
          hierarquia_id?: string | null
          id?: string
          nome: string
          senha_hash?: string | null
        }
        Update: {
          ativo?: boolean | null
          cliente_id?: string | null
          created_at?: string | null
          email?: string
          hierarquia_id?: string | null
          id?: string
          nome?: string
          senha_hash?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "usuarios_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "usuarios_hierarquia_id_fkey"
            columns: ["hierarquia_id"]
            isOneToOne: false
            referencedRelation: "hierarquia"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      dashboard_stats: {
        Row: {
          completion_rate: number | null
          pending_tests: number | null
          total_completed_tests: number | null
          total_participants: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      has_flowrev_role: {
        Args: {
          _role: Database["public"]["Enums"]["flowrev_role"]
          _user_id: string
        }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_flowrev_admin: { Args: { _user_id: string }; Returns: boolean }
      match_documents: {
        Args: {
          filter_client_id: string
          match_count: number
          match_threshold: number
          query_embedding: string
        }
        Returns: {
          chunk_index: number
          chunk_text: string
          document_name: string
          id: string
          metadata: Json
          similarity: number
        }[]
      }
      search_participants: {
        Args: {
          filter_cargo?: string
          filter_coordinator?: string
          filter_status?: string
          search_text?: string
        }
        Returns: {
          cargo: string
          coordinator: string
          dominant_profile: string
          email: string
          has_completed_test: boolean
          id: string
          name: string
          registration: string
          score_c: number
          score_d: number
          score_i: number
          score_s: number
        }[]
      }
      update_rankings: { Args: never; Returns: undefined }
    }
    Enums: {
      app_role:
        | "admin"
        | "viewer"
        | "manager"
        | "coordinator"
        | "gestor"
        | "instrutor"
        | "veterano"
        | "novato"
      flowrev_role: "coordenador" | "supervisor" | "analista" | "gerente"
      hierarchy_level: "gerente" | "coordenador" | "supervisor" | "colaborador"
      insumo_status:
        | "nao_iniciado"
        | "em_preenchimento"
        | "enviado"
        | "em_analise"
        | "ajuste_solicitado"
        | "aprovado"
      producao_fase:
        | "kickoff"
        | "envio_textuais"
        | "envio_dados_finais"
        | "construcao"
        | "finalizacao"
        | "validacao"
        | "concluido"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: [
        "admin",
        "viewer",
        "manager",
        "coordinator",
        "gestor",
        "instrutor",
        "veterano",
        "novato",
      ],
      flowrev_role: ["coordenador", "supervisor", "analista", "gerente"],
      hierarchy_level: ["gerente", "coordenador", "supervisor", "colaborador"],
      insumo_status: [
        "nao_iniciado",
        "em_preenchimento",
        "enviado",
        "em_analise",
        "ajuste_solicitado",
        "aprovado",
      ],
      producao_fase: [
        "kickoff",
        "envio_textuais",
        "envio_dados_finais",
        "construcao",
        "finalizacao",
        "validacao",
        "concluido",
      ],
    },
  },
} as const
