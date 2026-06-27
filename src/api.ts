// Cliente HTTP da InvestTrack API.
//
// - Anexa o token JWT em requisições autenticadas.
// - Tenta renovar o access token automaticamente em caso de 401.
// - Centraliza o tratamento de erros (lança ApiError com mensagem amigável).
import { API_URL } from "./config";
import {
  getAccessToken,
  getRefreshToken,
  logout,
  setAccessToken,
} from "./auth";
import type {
  Aporte,
  AtualizacaoCotacoes,
  Ativo,
  Categoria,
  EvolucaoItem,
  Mercado,
  Resumo,
  Tokens,
  Usuario,
} from "./types";

export class ApiError extends Error {
  status: number;
  data: unknown;
  constructor(status: number, message: string, data: unknown) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

interface RequestOptions {
  method?: string;
  body?: unknown;
  auth?: boolean;
  retry?: boolean;
}

// Extrai uma mensagem legível do corpo de erro do DRF.
function extrairMensagem(data: unknown, status: number): string {
  if (typeof data === "string") return data;
  if (data && typeof data === "object") {
    const obj = data as Record<string, unknown>;
    if (typeof obj.detail === "string") return obj.detail;
    const partes: string[] = [];
    for (const [campo, valor] of Object.entries(obj)) {
      const texto = Array.isArray(valor) ? valor.join(" ") : String(valor);
      partes.push(campo === "non_field_errors" ? texto : `${campo}: ${texto}`);
    }
    if (partes.length) return partes.join(" | ");
  }
  return `Erro ${status}`;
}

async function tentarRenovarToken(): Promise<boolean> {
  const refresh = getRefreshToken();
  if (!refresh) return false;
  const resp = await fetch(`${API_URL}/auth/refresh/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh }),
  });
  if (!resp.ok) return false;
  const data = (await resp.json()) as { access: string };
  setAccessToken(data.access);
  return true;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, auth = true, retry = true } = options;

  const headers: Record<string, string> = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (auth) {
    const token = getAccessToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const resp = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  // Token expirado: tenta renovar uma vez e repete a requisição.
  if (resp.status === 401 && auth && retry) {
    const renovou = await tentarRenovarToken();
    if (renovou) return request<T>(path, { ...options, retry: false });
    logout();
    window.location.href = "index.html";
    throw new ApiError(401, "Sessão expirada. Faça login novamente.", null);
  }

  if (resp.status === 204) return undefined as T;

  const texto = await resp.text();
  const data = texto ? JSON.parse(texto) : null;

  if (!resp.ok) {
    throw new ApiError(resp.status, extrairMensagem(data, resp.status), data);
  }
  return data as T;
}

// ---------------------------------------------------------------------------
// Autenticação e usuário
// ---------------------------------------------------------------------------
export const api = {
  login(username: string, password: string): Promise<Tokens> {
    return request<Tokens>("/auth/login/", {
      method: "POST",
      body: { username, password },
      auth: false,
    });
  },

  registrar(payload: {
    username: string;
    email: string;
    first_name: string;
    password: string;
    password2: string;
  }): Promise<Usuario> {
    return request<Usuario>("/auth/register/", {
      method: "POST",
      body: payload,
      auth: false,
    });
  },

  perfil(): Promise<Usuario> {
    return request<Usuario>("/auth/me/");
  },

  atualizarPerfil(payload: {
    email: string;
    first_name: string;
  }): Promise<Usuario> {
    return request<Usuario>("/auth/me/", { method: "PATCH", body: payload });
  },

  trocarSenha(senha_atual: string, nova_senha: string): Promise<{ detail: string }> {
    return request("/auth/change-password/", {
      method: "POST",
      body: { senha_atual, nova_senha },
    });
  },

  solicitarResetSenha(email: string): Promise<{ detail: string }> {
    return request("/auth/password-reset/", {
      method: "POST",
      body: { email },
      auth: false,
    });
  },

  confirmarResetSenha(
    uid: string,
    token: string,
    nova_senha: string,
  ): Promise<{ detail: string }> {
    return request("/auth/password-reset/confirm/", {
      method: "POST",
      body: { uid, token, nova_senha },
      auth: false,
    });
  },

  // -------------------------------------------------------------------------
  // Categorias
  // -------------------------------------------------------------------------
  listarCategorias(): Promise<Categoria[]> {
    return request<Categoria[]>("/categorias/");
  },

  // -------------------------------------------------------------------------
  // Ativos (CRUD)
  // -------------------------------------------------------------------------
  listarAtivos(busca = ""): Promise<Ativo[]> {
    const q = busca ? `?search=${encodeURIComponent(busca)}` : "";
    return request<Ativo[]>(`/ativos/${q}`);
  },

  criarAtivo(payload: {
    nome: string;
    ticker: string;
    tipo: string;
    categoria: number;
    preco_atual?: string | null;
  }): Promise<Ativo> {
    return request<Ativo>("/ativos/", { method: "POST", body: payload });
  },

  atualizarAtivo(
    id: number,
    payload: {
      nome: string;
      ticker: string;
      tipo: string;
      categoria: number;
      preco_atual?: string | null;
    },
  ): Promise<Ativo> {
    return request<Ativo>(`/ativos/${id}/`, { method: "PUT", body: payload });
  },

  excluirAtivo(id: number): Promise<void> {
    return request<void>(`/ativos/${id}/`, { method: "DELETE" });
  },

  // Atualiza as cotações de todos os ativos do usuário (via Yahoo Finance).
  atualizarCotacoes(): Promise<AtualizacaoCotacoes> {
    return request<AtualizacaoCotacoes>("/ativos/atualizar-cotacoes/", {
      method: "POST",
    });
  },

  // Histórico de preço + indicadores de mercado de um ativo (via Yahoo Finance).
  mercado(id: number): Promise<Mercado> {
    return request<Mercado>(`/ativos/${id}/mercado/`);
  },

  // -------------------------------------------------------------------------
  // Aportes (CRUD)
  // -------------------------------------------------------------------------
  listarAportes(): Promise<Aporte[]> {
    return request<Aporte[]>("/aportes/");
  },

  criarAporte(payload: {
    ativo: number;
    data: string;
    quantidade: string;
    preco_unitario: string;
  }): Promise<Aporte> {
    return request<Aporte>("/aportes/", { method: "POST", body: payload });
  },

  atualizarAporte(
    id: number,
    payload: {
      ativo: number;
      data: string;
      quantidade: string;
      preco_unitario: string;
    },
  ): Promise<Aporte> {
    return request<Aporte>(`/aportes/${id}/`, { method: "PUT", body: payload });
  },

  excluirAporte(id: number): Promise<void> {
    return request<void>(`/aportes/${id}/`, { method: "DELETE" });
  },

  resumo(): Promise<Resumo> {
    return request<Resumo>("/aportes/resumo/");
  },

  // Evolução do patrimônio investido (acumulado mês a mês).
  evolucao(): Promise<EvolucaoItem[]> {
    return request<EvolucaoItem[]>("/aportes/evolucao/");
  },
};
