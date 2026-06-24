// Armazenamento dos tokens JWT no localStorage e guardas de rota.
import type { Tokens } from "./types";

const ACCESS_KEY = "investtrack_access";
const REFRESH_KEY = "investtrack_refresh";

export function salvarTokens(tokens: Tokens): void {
  localStorage.setItem(ACCESS_KEY, tokens.access);
  localStorage.setItem(REFRESH_KEY, tokens.refresh);
}

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_KEY);
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_KEY);
}

export function setAccessToken(access: string): void {
  localStorage.setItem(ACCESS_KEY, access);
}

export function logout(): void {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

export function estaAutenticado(): boolean {
  return getAccessToken() !== null;
}

// Redireciona para o login se a página exigir autenticação.
export function exigirAutenticacao(): void {
  if (!estaAutenticado()) {
    window.location.href = "index.html";
  }
}

// Redireciona para o app se o usuário já estiver logado (telas públicas).
export function redirecionarSeLogado(): void {
  if (estaAutenticado()) {
    window.location.href = "app.html";
  }
}
