// URL base da API. Em build de produção defina VITE_API_URL no ambiente.
// Em desenvolvimento aponta para o backend Django local.
export const API_URL: string =
  (import.meta.env.VITE_API_URL as string | undefined) ??
  "http://localhost:8000/api";
