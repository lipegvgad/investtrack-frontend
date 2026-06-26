// Tipos compartilhados que espelham os serializers da InvestTrack API.

export interface Tokens {
  access: string;
  refresh: string;
}

export interface Usuario {
  id: number;
  username: string;
  email: string;
  first_name: string;
}

export interface Categoria {
  id: number;
  nome: string;
  descricao: string;
}

export type TipoAtivo = "acao" | "fii" | "renda_fixa" | "cripto" | "outro";

export interface Ativo {
  id: number;
  nome: string;
  ticker: string;
  tipo: TipoAtivo;
  tipo_display: string;
  categoria: number;
  categoria_nome: string;
  preco_atual: string | null;
  preco_atualizado_em: string | null;
  quantidade_total: string;
  total_investido: string;
  preco_medio: string | null;
  valor_atual: string | null;
  lucro: string | null;
  rentabilidade_pct: string | null;
  criado_em: string;
}

export interface Aporte {
  id: number;
  ativo: number;
  ativo_nome: string;
  data: string;
  quantidade: string;
  preco_unitario: string;
  valor_total: string;
}

export interface DistribuicaoItem {
  tipo: string;
  tipo_display: string;
  total: string;
  percentual: string;
}

export interface Resumo {
  total_investido: string;
  patrimonio_atual: string;
  lucro_total: string;
  rentabilidade_pct: string;
  quantidade_aportes: number;
  distribuicao_por_tipo: DistribuicaoItem[];
}

export interface AtualizacaoCotacoes {
  atualizados: number;
  sem_cotacao: string[];
  ativos: Ativo[];
}
