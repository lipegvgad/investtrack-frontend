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
  total_investido: string;
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
}

export interface Resumo {
  total_investido: string;
  quantidade_aportes: number;
  distribuicao_por_tipo: DistribuicaoItem[];
}
